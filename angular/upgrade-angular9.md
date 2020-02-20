# Angular7 升级 Angular9
>[Angular Update Guide](https://update.angular.io/#7.2:9.0l3) [angular9 update content](https://angular.io/guide/updating-to-version-9) [ng-alain update content](https://ng-alain.com/docs/upgrade-v8/zh)  [typescript3.7 update](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html)

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

## 变更内容

### Angular
[Angular Update Guide](https://update.angular.io/#7.2:9.0l3)

### ng-alain / ng-zorro
[更新内容](https://ng-alain.com/docs/upgrade-v8/zh)

