# 深入理解Angular依赖注入（一）：什么是依赖注入

本文主要结合`Angular`讲述下`依赖注入`的相关知识点，内容如下：

* 为什么需要依赖注入

* 什么是依赖注入

* 依赖注入是如何实现的

## 一、理解依赖注入

在[Angular 官网](https://angular.cn/guide/dependency-injection)中有如下一段对其的概述：

>依赖项是指某个类执行其功能所需的服务或对象。依赖项注入（DI）是一种设计模式，在这种设计模式中，类会从外部源请求依赖项而不是创建它们。

下面，我将通过实际例子来对这段话进行说明

### 1.非依赖注入实现

某天，我们收到一个需求，在`UserService`用户服务中，需要依赖一个`AuthService`授权服务对用户的权限进行校验

so easy 我们直接开淦。代码如下：
```ts
// auth.service.ts 鉴权服务
export class AuthService {
    permissions: string[];

    constructor(permissions: string) {
      this.permissions = permissions;
    }

    check(): void { ... }
}


// user.service.ts 用户服务
export class UserService {
    private authService: AuthService;

    constructor(permissions: string) {
      this.authService = new AuthService(permissions);
    }
}

// test.ts
const user = new UserService(['delete_user']);
```

上述，是我们需求的简单实现，功能上没什么问题，咱愉快的提交了代码。

但第二天，需求变了，鉴权服务还需要提供一个`code`参数用来检查用户工号。很简单，稍微改下就ok了，代码如下：

```ts
// auth.service.ts 鉴权服务
export class AuthService {
    permissions: string[];
    code: string;

    constructor(permissions: string; code: string) {
        this.permissions = permissions;
        this.code = code; // 添加code
    }

    check(): void { ... }
}


// user.service.ts 用户服务
export class UserService {
    private authService: AuthService;

    constructor(permissions: string, code: string) {
        this.authService = new AuthService(permissions, code); // 添加code
    }
}

// test.ts
const user = new UserService(['查看用户'], 'ZZ0001');

```

这时，你会发现上述代码中，由于`AuthService`是在`UserService`内部实例化的，耦合在了一起。所以即使这个参数跟`UserService`没有任何关系，但也需要改动`UserService`去适配新的需求。
```js
constructor(permissions: string, code: string) {
  this.authService = new AuthService(permissions, code); // 添加code
}
```

这里仅仅是举了一个简单的例子，实际场景中，我们的`AuthService`可能还会依赖其他的服务，那么如果按目前的代码设计，我们需要顺着服务依赖的链路，将参数逐层传递，才能够让其正常运行。

观察上述代码，我们会发现，由于`UserService`内部创建了`AuthService`实例，逻辑耦合在了一起，所以在实例化`UserService`的时候，必须把`AuthService`里面需要的参数也一并带入，这里发生了耦合。

那么，我们如果把实例化操作放在外面，是不是就可以解决这个耦合问题了？

我们尝试修改代码如下：

```ts
// auth.service.ts 鉴权服务
export class AuthService {
    permissions: string[];
    code: string;

    constructor(permissions: string; code: string) {
        this.permissions = permissions;
        this.code = code;
    }

    check(): void { ... }
}


// user.service.ts 用户服务
export class UserService {
    private authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
    }
}

// test.ts
const auth = new AuthService(['查看用户'], 'ZZ0001');
const user = new UserService(auth);
```

ok，通过修改，我们一定程度上完成了解耦。不用在其中一个服务改动的时候，还需要改动其他的服务了。

但随着系统越来越复杂，我们发现`UserService`还需要依赖几个服务，这几个服务又依赖了其他服务。难道我们每次要用某个服务的时候，都需要把他的依赖全部创建一遍么？这显然是不合理的。

最理想的结果是，在调用某个服务前，其依赖的服务就全部创建好了，尽管调用即可。

于是，**控制反转**的思想应运而生。

### 2.控制反转和依赖注入

在`维基百科`中，有这样的一段描述：

>控制反转（英语：Inversion of Control，缩写为IoC），是面向对象编程中的一种设计原则，可以用来减低计算机代码之间的耦合度。其中最常见的方式叫做依赖注入（Dependency Injection，简称DI），还有一种方式叫“依赖查找”（Dependency Lookup）。

再结合上面`Angular 依赖注入`描述和实际例子：

>依赖项注入（DI）是一种设计模式，在这种设计模式中，类会从`外部源`请求依赖项而不是创建它们

我们可以简单的进行一下概括：

#### 什么是依赖注入？

在实际开发中，我们在执行某个类（如上述的`class UserService`）时，需要依赖其他的`依赖项`（如：`AuthService`）支撑。我们可以通过`依赖注入框架`(即上述的`外部源`)将执行类的`依赖项`进行分析提取，然后实例化，最后再将实例化后的结果自动注入到该类，来完成对`依赖项`的引用。而不是在`执行类`中直接创建它们。这就是**依赖注入**。

#### 什么是控制反转？

起初，我们需要在执行某个类时，需要手动的去创建它的所有依赖项。而使用`依赖注入`的方式实现后，我们将创建依赖项的逻辑放在了`依赖注入框架`(简称`DI`)中，由`DI`框架控制其创建逻辑，而不是在业务代码中手动去控制，这就是**控制反转**。一句话来说，就是将“创建依赖项”的控制权，由程序本身，转移到了`DI框架`中。

#### 控制反转和依赖注入的关系？

`控制反转`是一种设计原则，`依赖注入`是一种设计模式。系统的最终目的是实现`控制反转`实现解耦，而`依赖注入`是实现`控制反转`的一种手段。

#### 为什么需要依赖注入？

一定程度上实现了松耦合，我们不需要担心执行某个类时，其依赖项的修改导致执行类也需要修改。同时，在执行类中，不会去创建关联其他依赖项，这也让单元测试更加容易。

## 二、依赖注入的简单实现

那么，如何实现一个`依赖注入`功能呢？

大概实现思路是分如下几步：

1.执行某个类之前进行拦截

2.提取执行类中的依赖项，其中包括依赖项目的依赖项

3.实例化各个依赖项

4.将实例化后注入到执行类中

思路已经有了，接着，我们来看其实现细节

### 1. 使用reflect-metadata操作元数据

首先，我们需要用到一个库[reflect-metadata](https://github.com/rbuckton/reflect-metadata)来帮助我们完成第1，2步

>Reflect Metadata 是 ES7 的一个提案，它主要用来在声明的时候添加和读取元数据。在定义一个类时，咱们可以先通过`Reflect.defineMetadata`存储一些类型相关的数据，然后在实际调用类时，通过`Reflect.getMetadata`获取之前定义的数据。

首先安装这个库

```shell
npm i reflect-metadata --save
```

我们通过一个例子来简单描述下其功能。如果我们需要在执行`UserService`类之前定义一个值，并在其他地方使用它的话，你可以如此做：

```ts
import 'reflect-metadata';

function Injectable() {
  return function (target: any) {
    
    Reflect.defineMetadata('user_info', { name: 'kerwin' }, target); // 为目标对象target添加一个 “key为user_info，value为{name: 'kerwin'}”的元数据
    return target;
  };
}

class AuthService {
    constructor() {}
}

@Injectable()
class UserService {
  constructor(private authService: AuthService) {}
}

console.log(Reflect.getMetadata('user_info', UserService)); // 输出结果 => { name: 'kerwin' }
```

按照上面的例子，我们把`依赖项`作为`@Injectable`装饰器的参数放进去，就可以在执行类之前获取到具体的依赖项了。代码如下：

```ts
import 'reflect-metadata';

function Injectable(constructorArgs: any[]) {
  return function (target: any) {
    Reflect.defineMetadata('dependencies', constructorArgs, target);
    return target;
  };
}

class AuthService {
    constructor() {}
}

@Injectable([AuthService])
class UserService {
  constructor(private authService: AuthService) {}
}

console.log(Reflect.getMetadata('dependencies', UserService)); // 输出结果 => [ [Function: AuthService] ]
```

到了这一步，我们就可以通过`@Injectable`装饰器和`reflect-metadata`库，获取到执行类的依赖项了

emm...但这里的获取方法仍有点麻烦，我们需要在`@Injectable`里面把所有参数都写一遍，但在`Angular`使用时，我们却不需要如此做。这是什么原因呢？

### 2. `emitDecoratorMetadata`属性的妙用

这就引出了我们接下来的一个配置项`emitDecoratorMetadata`

下面是来自官网对这个属性的概述
>With the introduction of Classes in TypeScript and ES6, there now exist certain scenarios that require additional features to support annotating or modifying classes and class members. Decorators provide a way to add both annotations and a meta-programming syntax for class declarations and members.

如果你想获取更多信息，可以查阅[文档](https://www.typescriptlang.org/docs/handbook/decorators.html)

这里，我们直接讲使用方式。

在 `tsconfig.json` 里配置 `emitDecoratorMetadata` 为`true`，开启该功能。

```json
{
  "compilerOptions": {
    ...
    "emitDecoratorMetadata": true
  }
}
```

配置完成后，我们运行代码，即可通过`Reflect.getMetadata('design:paramtypes', target)`直接获取到依赖项，无需添加装饰器的参数。如下：

```ts
import 'reflect-metadata';

function Injectable() {
  return function (target: any) {
    return target;
  };
}

class AuthService {
    constructor() {}
}

@Injectable()
class UserService {
  constructor(private authService: AuthService) {}
}

console.log(Reflect.getMetadata('design:paramtypes', UserService)); // 输出结果 => [ [Function: AuthService] ]
```

这样，就和我们平时使用`Angular`的方式有点近似了。但它是如何实现的呢？其实也很简单

下面我们将`emitDecoratorMetadata`分别设置为`false`和`true`，并将`ts`编译为`js`来分析

emitDecoratorMetadata: false
```js
"use strict";
// ... 部分代码省略
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
function Injectable() {
    return function (target) {
        return target;
    };
}
...
var UserService = /** @class */ (function () {
    function UserService(authService) {
        this.authService = authService;
    }
    UserService = __decorate([
        Injectable()
    ], UserService);
    return UserService;
}());
...
```

emitDecoratorMetadata: true
```ts
"use strict";
// ...部分代码省略
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v); // 通过Reflect.metadata将入参参数生成元数据，并返回
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
function Injectable() {
    return function (target) {
        return target;
    };
}

var UserService = /** @class */ (function () {
    function UserService(authService) {
        this.authService = authService;
    }
    UserService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [AuthService]) // 在装饰器中，执行__metadata方法，将"design:paramtypes"和[AuthService]作为参数传递
    ], UserService);
    return UserService;
}());
...
```

注意上面生成的js代码，我们可以看到，当设置为`emitDecoratorMetadata: true`后，会自动在`装饰器`中定义一个key为`design:paramtypes`，value是依赖项数组的一个`元数据`。

这也是我们为什么在设置`emitDecoratorMetadata: true`后，无需传递参数，便可通过`Reflect.getMetadata('design:paramtypes', UserService)`直接获取到其执行类中的依赖项的原因

ok，在执行某个类之前，我们已经能到获取到对应的依赖项了。最后便是实例化创建的实现了

### 3. 实现源码

源码戳[这里](https://github.com/kerwin-ly/Blog/tree/main/demo/di) 大概实现代码如下：
```ts
import 'reflect-metadata';

const providers: any[] = [];
const instanceMap = new Map();

function Injectable() {
  return function (_constructor: any) {
    providers.push(_constructor); // 将需注入的类添加到providers数组中，区分普通类
    return _constructor;
  };
}

// 鉴权服务
@Injectable()
class AuthService {
  checkPermission(): void {
    console.log('check permission in AuthSerivce');
  }
}

// 本地存储服务
@Injectable()
class LocalStorageService {
  save(): void {
    console.log('save user in LocalStorageService');
  }
}

// 存储服务
@Injectable()
class StorageService {
  constructor(private localStorageService: LocalStorageService) {}

  save(): void {
    this.localStorageService.save();
  }
}

// 用户服务
@Injectable()
class UserService {
  constructor(
    private authService: AuthService,
    private storageService: StorageService
  ) {
    this.authService.checkPermission();
    this.storageService.save();
  }
}

// 创建实例
function create(target: any) {
  const dependencies = Reflect.getMetadata('design:paramtypes', target);
  const args = (dependencies || []).map((dep: any) => {
    if (!hasProvider(dep)) {
      throw new Error(`${dep.name} has no provider!`);
    }

    const cache = instanceMap.get(dep);
    if (cache) {
      return cache;
    }

    let instance;
    // 如果参数有依赖项，递归创建依赖项实例
    if (dep.length) {
      instance = create(dep);
      instanceMap.set(dep, instance);
    } else {
      // 参数没有依赖项，直接创建实例
      instance = new dep();
      instanceMap.set(dep, instance);
    }
    return instance;
  }) as any;
  return new target(...args);
}

// 判断该类是否通过Injectable注入到了DI系统中
function hasProvider(dep: any): boolean {
  return providers.includes(dep);
}

create(UserService);
```

以上是`依赖注入`的简单实现，没有考虑`环形依赖`等诸多复杂场景。感兴趣的可以研究`Angular 依赖注入系统`的实现[injector.ts](https://github.com/angular/angular/blob/main/packages/core/src/di/injector.ts)

## 总结

最后，我们做一个总结。`依赖注入`就是通过`DI框架`（外部源）将程序中`服务类`所需的**依赖项**进行提取并实例化，最后**自动注入**到指定`服务类`中的一种设计模式。其无需我们在`服务类`中再手动创建实例，规避了类与类之间的高度耦合的情况。

## 参考链接

[维基百科-控制反转](https://zh.wikipedia.org/wiki/%E6%8E%A7%E5%88%B6%E5%8F%8D%E8%BD%AC)

[Angular 中的依赖注入](https://angular.cn/guide/dependency-injection)

[Decorators in Typescript](https://www.typescriptlang.org/docs/handbook/decorators.html)

[如何基于 TypeScript 实现控制反转](https://zhuanlan.zhihu.com/p/311184005)
