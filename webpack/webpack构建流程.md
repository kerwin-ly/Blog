# Webpack 构建流程解析

> webpack 本质是基于事件流的操作机制。底层依赖[Tapable](https://github.com/webpack/tapable)，该库通过发布订阅的模式创建不同类型的 hooks（同步、异步、异步并行、异步串行 hooks 等）。而 webpack 通过这些 hooks 有序的控制插件来实现对应逻辑，从而达到构建打包的目的。

webpack 的构建流程包括`初始化`、`构建阶段`和`生成阶段`。下面，我们对各个阶段进行详解：

## 构建流程

### 初始化阶段

1. 初始化参数：从配置文件`webpack.config.js`和`shell`语句中读取参数，获取合并后的参数。

2. 创建编译器对象：通过上一步获得的参数，初始化`Compiler`对象。

3. 初始化编译环境：加载 webpack 的内置插件、注册各种模块工厂、加载配置中的自定义插件、挂载 hooks 等。（如：通过`xxxWebpackPlugin.apply(compiler)`方法，将`compiler`对象传入到`webpack`插件中。每个插件可以通过`compiler`的`hooks`来进行监听编译流程，从而对打包操作等进行更改）。

4. 开始编译：执行`Compiler`对象的`run`方法

5. 确定入口：根据配置中的 `entry` 找出所有的入口文件，调用 `compilation.addEntry` 将入口文件转换为 `dependence` 对象

### 编译阶段

1. 编译模块(make)：根据 `entry` 对应的 `dependence` 创建 `module` 对象，调用 `loader` 将模块转译为标准 JS 内容，使用 `acorn` 解析生成 `AST 抽象语法树`，从中找出该模块依赖的模块，再 递归 本步骤直到所有入口依赖的文件都经过了本步骤的处理

2. 完成模块编译：上一步递归处理所有能触达到的模块后，得到了每个模块被翻译后的内容以及它们之间的 `依赖关系图`

### 生成阶段

1. 输出资源(seal)：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 Chunk，再把每个 Chunk 转换成一个单独的文件加入到输出列表。

2. 写入文件系统(emitAssets)：在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统。(注意：触发`emit`钩子时，输出文件还没有写入到硬盘中，这时可以对即将输出的最终结果进行最后一次操作)

## Compiler 和 Compilation 区分

- Compiler： `Compiler`负责 webpack 整个生命周期的编译构建工作，其包含了当前运行的 webpack 配置，如：entry、output、loaders 等。这个度喜庆在启动 webpack 时，即被实例化，且全局仅被创建一次。`webpack plugins`可以通过`apply(compiler) {}`获取其参数，并对 webpack 执行时广播出来的事件，进行监听，来修改 webpack 的一些编译流程。（[compiler hooks](https://webpack.docschina.org/api/compiler-hooks/)）

- Compilation： `Compilation`负责构建模块和`chunk`，代表一次资源版本的构建。当运行`webpack`开发环境时，每当检测到一个文件的变化，就会创建一个新的`compilation`，从而生成一组新的编译资源。一个`Compilation`对象存储了本次打包编译的内容存到内存里（如：当前的模块资源、编译生成资源、变化的文件、依赖信息等）。（[compilation hooks](https://webpack.docschina.org/api/compilation-hooks/)）
