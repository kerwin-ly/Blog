# Angular项目开发
>总结一下一个新的项目，如何规范的维护

## 开发

### 1.工程架构
目前前端的三大框架，各自都有自己的`cli`工具进行快速构建。大体的结构不会差太多。但在我们开发中，还是可能会出现各自开发的模块结构混乱问题。最好具体到某一个模块，有一个清晰的描述，拿angular项目举例
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
维护同一个项目，开发同学的编码风格最好保持一致。最好统一编辑器，如: `vscode`，安装对应的`lint`工具。如`Prettier`之类的去自动format代码。

#### 2.代码规范文档 
`lint`工具可以帮助我们解决大多数的代码风格问题，但有些是无法检测的。公司内部最好有一套自己的代码编写规范，包含其命名，函数式子变成，换行风格，语义化命名等。

### 3.接口校验
>typescript-json-schema, 约束后台接口必须返回的字段
在我们的开发中，常常会出现这种情况。某天，页面突然崩了，发现js在报错。打包上去的代码一般来说都是压缩过的，你可能花费很长一段时间，去排查了问题所在。然而发现...是后台没有返回某个关键字段引起的。这会浪费很多不必要的时间。如果想解决类似的问题，推荐使用其`typescript-json-schema`。在开发时候，约束其接口必须返回的字段。如不返回，可以直接抛错并打印其返回值。（也可以用`sentry`之类的，去日志中查看）

全局安装`typescript-json-schema`
```shell
npm install -g typescript-json-schema
```

TODO

### 4.版本发布，自动生成CHANGELOG
>参考文章[规范你的 commit message 并且根据 commit 自动生成 CHANGELOG.md](https://juejin.im/post/5bd2debfe51d457abc710b57) [官方文档](https://github.com/conventional-changelog/commitlint)

commitlint规范git提交并配置，[文档链接](https://github.com/conventional-changelog/commitlint#config)
```shell
npm install --save-dev @commitlint/cli
```

全局安装`conventional-changelog-cli`
```shell
npm install -g conventional-changelog-cli
```

本地安装`changelog`依赖
```shell
npm install conventional-changelog-lint-config-canonical conventional-changelog-lint --save-dev
```

使用
```shell
# 不会覆盖以前的 Change log，只会在 CHANGELOG.md 的头部加上自从上次发布以来的变动
conventional-changelog -p angular -i CHANGELOG.md -s -p 

# 生成所有发布的 Change log
conventional-changelog -p angular -i CHANGELOG.md -w -r 0
```

## 测试
