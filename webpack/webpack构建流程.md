# Webpack 构建流程解析

> webpack 本质是基于事件流的操作机制。底层依赖[Tapable](https://github.com/webpack/tapable)，该库通过发布订阅的模式创建不同类型的 hooks（同步、异步、异步并行、异步串行 hooks 等）。而 webpack 通过这些 hooks 有序的控制插件来实现对应逻辑，从而达到构建打包的目的。

1. 初始化参数。从配置文件`webpack.config.js`和`shell`语句中读取参数，获取合并后的参数

2. 通过上一步获得的参数，初始化`Compiler`对象。初始化对象后，加载所有配置的插件并挂载`hooks`。（如：通过`xxxWebpackPlugin.apply(compiler)`方法，将`compiler`对象传入到`webpack`插件中。每个插件可以通过`compiler`的`hooks`来进行监听编译流程，从而对打包操作等进行更改）。

3. 进入`entryOption`阶段，通过`entry`参数确认入口文件是单个还是多个，并递归获取所有的入口文件

4. 创建`Compilation`对象回调`compilation`相关钩子，从`entry`入口文件出发，通过`compilation`我可以读取到 module 的 resource（资源路径）、loaders（使用的 loader）等信息。再将编译好的文件内容使用 `acorn` 解析生成 `AST 抽象语法树` 。然后递归、重复的执行这个过程，
   所有模块和和依赖分析完成后，执行 `compilation` 的 `seal` 方法对每个 chunk 进行整理、优化、封装**webpack_require**来模拟模块化操作.

5. 触发`emit`钩子，所有文件的编译及转化都已经完成，包含了最终输出的资源，我们可以在传入事件回调的 `compilation.assets` 上拿到所需数据，其中包括即将输出的资源、代码块 Chunk 等等信息。(注意：触发`emit`钩子时，输出文件还没有写入到硬盘中，这时可以对即将输出的最终结果进行最后一次操作)

### Compiler 和 Compilation 区分

* Compiler： `Compiler`负责webpack整个生命周期的编译构建工作，其包含了当前运行的webpack配置，如：entry、output、loaders等。这个度喜庆在启动webpack时，即被实例化，且全局仅被创建一次。`webpack plugins`可以通过`apply(compiler) {}`获取其参数，并对webpack执行时广播出来的事件，进行监听，来修改webpack的一些编译流程。（[compiler hooks](https://webpack.docschina.org/api/compiler-hooks/)）

* Compilation： `Compilation`负责构建模块和`chunk`，代表一次资源版本的构建。当运行`webpack`开发环境时，每当检测到一个文件的变化，就会创建一个新的`compilation`，从而生成一组新的编译资源。一个`Compilation`对象存储了本次打包编译的内容存到内存里（如：当前的模块资源、编译生成资源、变化的文件、依赖信息等）。（[compilation hooks](https://webpack.docschina.org/api/compilation-hooks/)）
