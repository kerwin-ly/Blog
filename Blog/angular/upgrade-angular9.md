# Angular7 升级 Angular9
>[Angular Update Guide](https://update.angular.io/#7.2:9.0l3) [angular9 update content](https://angular.io/guide/updating-to-version-9) [ng-alain update content](https://ng-alain.com/docs/upgrade-v8/zh)  [typescript3.7 update](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html)

## Angular9更新内容
>[Ivy compatibility guide](https://angular.io/guide/ivy-compatibility#payload-size-debugging)

## Angular相关版本升级

### 1.先将本地的cli工具更新到最新版本
```shell
npm install -g @angular/cli
```

### 2.通过cli工具检查依赖并升级
执行以下命令
```shell
ng update
```

显示结果如图：
![ng-update](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/ng-update.png)


根据提示信息`We analyzed your package.json, there are some packages to update`。将下面的包进行升级。

#### 升级angular/cli
```shell
ng update @angular/cli
```

提示信息如图：
![ng-update-cli](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/ng-update-cli.png)

按照提示，升级指定的版本
```shell
npm install @angular/animations@9.0.2 @angular/common@9.0.2 @angular/compiler@9.0.2 @angular/core@9.0.2 @angular/forms@9.0.2 typescript@3.7.5
```

待指定的包都升级成功后，再次执行`ng update @angular/cli`
```shell
ng update @angular/cli
```
![ng-update-cli2](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/ng-update-cli2.png)

#### 升级angular/core
执行下面命令
```shell
ng update @angular/core
```
接着，这里可能报错。如图：
update-error.png
![update-error](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/update-error.png)

按照提示，咱们把当前的更改先提一个commit。如果不想如此操作的话，也可以在`ng update`时候添加`flag`，`--createCommits` or `-C`，来为你每一次升级提交一个commit作为记录[更多参数参考](https://angular.io/cli/update)
```shell
git add .
git commit -m 'chore(*): update @angular/cli to v9.0.2'
```

ok，提交commit后，咱们继续升级angular/core，一般来说应该升级成功了
```shell
ng update @angular/core
```

#### 升级ng-alain
```shell
ng update ng-alain
```
这里遇到了一个错误，如图（todo,暂时没看到影响）
update-ngalain-error.png
![update-ngalain-error](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/update-ngalain-error.png)

*注意：* 如果`ng-alain`升级到了`v8`以上。那么你需要手动修改 `package.json` 里的 `@delon/*`、`ng-alain` 依赖包版本号为：`^8.0.0`。并重新`npm install`。否则在启动项目时会报错如下。[ng-alain升级链接](https://ng-alain.com/docs/upgrade-v8/zh)

```shell
ERROR in The target entry-point "@delon/theme" has missing dependencies:
 - @angular/common/http/src/client
```

#### 升级ng-zorro
执行以下命名，如果遇到错误`Repository is not clean. Please commit or stash any changes before updating.`，请先保存提交一个commit记录自己的每次更新
```shell
ng update ng-zorro
```

这里同样提示需要升级其他的相关依赖
![ng-zorro-update](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/ng-zorro-update.png)

将其进行升级
```shell
npm install @angular/animations@9.0.2 @angular/common@9.0.2 @angular/core@9.0.2 @angular/platform-browser@9.0.2 @angular/router@9.0.2 ng-zorro-antd@8.5.2
```

#### 升级rxjs
```shell
ng update rxjs
```

#### 最后
升级成功所有依赖后，查看咱们是否升级完毕
```shell
ng update
ng --version
```
![ng-version](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/ng-version.png)

## 处理升级带来的变更
接下来咱们启动项目`npm start`，根据文档逐个处理变更

### Angular

#### 1.处理json文件引入报错
error
```
ERROR in src/app/shared/services/request.service.ts:9:20 - error TS2732: Cannot find module '../interfaces/schema.json'. Consider using '--resolveJsonModule' to import module with '.json' extension

import schema from '../interfaces/schema.json';
```

解决：在`tsconfig.json`中添加配置
```shell
# tsconfig.json
{
  "compileOnSave": false,
  "compilerOptions": {
    "baseUrl": "src/",
    "downlevelIteration": true,
    "outDir": "./dist/out-tsc",
    "sourceMap": true,
    "declaration": false,
    "module": "esnext",
    "moduleResolution": "node",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "importHelpers": true,
    "target": "es2015",
    "resolveJsonModule": true, // 添加此行
    "allowSyntheticDefaultImports": true, // 如果继续报错import相关，添加此行
    "typeRoots": ["node_modules/@types"],
    "types": ["lodash"],
    "lib": ["es2018", "dom"],
    "paths": {
      "@shared": ["app/shared/index"],
      "@shared/*": ["app/shared/*"],
      "@core": ["app/core/index"],
      "@core/*": ["app/core/*"],
      "@env/*": ["environments/*"]
    }
  }
}
```

#### 2.ViewChild变更引起的错误
>[参考链接](https://angular.io/guide/static-query-migration)

在angular9升级后。对`ViewChild ContentChild`进行了更改。默认情况下这种写法`@ViewChild('inputElement')`相当于`@ViewChild('inputElement', { static: false })`。这种写法只能在`ngAfterViewInit()`钩子中获取对应的结果。如果希望在`ngOnInit`中获取结果，则需要修改为`@ViewChild('inputElement', { static: true })`

报错
```html
<input
  #inputElement
  nz-input
  nzSize="small"
  [nzAutocomplete]="auto"
/>
```
```ts
@ViewChild('inputElement') inputElement: ElementRef;

ngOnInit(): void {
  console.log(this.inputElement); // undefined
}
```

正确写法
```ts
@ViewChild('inputElement', { static: true }) inputElement: ElementRef;

ngOnInit(): void {
  console.log(this.inputElement); // undefined
}
```

#### 3.通过控制Ivy开关来定位问题
在`tsconfig.app.json`中你可以修改配置来控制`Ivy`的编译，来确定是否由于其导致的问题
```shell
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": []
  },
  "files": [
    "src/main.ts",
    "src/polyfills.ts"
  ],
  "include": [
    "src/**/*.d.ts"
  ],
  "angularCompilerOptions": {
    "enableIvy": false // 默认是true
  }
}
```

#### 4.报错:Module build failed,xxx is missing from the TypeScript compilation. Please make sure it is in your tsconfig via the 'files' or 'include' property.
![module-build-failed](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/module-build-failed.png)

解决：[这里](https://github.com/angular/angular-cli/issues/8284#issuecomment-341417325)有相关的讨论。

编辑`tsconfig.app.json`中的配置
```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "outDir": "../out-tsc/app",
    "types": ["node"],
    "paths": {
      "@shared": ["app/shared"],
      "@shared/*": ["app/shared/*"],
      "@core": ["app/core/index"],
      "@core/*": ["app/core/*"],
      "@env/*": ["environments/*"]
    },
    "baseUrl": "./"
  },
  "files": ["main.ts", "polyfills.ts"],
  "include": ["src/**/*.d.ts", "./app/shared/components/bx-graph/config/new-graph-config.ts"] // 手动添加未编译的文件
}
```

#### 5. 关于使用Ivy编译比VE编译打包出来的bundle size变大问题
[ivy compiler make bundle size large](https://angular.io/guide/ivy-compatibility#payload-size-debugging)   [Increased initial main.js bundle size in v9 - mainly due to @angular modules](https://github.com/angular/angular-cli/issues/16866)    [Increased main.js bundle size but less lazy chunks, another case with Angular v9-rc.11 in a monorepo structure](https://github.com/angular/angular-cli/issues/16799)  


### ng-alain / ng-zorro
>强烈建议看下[ng-alain更新](https://ng-alain.com/docs/upgrade-v8/zh)，里面有些破坏性更新，虽然cli工具已经替我们解决了。但仍然可能遗漏，值得我们去警惕。

#### 1. 环境变量警告
警告信息如下
```shell
warning: environment.prod.ts is part of the TypeScript compilation but it's unused.
Add only entry points to the 'files' or 'include' properties in your tsconfig.
```

解决：在`tsconfig.app.json`中修改`exclude`配置
```
"exclude": ["test.ts", "**/*.spec.ts", "./environments/*.ts"]
```

#### 2. no provider for NzMenuBaseService
这个问题是由于`ng-zorro`对`nzDropdownMenu`的破坏性更新引起的，困扰了我好久。在项目中一直无法搜索到这个`NzMenuBaseService`.直到同事`Defpis`帮我解惑，在源码中找到了它，才定位到是这个组件更新引起的。后续按照[官方文档](https://ng.ant.design/components/dropdown/zh)修改成最新的组件即可。

![ng-version](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/menu-service.png)

#### 3. cannot resolve all paremeters for AjvSchemaValidatorsFactory
![ajv-error](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/ajv-error.png)


解决:找到`DelonFormModule`将其原来的`forRoot()`方式删掉
```ts
import { DelonFormModule, WidgetRegistry } from '@delon/form';
@NgModule({
  imports: [WidgetRegistry, DelonFormModule.forRoot()] // 原来的方法, WidgetRegistry没用的话也可以干掉了
  imports: [DelonFormModule] // 修改后的方法
})
```


