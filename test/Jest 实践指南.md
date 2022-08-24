# Jest 实践指南

本文主要记录阅读完[《Jest 实践指南》](https://github.yanhaixiang.com/jest-tutorial)的一些收获和心得体会。

## 一、安装 & 配置

针对一个 Typescript 项目搭建测试环境。

### 1. 初始化 package.json

```shell
npm init
```

### 2. 安装依赖

```shell
pnpm add -D typescript@^4.6.3 jest@27.5.1 ts-jest@27.1.4 @types/jest@27.4.1
```

注意： **jest 的版本和 ts-jest 的大版本需要一致，如：都是`v27`**

### 3. 初始化 jest

```shell
# 使用jest-cli初始化
npx jest --init
```

初始化成功后就可以看到下面`jest.config.js`

```ts
module.exports = {
  // 自动清除所有mock数据
  clearMocks: true,

  // 是否生成测试覆盖率结果
  collectCoverage: true,

  // 生成测试覆盖率的输出文件地址
  coverageDirectory: "coverage",

  coverageProvider: "v8",

  // 测试环境，jsdom这个库用 JS 实现了一套 Node.js 环境下的 Web 标准 API。便于我们在jest里直接使用如localStorage等全局api
  testEnvironment: "jsdom",
};
```

### 4. 集成 Typescript

如今前端大多数项目都是 Typescript 开发，所以我们在编写单元测试时，也尽量使用 ts。

jest 本身并不会对 Typescript 进行转译，我们使用`ts-jest`来实现，也就是`tsc`。当然你也可以使用`esbuild`和`swc`来提升转译的速度。

初始化 ts 环境

```shell
npx tsc --init
```

执行上述命令，会在当前路径下生成一个`tsconfig.json`文件：

```json
{
  "compilerOptions": {
    "target": "es2016",
    "module": "commonjs",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

在`tsconfig.json`中配置 jest 类型

```json
// tsconfig.json
{
  "compilerOptions": {
    ...,
    "types": ["node", "jest"]
  }
}
```

配置`jest.config.js`文件

```js
// jest.config.js
module.exports = {
  ...,
  preset: "ts-jest"
}
```

### 5. 环境测试

上述安装和配置完工后，我们可以通过一个 demo 来检查环境是否配置正确。

新建`src/utils/sum.ts`文件：

```ts
const sum = (a: number, b: number) => {
  return a + b;
};

export default sum;
```

新建`tests/utils/sum.jest.ts`文件：

```ts
// tests/utils/sum.jest.ts
import sum from "../../src/utils/sum";

describe("sum", () => {
  it("Get sum of two nums", () => {
    expect(sum(1, 1)).toEqual(2);
  });
});
```

执行`npm run test`命令

如果环境配置正确，你会看到下面结果：

![jest1](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/test/jest1.png)

## 二、项目实践

### 配置别名

在项目中，我们通常会使用路径别名`alias`来避免相对路径的写法。如：

```ts
// 相对路径写法
import sum from "../../src/utils/sum";

// 路径别名
import sum from "@/utils/sum";
```

在编写 ts 业务逻辑时，我们需要在`tsconfig.json`中添加`paths`路径映射：

```json
// tsconfig.json
{
  ...,
  "baseUrl": "./",
  "paths": {
    "@/*": [
      "src/*"
    ]
  },
}
```

而在 jest 文件中，我们还需要在`jest.config.js`中进行配置。下面介绍`moduleDirectories`和`moduleNameMapper`两个属性，其都可以达到`alias`的效果。

- 方法一：配置`moduleDirectories`

如果你期望的引用结果是`import sum from "utils/sum"`，那么`moduleDirectories`配置能满足你。

```js
// jest.config.js
module.exports = {
  moduleDirectories: ["node_modules", "src"],
  // ...
};
```

配置`moduleDirectories`后，**jest 在编译时会把所有引用都当作一个第三方包**。根据`moduleDirectories`的值，jest 先在`node_modules`中查找是否存在该依赖，没找到则去`src`目录中查找。

所以在引用`sum`方法时，可以直接写成：

```js
// sum.test.ts
// 原始写法
import sum from "../../src/utils/sum";

// 配置moduleDirectories后，引用方式
import sum from "utils/sum";
```

- 方法二：配置`moduleNameMapper`

如果你期望的引用结果是`import sum from "@/utils/sum"`，那么`moduleDirectories`就不适合了，我们应该使用`moduleNameMapper`配置。

其原理和`tsconfig`的路径映射类似

```js
// jest.config.js
{
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1",
  },
}
```

所以可以修改引入方式如下：

```js
// sum.test.ts
// 原始写法
import sum from "../../src/utils/sum";

// 配置moduleDirectories后，引用方式
import sum from "@/utils/sum";
```

### setupFilesAfterEnv && setupFiles

在执行某些测试文件前，需要一些“前置条件”，比如：启动一个 `mock server`。我们借助`setupFilesAfterEnv`和`setupFiles`属性来实现

- `setupFiles` 是在 引入测试环境（比如`jsdom`）之后 执行的代码

- `setupFilesAfterEnv` 则是在 安装测试框架之后 执行的代码

他们的执行顺序如下：

**初始化测试环境 => setupFiles => 初始化测试框架(Jest) => setupFilesAfterEnv => 执行测试文件(xxx.jest.ts)**

实际应用场景：

我们可以在 `setupFiles`中添加对测试环境的补充，比如：`Mock` 全局变量 abcd 等。

在 `setupFilesAfterEnv` 可以对测试框架添加插件或者补充，比如：引入和配置 `Jest/Jasmine`（Jest 内部使用了 Jasmine） 插件。

```js
// jest.config.js
{
  setupFiles: ["./tests/jest-setup.ts"],
}
```
