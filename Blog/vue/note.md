## vue2.0 踩坑

#### 1.导出的 css 路径，问题解决

vue-cli2 版本中默认使用了 ExtractTextPlugin 插件，来合并各个 vue 文件的 css。

build/utils.js:

```js
if (options.extract) {
  return ExtractTextPlugin.extract({
    use: loaders,
    publicPath: "../../", // 注意配置这一部分，根据目录结构自由调整
    fallback: "vue-style-loader"
  });
} else {
  return ["vue-style-loader"].concat(loaders);
}
```

webpack.base.conf.js

```js
plugins: [
    new ExtractTextPlugin({filename: "main.css", allChunks: true}), //抽离成一个单独的css
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "windows.jQuery": "jquery"
    })
  ],

  ...
  {
    test: /\.vue$/,
    loader: 'vue-loader',
    options: {loaders:{
      css: ExtractTextPlugin.extract({
          use: 'css-loader',
          fallback: 'vue-style-loader'
      })
    }}
  },
```

#### 2.解决 npm run build 引入静态图片路径，404 问题。

方法一：绝对路径

将静态路径放在最外面的 static 文件夹中，使用绝对路径访问。如:img src="/static/images/xxx.png"
参考链接：
[link](https://segmentfault.com/q/1010000009642018)

方法二：相对路径
build/utils.js

```js
if (options.extract) {
  return ExtractTextPlugin.extract({
    use: loaders,
    publicPath: "../../", //此处修改 注意配置这一部分，根据目录结构自由调整
    fallback: "vue-style-loader"
  });
} else {
  return ["vue-style-loader"].concat(loaders);
}
```

config/index.js

```js
build: {
    // Template for index.html
    index: path.resolve(__dirname, '../dist/index.html'),

    // Paths
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: './',//此处修改
    ...
}
```

#### 3.解决打包后 vue-router，lazy-load 出错。路由无法跳转。

```
manifest.45b56c55bdc8c29560d3.js:1 Error: Loading chunk 22 failed.
    at HTMLScriptElement.t (manifest.45b56c55bdc8c29560d3.js:1)
```

在 index.html 的<head>标签中加入
第一种方法：

```
<!DOCTYPE html>
<html>
  <head>
    <base href="/" /> <!-- 加上这行 -->
    <!-- ... -->
  </head>
  <body>
    <!-- ... -->
  </body>
</html>
```

第二种方法：(未测试)

```
.webpackConfig({ output: { filename: '[name].js', chunkFilename: 'js/[name].app.js', publicPath: '/' } });
```

参考链接：https://github.com/JeffreyWay/laravel-mix/issues/164

#### 4.vue 打包后 jquery is not defined 和静态资源路径找不到

webapck.prod.conf.js

原始：

```js
new webpack.DefinePlugin({
  'process.env': env,
  $ : 'jquery',
  jQuery : 'jquery'
}),
```

改为：

```js
new webpack.ProvidePlugin({
    $: "jquery",
    jQuery: "jquery"
}),
```

#### 5.vue 项目里，img 标签报错，添加默认图片

```
<img src="/logo.png" :onerror="defaultImg">

data() {
  return {
    defaultImg: 'this.src="' + require('../../assets/img/timg.jpg') + '"'
  }
}
```

#### 6.vue 项目中添加猫链接

https://juejin.im/post/5a115df9f265da432240caaf

#### 7.动态修改路由参数的 query 值

vue-cli 中已经默认安装了 webpack-merge

```

import merge from 'webpack-merge'；

修改原有参数
this.$router.push({
    query:merge(this.$route.query,{'maxPrice':'630'})
})

新增一个参数：
this.$router.push({
    query:merge(this.$route.query,{'addParams':'我是新增的一个参数，哈哈哈哈'})
})

替换所有参数：
 this.$router.push({
    query:merge({},{'maxPrice':'630'})

```

#### 8.当修改某数据，层级过深时。无法触发页面更新

考虑使用 this.\$forceUpdate()进行强制刷新。

#### 9.axios 支持 finally 的解决办法

先安装 promise.prototype.finally 包

```
npm i promise.prototype.finally
```

引入包

```
require('promise.prototype.finally').shim();
axios.get()
  .then()
  .catch()
  .finally()
```

#### 10.vue 打包后页面被缓存，没有更新页面

```
// 由于webpack已经配置了js和css的hash值，所以静态资源不会被缓存
// 所以将问题定位在index.html上
// 对html文件，返回时增加头：Cache-Control，必须每次来服务端校验，根据etag返回200或者304
服务器nginx配置如下：
location ~* \.(html)$ {
  root /xxx/dist;
  etag on;
  expires 30d;
  index index.html;
}
location ~* \.(css|js|jpg|jpeg|gif|png|ico|cur|gz|svg|svgz|map|mp4|ogg|ogv|webm|htc)$ {
  root /xxx/dist;
  index index.html;
  expires 1M;
  access_log off;
  add_header Cache-Control "public";
}
https://juejin.im/post/5a115df9f265da432240caaf
```

#### 11.gzip 的原理（构建打包时压缩 or 服务端压缩）

[gzip 前端压缩 vs 服务端压缩](https://segmentfault.com/a/1190000012800222)

#### 12.vue 单页面，动态的控制多路由，前进刷新，后退不刷新

通过路由的钩子函数`beforeEach`和`meta`进行控制其路由参数的`keepAlive`。

参考连接：[另辟蹊径：vue 单页面，多路由，前进刷新，后退不刷新](https://segmentfault.com/a/1190000012083511)

#### 13.使用 axios 发送请求，多一次 Request Method: OPTIONS 请求，然后才是 get/post 请求

参考连接：[阮一峰详解 cors](http://www.ruanyifeng.com/blog/2016/04/cors.html)
[如何解决 axios 两次请求问题](https://blog.csdn.net/qq_27626333/article/details/77005911)

#### 14.在 vocode 中使用 eslint 对 vue 文件进行代码检查（报红色波浪线）

> [使用 VSCode + ESLint 实践前端编码规范](https://segmentfault.com/a/1190000009077086)

注意全局安装完`eslint`后，要安装`eslint-plugin-html`对文件进行检查。如果是`vue-cli`脚手架搭建，需要在`devDependencies`里面再安装一个`eslint-plugin-html`依赖。

#### 15.vue-router 路由嵌套路径问题

1.嵌套的子路由保存父路由路径。

```js
// 在子路由的path中，最前面不要加/。路由地址将拼接上父路由的地址，结果：localhost:8080/#/parent/child
{
  path: '/parent',
  component: () => import('@/pages/views/parent'),
  children: [{
    path: 'child',
    name: 'child',
    component: () => import('@/pages/views/child')
  }]
}
```

2.重置路由的路径

```js
// 在子路由的path中，前面加上/。路由地址将从根地址进行改写，结果：localhost:8080/#/child
{
  path: '/parent',
  component: () => import('@/pages/views/parent'),
  children: [{
    path: '/child',
    name: 'child',
    component: () => import('@/pages/views/child')
  }]
}
```
