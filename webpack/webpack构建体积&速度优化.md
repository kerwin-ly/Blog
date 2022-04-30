# Webpack 构建体积&速度优化

## 构建速度优化

### 1. 使用 speed-measure-webpack-plugin 分析构建速度

在对 Webpack 构建速度优化前，我们需要首先知道构建的哪些过程比较耗时。

这就需要用到一个 Webpack 插件[speed-measure-webpack-plugin](https://github.com/stephencookdev/speed-measure-webpack-plugin)，它可以获取整个构建过程中的插件、loader 等的耗时。通过分析其时间，再做针对性优化。

它的使用方式也很简单，首先安装`speed-measure-webpack-plugin`

```shell
npm i -D speed-measure-webpack-plugin
```

然后在`webpack.prod.js`中使用

```js
const SpeedMeasureWebpackPlugin = require("speed-measure-webpack-plugin");

const smp = new SpeedMeasureWebpackPlugin();

// 使用实例化后的smp，将整个导出模块包裹起来
module.exports = smp.wrap({
    mode: "production",
    devtool: "cheap-module-source-map", // more options: http://webpack.docschina.org/configuration/devtool/
    plugins: [ ... ]
})
```

最后执行`npm run build`查看效果，如下图：

![speed](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/webpack/speed.png)

### 2. 提高解析速度 - 开启多进程构建

运行在 Node.js 之上的 webpack 是单线程模式的，也就是说，webpack 打包只能逐个文件处理，当 webpack 需要打包大量文件时，打包时间就会比较漫长。

在 Webpack3 中，我们可以使用[happypack](https://github.com/amireh/happypack)来开启多进程构建 module。但目前已不再维护。

在 Webpack4 中，官方推出了[thread-loader](https://github.com/webpack-contrib/thread-loader)，来达到同样的目的。

安装

```shell
npm i -D thread-loader
```

使用

```js
  {
    test: /\.js$/,
    use: [
      {
        loader: "thread-loader",
        options: {
          workers: os.cpus().length,
        },
      },
      {
        loader: "babel-loader", // 将es6,es7的新语法转换为es5语法
        options: {
          presets: ["@babel/preset-env"],
          cacheDirectory: true,
        },
      },
    ],
    include: [path.resolve(__dirname, "../src")], // 只在src目录下进行查找转换
    exclude: /node-modules/,
  },
```

### 3. 提高代码压缩速度 - 并行压缩

使用[terser-webpack-plugin](https://github.com/webpack-contrib/terser-webpack-plugin)压缩代码，并设置`parallel: true`，将开启`电脑cpu核数 - 1`个进程来并行压缩，从而提高速度。

```shell
npm i -D terser-webpack-plugin@4 # webpack4需安装4.x版本，webpack5安装最新版本即可
```

### 4. 拆包

使用[DllPlugin](https://webpack.docschina.org/plugins/dll-plugin/)和[DllReferencePlugin](https://webpack.docschina.org/plugins/dll-plugin/)将不常更新的包进行拆分，提前进行构建并生成对应文件，并在最终输出的`index.html`进行引入。后续在每次项目构建中，无需再重新构建这些包，而是直接从之前已构建好的文件中读取即可。从而提升构建速度。

### 5. 合理利用缓存，提升二次构建速度

`babel-loader`开启缓存，如果开启成功，在`/node_modules/.cache/`文件夹可以看到`babel-loader`文件夹。

```js
  {
    loader: "babel-loader",
    options: {
      presets: [
        ["@babel/preset-env", { modules: false }], // modules: false
      ],
      cacheDirectory: true, // 开启缓存
    },
  },
```

`terser-webpack-plugin`开启缓存，如果开启成功，在`/node_modules/.cache/`文件夹可以看到`terser-webpack-plugin`文件夹。

```js
optimization: {
  minimizer: [
    new TerserPlugin({
      parallel: true, // 并行压缩
      cache: true, // 开始缓存
    }),
  ];
}
```

使用[cache-loader](https://www.webpackjs.com/loaders/cache-loader/)，在一些性能开销较大的 loader 之前添加此 loader，以将结果缓存到磁盘里；保存和读取这些缓存文件会有一些时间开销，所以我们只对性能开销较大的 loader 使用此 loader 即可。如果你不知道哪个 loader 性能开销大，那么可以通过上面说到的`speed-measure-webpack-plugin`插件，观察哪个 loader 耗时长，就将哪个 loader 做缓存。

安装

```shell
npm i -D cache-loader
```

使用方式

```js
{
  test: /\.js$/,
  loader: [
      'cache-loader',
      'babel-loader'
  ]
  exclude: /node_modules/
},
```

使用[hard-source-webpack-plugin](https://github.com/mzgoddard/hard-source-webpack-plugin)，其为模块提供中间缓存

安装

```shell
npm i -D hard-source-webpack-plugin
```

使用

```js
module.exports = {
  context: // ...
  entry: // ...
  output: // ...
  plugins: [
    new HardSourceWebpackPlugin()
  ]
}
```

### 5. externals 避免打包，使用 cdn 方式引入

我们可以将一些 JS 文件存储在 CDN 上(减少 Webpack 打包出来的 js 体积)，在 index.html 中通过 <script> 标签引入，如:

````html
<script src="http://libs.baidu.com/jquery/2.0.0/jquery.min.js"></script>
```js 在使用时，仍然可以通过 import 的方式去引用(如 import $ from
'jquery')，并且希望 webpack 不会对其进行打包，此时就可以配置 externals。
//webpack.config.js module.exports = { //... externals: {
//jquery通过script引入之后，全局中即有了 jQuery 变量 'jquery': 'jQuery' } }
````

### 6. 提高搜索速度 - 减小搜索范围

在 loader 解析过程中，我们尽量只对“应该解析的文件”进行解析，来缩小构建目标。这可以通过 loader 的`include`和`exclude`进行设置。如下：

```
module: {
  rules: [
    {
      test: /\.vue$/,
      use: ["vue-loader"],
      include: [path.resolve(__dirname, "../src")], // 只在src目录下进行查找转换
      exclude: /node_modules/, // 排除node_modules查找
    }
  ]
}
```

如果业务系统中，只有一个依赖包，使用`resolve.modules`设置依赖模块的地址，让构建时，直接去找这个地址下的 node_modules 即可。无需一层层往上找。

合理设置别名`alias`，直接从固定地址获取对应依赖。

```
module.exports = {
  alias: path.resolve(__dirname, './node_modules/vue/dist/vue.min.js'),
  modules: path.resolve(__dirname, './node_modules')
}
```

## 构建体积优化

### 1. 使用 webpack-bundle-analyzer 分析构建体积

在优化 Webpack 构建体积前，我们可以通过[webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)来分析打包后的各个 bundle 大小。使用方式如下：

首先安装插件

```
npm i -D webpack-bundle-analyzer
```

然后在`webpack.prod.js`中使用

```js
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

moodule.exports = {
  plugins: [
    ...,
    new BundleAnalyzerPlugin()
  ]
}
```

最后执行`npm run build`后，自动打开浏览器http://127.0.0.1:8888 地址，如下图：

![speed](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/webpack/speed.png)

### 2. 按需引入

对使用的第三方依赖包进行按需引入，然后通过 tree-shaking 将其不用的包删除。如：`lodash`库支持`ESM`的`lodash-es`。我们尽量去使用这种第三方包。

### 3. 图片压缩

使用[image-webpack-loader](https://github.com/tcoopman/image-webpack-loader)来对图片进行统一压缩。

安装

```
npm i -D image-webpack-loader
```

使用

```js
rules: [
  {
    test: /\.(gif|png|jpe?g|svg)$/i,
    use: [
      "file-loader",
      {
        loader: "image-webpack-loader",
        options: {
          mozjpeg: {
            progressive: true,
          },
          // optipng.enabled: false will disable optipng
          optipng: {
            enabled: false,
          },
          pngquant: {
            quality: [0.65, 0.9],
            speed: 4,
          },
          gifsicle: {
            interlaced: false,
          },
          // the webp option will enable WEBP
          webp: {
            quality: 75,
          },
        },
      },
    ],
  },
];
```

## 参考

[玩转 webpack，使你的打包速度提升 90%](https://juejin.cn/post/6844904071736852487#heading-8)

[带你深度解锁 Webpack 系列(优化篇)](https://juejin.cn/post/6844904093463347208#heading-6)
