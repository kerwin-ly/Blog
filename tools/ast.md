# 使用babel来修改ast生成代码

今天在开发`cli`工具的时候遇到了一个场景，在我们通过命令向项目添加完`sentry`后，需要更新`shared.module.ts`文件里面的依赖信息。如下：

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
    BixiCoreModule,
    BixiACModule,
    ZorroModule,
  ],
  declarations: [...COMPONENTS, ...DIRECTIVES, ...PIPES],
  exports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    ReactiveFormsModule,
    BixiCoreModule,
    BixiACModule,
    ZorroModule,
    ...COMPONENTS,
    ...DIRECTIVES,
    ...PIPES,
  ],
  providers: [SENTRY_PROVIDERS] // 需要添加的代码
})
export class SharedModule {}

```

刚开始我是通过正则的方式来进行处理，但在review代码过程中，大佬表示这种方式风险性太高，建议用`babel`来处理这种情况。一脸懵逼的我，便开始了探索...

## Babel介绍
`babel`想必大家都很熟悉了，在项目中用的较多的地方便是它在兼容方面的处理，可以将es6的代码转换为es5的代码，从而在现有环境中运行。但在这里，我们主要是介绍如果使用`babel`来生成咱们想要的`javascript`代码。

先介绍下咱们将用到的`babel`插件

* @babel/parser：将`javascript`代码编译为`抽象语法树（Abstract Syntax Tree，AST）`（后续简称`AST`）
* @babel/traverse：遍历`AST`，通过这个插件，我们可以对`AST`上的任意节点进行增删查改
* @babel/types：AST节点类型，通过该库咱们可以生成想要的`AST节点`
* @babel/generator：编译`AST`来生成`javascript`代码

## 安装依赖
```shell
npm install @babel/parser @babel/traverse @babel/types @babel/generator --save-dev
```

## 转换javascript代码
TODO: 添加babel操作的流程图

### @babel/parser
第一步，我们要将对应的`javascript`代码解析为`AST`。这里因为涉及到文件的读写，后续我们都用`node`来处理：

这里需要注意，**在使用`@babel/parser`时，由于待解析代码中有`装饰器`，所以必须添加`decorators-legacy`这个插件**才能识别，否则会报错`SyntaxError: This experimental syntax requires enabling one of the following parser plugin(s): 'decorators-legacy, decorators' (11:0)`。
```js
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

## 参考链接
https://babeljs.io/docs/en/babel-parser