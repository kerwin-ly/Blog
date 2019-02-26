## vue2.0踩坑
#### 1.导出的css路径，问题解决
vue-cli2版本中默认使用了ExtractTextPlugin插件，来合并各个vue文件的css。

build/utils.js:
```

if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        publicPath: '../../',         // 注意配置这一部分，根据目录结构自由调整
        fallback: 'vue-style-loader'
      })
    } else {
      return ['vue-style-loader'].concat(loaders)
    }
```
webpack.base.conf.js

```
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
#### 2.解决npm run build引入静态图片路径，404问题。

方法一：绝对路径

将静态路径放在最外面的static文件夹中，使用绝对路径访问。如:img src="/static/images/xxx.png"
参考链接：
[link](https://segmentfault.com/q/1010000009642018)

方法二：相对路径
build/utils.js

```
if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        publicPath: '../../',         //此处修改 注意配置这一部分，根据目录结构自由调整
        fallback: 'vue-style-loader'
      })
    } else {
      return ['vue-style-loader'].concat(loaders)
    }
```

config/index.js


```
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
#### 3.解决打包后vue-router，lazy-load出错。路由无法跳转。

```
manifest.45b56c55bdc8c29560d3.js:1 Error: Loading chunk 22 failed.
    at HTMLScriptElement.t (manifest.45b56c55bdc8c29560d3.js:1)
```
在index.html的<head>标签中加入
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

#### 4.vue打包后jquery is not defined和静态资源路径找不到

webapck.prod.conf.js

原始：

```
new webpack.DefinePlugin({  
  'process.env': env,  
  $ : 'jquery',  
  jQuery : 'jquery'  
}),
```
改为：

```
new webpack.ProvidePlugin({  
    $: "jquery",  
    jQuery: "jquery"  
}), 
```

#### 5.vue项目里，img标签报错，添加默认图片

```
<img src="/logo.png" :onerror="defaultImg">

data() {
  return {
    defaultImg: 'this.src="' + require('../../assets/img/timg.jpg') + '"'
  }
}
```

#### 6.vue项目中添加猫链接
https://juejin.im/post/5a115df9f265da432240caaf

#### 7.动态修改路由参数的query值


vue-cli中已经默认安装了webpack-merge
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

考虑使用this.$forceUpdate()进行强制刷新。

#### 9.axios支持finally的解决办法
先安装promise.prototype.finally包
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

#### 10.vue打包后页面被缓存，没有更新页面
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

#### 11.gzip的原理（构建打包时压缩or服务端压缩）
https://segmentfault.com/a/1190000012800222