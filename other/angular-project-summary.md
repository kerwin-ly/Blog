# Angular 项目开发总结

> 总结一下一个新的项目，如何规范的维护

## 开发

### 1.工程架构

目前前端的三大框架，各自都有自己的`cli`工具进行快速构建。大体的结构不会差太多。但在我们开发中，还是可能会出现各自开发的模块结构混乱问题。最好具体到某一个模块，有一个清晰的描述，拿 angular 项目举例

```shell
.
├── app                               (项目源码)
│   ├── app.module.ts                   (app根模块)
│   ├── core                            (app核心模块，包含拦截器，启动模块等)
│   ├── delon.module.ts
│   ├── layout                          (布局模块)
│   ├── routes                          (路由模块，放置业务逻辑)
        user/                           (举例：user模块编写)
            pages/                      (举例：user模块中的页面)
            components/                 (举例：user模块中的组件)
            services/                   (举例：user模块中中提取出来的公共服务)

│   └── shared                          (通用组件加载模块)
            api/                        (所有的api请求)
            components/                 (全局公共组件)
            config/                     (全局配置信息)
            enums/                      (全局枚举)
            interfaces/                 (全局接口)
            pipes/                      (全局管道符)
            utils/                      (全局工具类)
├── assets                            (静态资源)
├── browserslist
├── environments                      (环境变量目录)
│   ├── environment.hmr.ts
│   ├── environment.prod.ts
│   └── environment.ts
├── favicon.ico
├── hmr.ts
├── index.html                        (入口页面)
├── karma.conf.js
├── main.ts                           (ts入口模块)
├── polyfills.ts
├── style-icons-auto.ts
├── style-icons.ts
├── styles                            (全局样式目录)
│   ├── index.less
│   └── theme.less
├── styles.less
├── test.ts
├── tsconfig.app.json                 (tsconfig配置)
├── tsconfig.spec.json
├── tslint.json                       (tslint配置)
└── typings.d.ts
```

### 2.开发风格

#### 1. 开发工具

维护同一个项目，开发同学的编码风格必须保持一致。统一编辑器，如: `vscode`，安装对应的`lint`工具。如`Prettier`之类的去自动 format 代码。

#### 2.代码规范文档

`lint`工具可以帮助我们解决大多数的代码风格问题，但有些是无法检测的。公司内部最好有一套自己的代码编写规范，包含其命名，函数式子变成，换行风格，语义化命名等。

### 3.接口校验

[使用 typescript-json-schema 校验接口](https://github.com/kerwin-ly/Blog/blob/master/tools/json-schema.md)

### 4.版本发布，自动生成 CHANGELOG

[如何根据commit自动生成CHANGELOG](https://github.com/kerwin-ly/Blog/blob/master/tools/changelog.md)

### 5.CodeReview
`codereview`是保持项目代码质量的关键。前期尤其是新同学进入的时候，建议多提commit给其主要开发人员review（每次commit保持更改不要过多）。同时，在其他开发人员提代码review时，最好在中间流程中也添加新同学。让新同学能快速学习，借鉴风格。

## 测试
TODO

## 参考

[从零到一建立一套完整的前端规范](https://juejin.cn/post/7085257325165936648)

[clean-javascript](https://github.com/ryanmcdermott/clean-code-javascript)
