
## webpack1.0升级3.0(vue-cli)
#### 1.新建一个最新的vue-cli项目，将build,config,.babelrc文件粘贴进自己的项目中。（注意自己原始文件的保存）

#### 2.报错：所有css无法编译，Moule not found.在每个css里面if(content == 'string')这里报错。

解决：因为vue-cli2.0+中，vue-loader中已经包括的css-loader,所以不需要在webpack.base.conf.js里面再配置，css-loader，否者会报错重复编译Moundle not found。所有css无法使用。

删除webpack.base.conf.js里面的css-loader配置

#### 3.报错：No PostCSS Config found with build

解决：在根目录新建一个文件，postcss.config.js，里面内容为:

```
module.exports = {};
```

参考链接（webpack3.0+vue2.0项目搭建）：
```
https://hk.saowen.com/a/a021fe868e543286ade622ce127245e37cb606b213ac2b8de2855da006d91f0c
```

#### 4.报错:check-version.js中node is undefined。15行。
解决：根据引入条件，需要在package.json里面加入
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




