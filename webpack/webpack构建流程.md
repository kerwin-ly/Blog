# Webpack 构建流程解析

> webpack 本质是基于事件流的操作机制。底层依赖[Tapable](https://github.com/webpack/tapable)，该库通过发布订阅的模式创建不同类型的 hooks（同步、异步、异步并行、异步串行 hooks 等）。而 webpack 通过这些 hooks 有序的控制插件来实现对应逻辑，从而达到构建打包的目的。

webpack 的构建流程包括`初始化`、`构建阶段`和`生成阶段`。下面，我们对各个阶段进行详解：

## 构建流程

### 初始化阶段

#### 1. 初始化参数

从配置文件`webpack.config.js`和`shell`语句中读取参数，获取合并后的参数。

#### 2. 创建编译器对象

通过上一步获得的参数，初始化`Compiler`对象。

#### 3. 初始化编译环境

遍历用户定义的 plugins 集合，执行插件的 apply 方法。接着加载 webpack 的内置插件、注册各种模块工厂等，最终生成Compiler实例，配置完对应的环境参数。

这里，我们对**自定义插件**和**内置插件**进行简单说明：

**自定义插件**：如果写过自定义的插件，那么一定会很熟悉每个自定义插件都有个apply方法，通过`xxxWebpackPlugin.apply(compiler)`方法，webpack将`Compiler`对象传入到插件中。这样，每个插件就可以通过`compiler`的`hooks`来进行监听编译流程，从而对打包操作等进行更改。

**内置插件**：webpack自身内置了数百个插件，这些插件并不需要我们手动配置，WebpackOptionsApply 会在初始化阶段根据配置内容动态注入对应的插件，包括：

* 注入 EntryOptionPlugin 插件，处理 entry 配置。

* 根据 devtool 值判断后续用那个插件处理 sourcemap，可选值：EvalSourceMapDevToolPlugin、SourceMapDevToolPlugin、EvalDevToolModulePlugin

* 注入 RuntimePlugin ，用于根据代码内容动态注入 webpack 运行时

#### 4. 开始编译

执行`Compiler`对象的`run`方法

#### 5. 确定入口

根据配置中的 `entry` 找出所有的入口文件，调用 `compilation.addEntry` 将入口文件转换为 `dependence` 对象

### 构建阶段

该阶段主要围绕`module`进行，如下：

#### 1. 编译模块(make)

编译模块的具体流程如下：

1. 根据 `entry` 对应的 `dependence` 创建对应文件类型的 `module` 对象，调用loader-runner仓库的`runLoaders`，通常是将转译为JS文本。

2. 使用 `acorn` 解析生成 `AST 抽象语法树`。

3. 遍历抽象语法树，识别`require/import`等语法对应的AST节点，从中找出该模块依赖的模块，加入到依赖列表中。

4. AST遍历完成后，开始处理模块的依赖`dependence`。重复第一步的操作即可，一直递归下去，直到所有依赖都被解析完毕。

上述过程，简单来看就是：`Dependence => Module => AST => Dependence`

#### 2. 完成模块编译

上一步递归处理所有模块后，得到了每个模块被翻译后的内容以及它们之间的 `依赖关系图`

### 生成阶段

在webpack获取完模块内容和模块之间的关系后，便开始了最终资源的生成。该阶段主要围绕`chunks`进行，如下：

![build](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/webpack/build.png)

#### 1. 输出资源(seal)

`seal`主要完成从`module`到`chunks`的过程，如下：

1. 遍历`compilation.modules`集合，根据模块中的`直接依赖` or `动态引入`的规则 ，分配给不同的 `chunk`对象。（如：a.js直接引用了b.js,动态引用了c.js。则将a.js和b.js合成一个chunk，c单独作为一个chunk）

2. 第一步遍历完成后，生成完整的`chunks`集合

3. 调用`createAssets`方法，将`chunks`进行遍历，调用 `compilation.emitAssets` 方法将 assets 信息记录到 `compilation.assets` 对象中

注意：在生成`chunks`的过程中，我们可能遇到一个模块被多次依赖的情况，那么按照上述的流程，必然会生成许多重复的`chunk`。

针对这个问题，webpack 提供了一些插件如 `CommonsChunkPlugin` 、`SplitChunksPlugin`，在基本规则之外进一步优化 chunks 结构。

#### 2. 写入文件系统(emitAssets)

在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统。(注意：触发`emit`钩子时，输出文件还没有写入到硬盘中，这时可以对即将输出的最终结果进行最后一次操作)

## Compiler 和 Compilation 区分

- Compiler： `Compiler`负责 webpack 整个生命周期的编译构建工作，其包含了当前运行的 webpack 配置，如：entry、output、loaders 等。这个度喜庆在启动 webpack 时，即被实例化，且全局仅被创建一次。`webpack plugins`可以通过`apply(compiler) {}`获取其参数，并对 webpack 执行时广播出来的事件，进行监听，来修改 webpack 的一些编译流程。（[compiler hooks](https://webpack.docschina.org/api/compiler-hooks/)）

- Compilation： `Compilation`负责构建模块和`chunk`，代表一次资源版本的构建。当运行`webpack`开发环境时，每当检测到一个文件的变化，就会创建一个新的`compilation`，从而生成一组新的编译资源。一个`Compilation`对象存储了本次打包编译的内容存到内存里（如：当前的模块资源、编译生成资源、变化的文件、依赖信息等）。（[compilation hooks](https://webpack.docschina.org/api/compilation-hooks/)）

## 参考

[[万字总结] 一文吃透 Webpack 核心原理](https://mp.weixin.qq.com/s/SbJNbSVzSPSKBe2YStn2Zw)