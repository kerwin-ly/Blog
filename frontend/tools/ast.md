# 使用 babel 来生成 Typescript 代码

> 本文相关的代码保存于[github 源码](https://github.com/kerwin-ly/Blog/tree/main/demo/ast)处，建议结合该代码来阅读文章，便于食用。

## 前言

今天在开发`cli`工具的时候遇到了一个场景，通过命令向项目添加完`sentry`后，需要自动向`shared.module.ts`文件添加两行ts代码用于引入依赖。如下：

```ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { COMPONENTS } from './components';
import { DIRECTIVES } from './directives';
import { ZorroModule } from '@modules/zorro/zorro.module';
import { PIPES } from './pipes';
import { SENTRY_PROVIDERS } from '@core/sentry'; // 需要添加的代码

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    ReactiveFormsModule,
    ZorroModule,
  ],
  declarations: [...COMPONENTS, ...DIRECTIVES, ...PIPES],
  exports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    ReactiveFormsModule,
    ZorroModule,
    ...COMPONENTS,
    ...DIRECTIVES,
    ...PIPES,
  ],
  providers: [SENTRY_PROVIDERS], // 需要添加的代码
})
class SharedModule {}

export { SharedModule };
```

刚开始咱是通过正则的方式来处理，但在 review 代码过程中，大佬表示这种方式风险性太高，建议用`babel`来处理这种情况。由于之前只用过`babel`来做些简单的兼容处理，从未用其来生成代码，于是便利用闲暇时间进行了一番摸索。本文主要概括了`babel`几个核心插件的使用方法和开发中的部分技巧，希望能给大家一些帮助。

## Babel 介绍

一想到`babel`,大家第一反应应该是它在兼容方面的处理。它可以将 ECMAScript 2015+ 版本的代码转换为向后兼容的 JavaScript 语法，以便能够运行在当前和旧版本的浏览器或其他环境中。但在这里，我们主要是介绍如果使用`babel`来生成咱们期望的`javascript`代码。

先介绍下咱们将用到的`babel`插件

- @babel/parser：将`javascript`代码编译为`抽象语法树（Abstract Syntax Tree，AST）`（后续简称`AST`）
- @babel/traverse：遍历`AST`，通过这个插件，我们可以对`AST`上的任意节点进行增删查改
- @babel/types：AST 节点类型，通过该库咱们可以生成想要的`AST节点`
- @babel/generator：编译`AST`来生成`javascript`代码

## 创建项目 && 安装依赖

```shell
mkdir ast-demo && cd ast-demo && npm init #  创建项目并初始化package.json
mkdir code && cd code && touch demo.ts # 新建code/demo.ts用于放置待解析的ts代码
touch run.js # 用于放置核心逻辑
npm install @babel/parser @babel/traverse @babel/types @babel/generator @babel/core --save-dev
```

最后将待解析的这段代码粘贴至`ast-demo/code/demo.ts`文件中，如下：

```ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { COMPONENTS } from './components';
import { DIRECTIVES } from './directives';
import { ZorroModule } from '@modules/zorro/zorro.module';
import { PIPES } from './pipes';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    ReactiveFormsModule,
    ZorroModule,
  ],
  declarations: [...COMPONENTS, ...DIRECTIVES, ...PIPES],
  exports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    ReactiveFormsModule,
    ZorroModule,
    ...COMPONENTS,
    ...DIRECTIVES,
    ...PIPES,
  ],
  providers: [], // 需要添加的代码
})
class SharedModule {}

export { SharedModule };
```

## 转换 javascript 代码


![流程图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3962e89f23054267a3d79a672c4b8743~tplv-k3u1fbpfcp-zoom-1.image)

### 使用@babel/parser 解析 javascript 代码生成 AST

第一步，我们要将对应的`javascript`代码解析为`AST`。这里因为涉及到文件的读写，后续我们都用`node`来处理：

需要注意的是，**在使用`@babel/parser`时，由于待解析代码中有`装饰器`，所以必须添加`decorators-legacy`这个插件**才能识别，否则会报错：

`SyntaxError: This experimental syntax requires enabling one of the following parser plugin(s): 'decorators-legacy, decorators' (11:0)`。

```ts
const { parse } = require('@babel/parser');
const path = require('path');
const fs = require('fs');
const codePath = './code/demo.ts'; // 待解析代码路径，
const file = fs.readFileSync(path.resolve(__dirname, codePath)).toString();
const ast = parse(file, {
  sourceType: 'module',
  plugins: ['decorators-legacy'], // 如果待代码中有装饰器，需要添加该plugin，才能识别。
});
```

### 使用@babel/traverse 遍历 AST 节点，并对特殊节点进行处理

在获取到对应的`AST`后，我们便可以对其节点进行修改

这里我们拿`import xx from xx`这个语法举例，在`run.js`中添加该代码

```ts
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default; // 遍历ast，对各个节点进行处理
const path = require('path');
const fs = require('fs');
const codePath = './code/demo.ts'; // 待解析代码路径，
const file = fs.readFileSync(path.resolve(__dirname, codePath)).toString();
const ast = parse(file, {
  sourceType: 'module',
  plugins: ['decorators-legacy'], // 如果待代码中有装饰器，需要添加该plugin，才能识别。
});
let num = 0;
traverse(ast, {
  ImportDeclaration(path) {
    num++;
    console.log(num); //  输出1，2，3，4，5，6，7，8，9
  },
});
```

执行命令`node run.js`结果如下
![结果01](https://raw.githubusercontent.com/kerwin-ly/Blog/main/assets/imgs/babel-traverse02.png)

接下来，回到正题，我们期望的结果是：

- 在`class`前面添加一行`import { SENTRY_PROVIDERS } from '@core/sentry';`（有的同学可能会想，看代码结构，为什么不是在`@NgModule`这个装饰器前面添加呢？而是在`class`前面 🤔。大家可以思考下，后续我们来填坑 ）
- 在`@NgModule`装饰器里面添加一个键值对，`providers: [SENTRY_PROVIDERS]`

那么如何知道我们`class SharedModule`对应的`AST节点类型`呢？

这里由于`AST 节点类型`实在太多了，去官方文档查看的话，会花费很多时间。这里推荐使用[AST Explorer](https://astexplorer.net/)。

![ast-explorer](https://raw.githubusercontent.com/kerwin-ly/Blog/main/assets/imgs/ast-explorer.png)

如果希望获取某个具体的节点，在左侧源码中选择对应的代码即可，右侧黄色部分即节点类型
![ast-explorer2](https://raw.githubusercontent.com/kerwin-ly/Blog/main/assets/imgs/ast02.png)

知道了如何获取`AST节点类型`后，接下来我们便可以通过同样的方式来获取`class`对应的节点类型
![ast-explorer3](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fd0a5387fc7f49e2b7142c43972766f4~tplv-k3u1fbpfcp-zoom-1.image)

这里大家可以发现和咱们代码中表现的不同，`ClassDeclaration`内部包含了节点`Decorator`，而不是咱们代码中直观看到的~~装饰器与类是同级的~~。这也填了咱们前文中的坑。如果直接在`@NgModule`的前一个节点添加`ImportDeclaration`，那么它会添加在`ClassDeclaration`的内部，不是我们期望的结果。熟悉`装饰器`的同学也应该知道，装饰器可以装饰类、属性、方法等，而不会独立存在的。所以如果你理解装饰器，这里应该第一想到的是应该去`ClassDeclaration`前面添加需要的节点，当然，通过`AST Explorer`也可以直观的得出结果。

接下来修改`run.js`并运行，通过`path.node`属性可以获取对应的`AST节点`

```js
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default; // 遍历ast，对各个节点进行处理
const path = require('path');
const fs = require('fs');
const codePath = './code/demo.ts'; // 待解析代码路径，
const file = fs.readFileSync(path.resolve(__dirname, codePath)).toString();
const ast = parse(file, {
  sourceType: 'module',
  plugins: ['decorators-legacy'], // 如果待代码中有装饰器，需要添加该plugin，才能识别。
});

traverse(ast, {
  ClassDeclaration(path) {
    console.log(path.node); // add it
  },
});
```

![ast-result01](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1ed35a6479254adfaef51f48fe32087f~tplv-k3u1fbpfcp-zoom-1.image)

### 使用@babel/types 创建新的 AS 节点

通过`@babel/traverse`和`AST Explorer`，我们找到了`class sharedModule`对应的`AST节点类型`。接下来，我们来生成新代码`import { SENTRY_PROVIDERS } from '@core/sentry'`。

这时候便是`@babel/types`登场了，它可以帮助我们创建`AST节点`。详情可以参考[@babel/types api 文档](https://babeljs.io/docs/en/babel-types)。

在文档中，我们可以看到许多的 api，可以帮助你创建任意已知的`AST`节点。那么问题来了，我怎么知道如何组合这些 api 来生成我的代码呢？

我们拿`import { SENTRY_PROVIDERS } from '@core/sentry'`这行代码举例。同样需要[AST Explorer](https://astexplorer.net/)，观察其对应的`AST`

![ast-explorer5](https://raw.githubusercontent.com/kerwin-ly/Blog/main/assets/imgs/ast05.png)

显而易见，它的`AST节点类型`是`ImportDeclaration`

接着，我们便查看[@babel/types api 文档](https://babeljs.io/docs/en/babel-types)是如何生成一个`ImportDeclaration`节点的。

![babel-type01](https://raw.githubusercontent.com/kerwin-ly/Blog/main/assets/imgs/babel-type01.png)

通过文档，我们了解到，要生成`import xx from xx`这种格式的代码，需要两个参数`specifiers`和`source`。那么我们可以先添加如下代码

```js
const t = require('@babel/types');

t.importDeclaration(specifiers, source); // specifiers， source为定义
```

而`specifiers`的类型是`Array<ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier>`数组对象。如果你现在不确定其节点类型是`ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier`的哪一个话，那么便可以回到[AST Explorer](https://astexplorer.net/)去查看。

点击`SENTRY_PROVIDERS`可以获取当前的节点类型`Identifier`，其可以理解为咱们的变量/标识，其父级便是`ImportSpecifier`类型。
![ast06](https://raw.githubusercontent.com/kerwin-ly/Blog/main/assets/imgs/ast06.png)

确定类型后，返回[@babel/types api 文档](https://babeljs.io/docs/en/babel-types)，查看生成`ImportSpecifier`节点，需要`local` `imported`和`importKind`参数，而`local`和`imported`必填，是`Identifier`类型，也就是变量。

修改代码如下

```js
const t = require('@babel/types');
const local = t.Identifier('SENTRY_PROVIDERS');
const imported = t.Identifier('SENTRY_PROVIDERS');
const specifiers = [t.ImportSpecifier(local, imported)];
const importDeclaration = t.importDeclaration(specifiers, source); // source未定义
```

完成了`ImportSpecifier`节点的生成，接下来我们查看`ImportDeclaration`所需要的第二个参数，即`source`对应的节点类型是`StringLiteral`，采用同样的方式去查找生成`StringLiteral`节点所需的参数。

![babel-type02](https://raw.githubusercontent.com/kerwin-ly/Blog/main/assets/imgs/babel-type02.png)

![babel-type03](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7c5e703a403243b4aafa67d408601972~tplv-k3u1fbpfcp-zoom-1.image)

![babel-type04](https://raw.githubusercontent.com/kerwin-ly/Blog/main/assets/imgs/babel-type04.png)

修改代码如下，便获得了最终`import xx from 'xx'`这个语法对应的`AST`

```js
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default; // 遍历ast，对各个节点进行处理
const t = require('@babel/types');
const path = require('path');
const fs = require('fs');
const codePath = './code/demo.ts'; // 待解析代码路径，
const file = fs.readFileSync(path.resolve(__dirname, codePath)).toString();
const ast = parse(file, {
  sourceType: 'module',
  plugins: ['decorators-legacy'], // 如果待代码中有装饰器，需要添加该plugin，才能识别。
});

traverse(ast, {
  ClassDeclaration(path) {
    const local = t.Identifier('SENTRY_PROVIDERS');
    const imported = t.Identifier('SENTRY_PROVIDERS');
    const specifiers = [t.ImportSpecifier(local, imported)];
    const source = t.stringLiteral('@core/sentry');
    const importDeclaration = t.importDeclaration(specifiers, source);

    console.log(importDeclaration);
  },
});
```

### 对当前的 ast 节点进行操作

在获得了`ImportDeclaration`的`AST`后，我们需要对原来的`AST`进行修改，从而生成新的`AST`。

这里便需要用到`@babel/traverse`中的`path`参数了。 相关的参数可以查看[babel 操作手册-转换操作](https://github.com/jamiebuilds/babel-handbook/blob/main/translations/zh-Hans/plugin-handbook.md#toc-transformation-operations)。文档中对已知的 api 都进行了说明。

我们需要在`ClassDeclaration`前面添加`ImportDeclaration`节点，修改代码如下：

```js
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default; // 遍历ast，对各个节点进行处理
const t = require('@babel/types');
const path = require('path');
const fs = require('fs');
const codePath = './code/demo.ts'; // 待解析代码路径，
const file = fs.readFileSync(path.resolve(__dirname, codePath)).toString();
const ast = parse(file, {
  sourceType: 'module',
  plugins: ['decorators-legacy'], // 如果待代码中有装饰器，需要添加该plugin，才能识别。
});

traverse(ast, {
  ClassDeclaration(path) {
    const local = t.Identifier('SENTRY_PROVIDERS');
    const imported = t.Identifier('SENTRY_PROVIDERS');
    const specifiers = [t.ImportSpecifier(local, imported)];
    const source = t.stringLiteral('@core/sentry');
    const importDeclaration = t.importDeclaration(specifiers, source);

    path.insertBefore(importDeclaration); // update it
  },
});
```

这里还有一步操作是在`@NgModule`装饰器里面添加`providers: [SENTRY_PROVIDERS]`键值对，使用的是上述同样方法。直接上代码：

```js
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default; // 遍历ast，对各个节点进行处理
const path = require('path');
const fs = require('fs');
const codePath = './code/demo.ts'; // 待解析代码路径，
const file = fs.readFileSync(path.resolve(__dirname, codePath)).toString();
const ast = parse(file, {
  sourceType: 'module',
  plugins: ['decorators-legacy'], // 如果待代码中有装饰器，需要添加该plugin，才能识别。
});
let code;
let hasProviders = false;

traverse(ast, {
  ClassDeclaration(path) {
    const local = t.Identifier('SENTRY_PROVIDERS');
    const imported = t.Identifier('SENTRY_PROVIDERS');
    const specifiers = [t.ImportSpecifier(local, imported)];
    const source = t.stringLiteral('@core/sentry');
    const importDeclaration = t.importDeclaration(specifiers, source);

    path.insertBefore(importDeclaration); // 在当前ClassDeclaration节点前插入importDeclaration节点
  },
  ObjectProperty(path) {
    // ObjectProperty 对应js语法中的键值对, xx: xx
    if (path.node.key.name === 'providers') {
      // 这里判断，如果代码中已经存在 key值 providers，直接进行添加
      hasProviders = true;
      path.node.value.elements.push(t.identifier('SENTRY_PROVIDERS')); // path.node.value.elements可以通过AST Explorer来查看对应层级
    }
    if (!hasProviders && isEnd(path.getAllNextSiblings())) {
      // 判断如果遍历到最后一个ObjectProperty，仍没有providers属性，则添加键值对
      hasProviders = false;
      // 在当前节点后面添加一个键值对
      path.insertAfter(
        t.objectProperty(t.identifier('providers'), t.arrayExpression())
      );
    }
  },
});

function isEnd(nodes) {
  return !nodes.some((item) => item.node.type === 'ObjectProperty');
}
```

### 使用@babel/generator 生成代码

最后使用`@babel/generator`将其`AST`编译为代码。可以在[@babel/generator api](https://babeljs.io/docs/en/babel-generator)来获取更多信息。接着使用`fs`模块将代码写入到目标文件中

添加代码如下：

```js
...

fs.writeFileSync(codePath, generate(ast, {}, code).code);
console.log('Success to generate it');

```

完整代码：
[github 源码](https://github.com/kerwin-ly/Blog/tree/main/demo/ast)

## 参考链接

[使用 babel 修改 js 代码](https://juejin.cn/post/6850037265675223054)

