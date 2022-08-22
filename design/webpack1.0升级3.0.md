## webpack1.0 升级 3.0(vue-cli)

#### 1.新建一个最新的 vue-cli 项目，将 build,config,.babelrc 文件粘贴进自己的项目中。（注意自己原始文件的保存）

#### 2.报错：所有 css 无法编译，Moule not found.在每个 css 里面 if(content == 'string')这里报错。

解决：因为 vue-cli2.0+中，vue-loader 中已经包括的 css-loader,所以不需要在 webpack.base.conf.js 里面再配置，css-loader，否者会报错重复编译 Moundle not found。所有 css 无法使用。

删除 webpack.base.conf.js 里面的 css-loader 配置

#### 3.报错：No PostCSS Config found with build

解决：在根目录新建一个文件，postcss.config.js，里面内容为:

```
module.exports = {};
```

参考链接（webpack3.0+vue2.0 项目搭建）：

```
https://hk.saowen.com/a/a021fe868e543286ade622ce127245e37cb606b213ac2b8de2855da006d91f0c
```

#### 4.报错:check-version.js 中 node is undefined。15 行。

解决：根据引入条件，需要在 package.json 里面加入

```
"engines": {
    "node": ">= 4.0.0",
    "npm": ">= 3.0.0"
  },
```

下面的代码也可加进去

```
"browserslist": [
    "> 1%",
    "last 2 versions",
    "not ie <= 8"
  ]
```
