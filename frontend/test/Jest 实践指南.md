# Jest 实践指南

本文主要记录阅读完[《Jest 实践指南》](https://github.yanhaixiang.com/jest-tutorial)的一些收获和总结。

## 一、安装 & 配置

针对一个 Typescript 项目搭建测试环境。

### 1. 初始化 package.json

```shell
npm init
```

### 2. 安装依赖

```shell
pnpm install -D typescript@^4.6.3 jest@27.5.1 ts-jest@27.1.4 @types/jest@27.4.1
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

  // 测试环境，jsdom这个库用 JS 实现了一套 Node.js 环境下的 Web 标准 API。便于我们在Jest里直接使用如localStorage等全局api
  testEnvironment: "jsdom",
};
```

### 4. 集成 Typescript

如今前端大多数项目都是 Typescript 开发，所以我们在编写单元测试时，也尽量使用 ts。

Jest 本身并不会对 Typescript 进行转译，我们使用`ts-jest`来实现，也就是`tsc`。当然你也可以使用`esbuild`和`swc`来提升转译的速度。

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

![jest1](https://raw.githubusercontent.com/kerwin-ly/Blog/main/assets/imgs/test/jest1.png)

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

如果使用`webpack`编译打包，还需要配置`webpack.config.js`：

```js
// webpack.config.js
module.exports = {
  ...
  resolve: {
    ...,
    // 设置别名
    alias: {
      "@": path.join(__dirname, "src/"),
    },
  },
};
```

而在 Jest 文件中，我们还需要在`jest.config.js`中进行配置。下面介绍`moduleDirectories`和`moduleNameMapper`两个属性，其都可以达到`alias`的效果。

- 方法一：配置`moduleDirectories`

如果你期望的引用结果是`import sum from "utils/sum"`，那么`moduleDirectories`配置能满足你。

```js
// jest.config.js
module.exports = {
  moduleDirectories: ["node_modules", "src"],
  // ...
};
```

配置`moduleDirectories`后，**jest 在编译时会把所有引用都当作一个第三方包**。根据`moduleDirectories`的值，Jest 先在`node_modules`中查找是否存在该依赖，没找到则去`src`目录中查找。

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

### 测试环境 setupFilesAfterEnv && setupFiles

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

### Mock 网页地址

前面，我们在`jest.config.js`中配置了`jsdom`使 Node 环境中有一套完整的 Web Api 体系。但其并不能解决所有问题，比如：修改网页地址

下面，我们通过一个例子来说明这个问题

需求：编写一个函数，将 url 中的 query 字符串转换为 object。如：当前 url 是`https://www.test.com?name=kerwin&id=123`，函数输出结果为`{name: 'kerwin', id: '123'}`

代码实现逻辑如下：

```ts
// src/utils/location.ts
export function convertUrlStrToObj() {
  return Object.fromEntries(
    new URLSearchParams(window.location.search).entries()
  );
}
```

上述代码要在 ts 环境中执行，还需要配置`tsconfig.json`的`lib`参数，不然会报`fromEntries`和`entries`类型不存在的问题。

```json
// tsconfig.json
{
  ...,
  "lib": ["dom", "dom.iterable", "esnext"]
}
```

接下来，编写测试文件

```ts
// tests/utils/location.test.ts
import { convertUrlStrToObj } from "@/utils/location";

describe("convertUrlStrToObj", () => {
  it("Get current url query object", () => {
    window.location.href = "https://www.test.com?name=kerwin&id=123";
    console.log(window.location.href); // 这里打印结果是: http://localhost
    expect(convertUrlStrToObj()).toEqual({ name: "kerwin", id: "123" });
  });
});
```

上述测试代码执行后，会直接报错。是由于我们通过`window.location.href`方法并没有成功地修改当前网页地址。

那么，如何快捷的**修改当前网页地址呢？**

我们仅需要一个 npm 包 [jest-location-mock](https://github.com/evelynhathaway/jest-location-mock)，即可帮助我们实现 Mock Location 的功能。

首先安装依赖

```shell
pnpm install -D jest-location-mock
```

新增入口文件`jest-setup.ts`

```js
// tests/jest-setup.ts
import "jest-location-mock";
```

配置`setupFilesAfterEnv`属性，将`jest-setup.ts`文件加入测试环境中。每初始化 Jest 后，先执行该文件，再执行对应的测试文件。

```js
// jest.config.js
{
  ...,
  setupFilesAfterEnv: ["./tests/jest-setup.ts"]
}
```

然后将修改当前网页地址的代码替换为新 api

```js
// 之前的写法，修改当前网页地址失败
window.location.href = "https://www.test.com?name=kerwin&id=123";

// 引入jest-location-mock的写法，修改成功
window.location.assign("https://www.test.com?name=kerwin&id=123");
```

### 业务组件测试

> 该场景代码：https://github.com/kerwin-ly/jest-demo/pull/1

在平时开发中，我们遇到最多的应该是关于组件的测试。下面我们通过一个例子来实现：

需求：实现一个 `AuthButton`组件，点击该组件，调用 Api，获取当前用户的身份并展示在按钮上。

业务功能实现：

安装`axios`依赖

```shell
pnpm install -D axios@0.26.1
```

新建 `src/components/AuthButton/index.tsx`

```js
// src/components/AuthButton/index.tsx
import React, { FC, useEffect, useState } from "react";
import { Button, ButtonProps, message } from "antd";
import classnames from "classnames";
import styles from "./styles.module.less";
import { getUserRole, UserRoleType } from "@/apis/user";

type Props = ButtonProps;

// 身份文案 Mapper
const mapper: Record<UserRoleType, string> = {
  user: "普通用户",
  admin: "管理员",
};

const AuthButton: FC<Props> = (props) => {
  const { children, className, ...restProps } = props;

  const [userType, setUserType] = useState<UserRoleType>();

  // 获取用户身份并设置
  const getLoginState = async () => {
    const res = await getUserRole();
    setUserType(res.data.userType);
  };

  useEffect(() => {
    getLoginState().catch((e) => message.error(e.message));
  }, []);

  return (
    <Button {...restProps} className={classnames(className, styles.authButton)}>
      {mapper[userType!] || ""}
      {children}
    </Button>
  );
};

export default AuthButton;
```

新建`src/components/AuthButton/style.module.less`

```less
// src/components/AuthButton/style.module.less
.authButton {
  border: 1px solid red;
}
```

新建`src/apis/user.ts`

```js
// src/apis/user.ts
import axios from "axios";

// 用户角色身份
export type UserRoleType = "user" | "admin";

// 返回
export interface GetUserRoleRes {
  userType: UserRoleType;
}

// 获取用户角色身份
export const getUserRole = async () => {
  return axios.get < GetUserRoleRes > "https://mysite.com/api/role";
};
```

修改`src/App.tsx`

```ts
// src/App.tsx
import React from "react";
import { Button } from "antd";
import AuthButton from "./components/AuthButton";

const App = () => {
  return (
    <div>
      <section>
        <AuthButton>登录</AuthButton>
      </section>
    </div>
  );
};

export default App;
```

新建全局类型声明文件 `src/types/global.d.ts`，添加 `.less` 文件的类型定义，防止在 `tsx` 中引入 `less` 报错

```ts
// src/types/global.d.ts
declare module "*.less" {
  const content: any;
  export default content;
}
```

业务功能实现后，我们准备编写测试文件。

首先安装依赖

```shell
pnpm install -D @testing-library/react@12.1.4 @testing-library/jest-dom@5.16.4 @types/testing-library__jest-dom
```

::: warning
如果你出现了使用的是`pnpm`管理安装依赖，那么必须安装`@types/testing-library__jest-dom`类型文件，因为`pnpm`中找不到该文件。而如果使用`npm`或者`yarn`则无需安装`@types/testing-library__jest-dom`文件。
:::

- [testing-library/react](https://github.com/testing-library/react-testing-library): 针对 `React` 的测试库，使得我们可以对 tsx 文件中的 React DOM 进行测试

- [testing-library/jest-dom](https://github.com/testing-library/jest-dom): 提供关于 `DOM` 的 Matcher API。如判断某个`DOM`是否在`document`中

使用：

`tests/jest-setup.ts` 里引入该库：

```ts
// tests/jest-setup.ts
import "@testing-library/jest-dom";
// ...
```

同时，要在 `tsconfig.json` 里引入这个库的类型声明：

```json
{
  "compilerOptions": {
    "types": ["node", "jest", "@testing-library/jest-dom"]
  }
}
```

- [jest-transform-stub](https://github.com/eddyerburgh/jest-transform-stub): 对非 JS 静态资源做转译。`Jest` 本身只负责测试，不会转译任何内容，所以当我们一直用 tsc 来转译 `TypeScript`。但由于 tsc 看不懂引入的 .less，导致了 Unexpected Token 报错。所以引入该库，得以让我们在测试的 ts 文件中引入静态资源文件。

使用方式：

在 `jest.config.js` 里添加转译配置

```js
// jest.config.js
module.exports = {
  // ...
  transform: {
    ".+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$":
      "jest-transform-stub",
  },
};
```

新建`tests/components/AuthButton/simple.test.tsx`文件，对`AuthButton`组件测试：

```ts
// tests/components/AuthButton/simple.test.tsx
import { render, screen } from "@testing-library/react";
import AuthButton from "@/components/AuthButton";
import React from "react";

describe("AuthButton", () => {
  it("可以正常展示", () => {
    render(<AuthButton>登录</AuthButton>);

    expect(screen.getByText("登录")).toBeInTheDocument();
  });
});
```

上面，我们仅对`AuthButton`的渲染进行了测试，由于数据是从接口中获取，还需要添加对`HTTP`接口进行`Mock`。

**注意**：这里我们并不对`axios`或`getUserRole()`进行测试，因为这样会让测试变得十分冗余。**过度测试代码细节**并不是我们想要的。我们只通过**真实用户（开发者 或 系统的使用者）**的角度来编写测试代码即可。

该场景中，`AuthButton`明显是由**系统使用者**来触发的。他并不关心我们的接口是通过`axios`还是`fetch`去请求的。只要点击该按钮，能显示正确的用户类型即可。所以，我们只需要**Mock HTTP**。

通过[msw](https://github.com/mswjs/msw)，我们可以对指定接口进行拦截并`Mock`数据。类似`mock.js`。

安装依赖

```shell
pnpm install -D msw@0.39.2
```

先在 `tests/mockServer/handlers.ts` 里添加 `Http` 请求的 `Mock Handler`：

```js
import { rest } from "msw";

const handlers = [
  rest.get("https://mysite.com/api/role", async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        userType: "user",
      })
    );
  }),
];

export default handlers;
```

然后在 `tests/mockServer/server.ts` 里使用这些 `handlers` 创建 `Mock Server` 并导出它：

```ts
import { setupServer } from "msw/node";
import handlers from "./handlers";

const server = setupServer(...handlers);

export default server;
```

在`tests/jest-setup.ts` 里使用 `Mock Server`：

```ts
import server from "./mockServer/server";

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
```

新建`tests/components/AuthButton/mockHttp.test.tsx`，通过`server.use()`指定拦截某接口请求

```ts
import server from "../../mockServer/server";
import { rest } from "msw";
import { render, screen } from "@testing-library/react";
import AuthButton from "@/components/AuthButton";
import React from "react";
import { UserRoleType } from "@/apis/user";

// 初始化函数
const setup = (userType: UserRoleType) => {
  server.use(
    rest.get("https://mysite.com/api/role", async (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ userType }));
    })
  );
};

describe("AuthButton Mock Http 请求", () => {
  it("可以正确展示普通用户按钮内容", async () => {
    setup("user");

    render(<AuthButton>你好</AuthButton>);

    expect(await screen.findByText("普通用户你好")).toBeInTheDocument();
  });

  it("可以正确展示管理员按钮内容", async () => {
    setup("admin");

    render(<AuthButton>你好</AuthButton>);

    expect(await screen.findByText("管理员你好")).toBeInTheDocument();
  });
});
```

### 测试相同函数的多个分支

在平常的代码编写中，同一个函数可能根据不同的条件，会有不同的返回结果。如果对这种场景进行测试，我们便需要用到[jest.spyOn()](https://jestjs.io/docs/jest-object#jestspyonobject-methodname-accesstype)

举个例子针对不同环境，实现不同逻辑的例子

新建`src/utils/env.ts`

```ts
// src/utils/env.ts
export const config = {
  env: "dev",
};
```

上述配置是我们最常见的一种写法。但在测试中，由于`spyOn`只能对函数进行 Mock。所以，我们需要换一种写法。

我们知道，利用`Object.defineProperty`的`getter`和`setter`属性可以对对象进行劫持。那么，将上述配置的写法改成一个函数即可使用`spyOn`了

```ts
// src/utils/env.ts
export const config = {
  get env() {
    return "dev";
  },
};
```

新建`tests/utils/env.test.ts`

```ts
import { config } from "@/utils/env";

describe("spyOn config", () => {
  it("dev", () => {
    jest.spyOn(config, "env", "get").mockReturnValue("dev"); // Mock getEnv function, the return value would be 'dev';
    expect(config.env).toEqual("dev");
  });

  it("prod", () => {
    jest.spyOn(config, "env", "get").mockReturnValue("prod"); // Mock getEnv function, the return value would be 'prod';
    expect(config.env).toEqual("prod");
  });
});
```

## 总结

### 1. 如何确定单元测试的内容？

在刚开始编写`单元测试`时，我们常常对**需要测试哪些逻辑**感到困惑。

我们需要思考单元测试的初衷，是为了让我们的代码更加可靠，让我们对自己的代码充满信心。

那么，如何对自己的代码充满信心呢？那就是给“用户”测试

注意这里的**用户**指的是：**开发者**和**系统用户**

比如：

对于一个工具函数，其“用户”一定是“开发者”。他需要调用这个函数，去实现一些逻辑。而你为了让这个工具函数更加可靠，添加了对其的单元测试。

而对于一个页面的按钮，显然，使用它的是一个“系统用户”才对。这时，我们就需要去测试点击这个按钮后，是否能达到用户期望的目的，**注意不要去关心达到这个目的的过程，不然这将是个无底洞。**

举个实际场景来说：用户点击某个按钮后，需要通过`axios`请求一个接口，然后跳转另一个页面。

这时候你应该想到怎么去测试这个场景呢？思考一下？

我想到的流程是：

1. Mock 点击按钮操作

2. Mock HTTP 接口

3. Mock 当前网址是否发生改变，当前页面是否有指定的元素

具体实现可以参考文章上面的`业务组件测试 案例`。

所以，你可以看到。步骤一，我们并不需要测试`DOM Api`、`axios`、`Route Api`等。这些都不是真实用户关心的。我们仅按照真实用户的操作步骤和流程去测试即可。

想想，如果你在一个业务场景中，对`getRole()`方法添加了测试用例，当这个方法名改变的时候，你的测试用例会直接抛错。这显然是个**假错误**。是我们应该避免的。

所以，**不要过度测试代码细节**。我们需要做的是：**弄清楚这个真实场景，确定真实用户，然后模拟这个场景**。
