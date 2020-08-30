# js 设计模式

> 设计模式一共有 23 种

## 一 设计原则

### 1.单一职责原则(Single Responsibility Principle, SRP)

> 单一职责原则体现为：**一个对象(方法)只做一件事情**（eg: 装饰者模式 ，代理模式，单例模式，单例模式等）

需要注意的是，不是所有的职责都应该被一一分离。一方面，如果随着需求的变化，有两个职责总是同时变化，那就不必分离他们。（如：`ajax`创建`XMLHttpRequest`和发送`xhr`请求）另一方面，某些情况下，两个职责被耦合在一起，但几乎没有变化的可能性，就没有必要分开它们。等到真正变化的时候，再解耦也不迟。

- 优点：降低了单个类或者对象的复杂度，按照职责把对象分解成更小的粒度， 这有助于代码的复用，也有利于进行单元测试。当一个职责需要变更的时候，不会影响到其他 的职责。

- 缺点：最明显的是会增加编写代码的复杂度。当我们按照职责把对象分解成更小的粒度之后，实际上也增大了这些对象之间相互联系的难度。

“单一职责原则”是咱们在开发中最常见的一个规则，比起一个上百行代码的“胖函数”，拆成一个个更小颗粒的函数并组装，会显得更加易读，优雅。

下面是 cli 工具中根据 yapi 生成 service 代码的部分逻辑

```ts
// not good, 如果不考虑单一职责，一个run函数就可以执行完所有逻辑，但让代码的阅读者着实头痛。
async run(projectId: string, answers: inquirer.Answers) {
  const swaggerAddress = cwd() + '/swaggerApi.json'; // 本地swagger保存地址
  try {
      const user = await yApi.login({ email: yapiConfig.email, password: yapiConfig.password });

      if (user.errcode && user.errcode !== 0) {
        error('Error: ' + user.errmsg);
        process.exit(1);
      }
      const swagger = await yApi.getSwaggerJson({
        type: 'xxx',
        pid: Number(projectId),
        status: 'all',
        isWiki: false,
      });

      if (swagger.errcode && swagger.errcode !== 0) {
        if (swagger.errcode === 502) {
          error(`Error: You don't have rights to download swaggerApi.json`);
        } else {
          error('Error: ' + swagger.errmsg);
        }
        process.exit(1);
      }
      fs.writeFileSync(localAddress, JSON.stringify(swagger, null, '\t'));
      log(`${chalk.green('✔')}  Successfully created swaggerApi.json in the root directory`);
    } catch (err) {
      throw err;
    }
    const swaggerJson = require(swaggerAddress);
    const str = tags.reduce((total: string, item: Tag) => (total += item.name), '');
    const reg = /.*[\u4e00-\u9fa5]+.*$/i;
    if (reg.test(str)) return;
    const packageJson = require(cwd() + '/package.json');

    if (packageJson['devDependencies']['xxx']) return;
    install({
      devDependencies: ['xxx'],
    });
}
```

```ts
// good, 将职责划分到各个函数中去。一个函数仅拥有一个职责，并进行关联。可以很亲清晰的了解开发者的用意
async run(projectId: string, answers: inquirer.Answers) {
  const swaggerAddress = cwd() + '/swaggerApi.json';
  await this.downloadSwaggerJson(projectId, swaggerAddress); // 下载swaggerApi.json到本地
  const swaggerJson = require(swaggerAddress);
  if (this.hasChinese(swaggerJson.tags)) { // 判断swagger的分类是否含有中文
    error('Error: Tags should be english in yapi');
    return;
  }
  this.installPackages(); // 安装依赖
  ...
}
```

### 2.最少知识原则/迪米特法则(Least Knowledge Principle)

> `迪米特法则`是指尽量较少对象与对象之间的引用，如果迫不得已，最好是通过第三方对象来对这两个对象进行通信。而不让两个对象直接发生关系。（eg: 中介者模式，外观模式）

- 优点：可以实现对象之间的关系解耦，避免混乱的对象之间的引用

- 缺点：当系统的体量十分庞大时，也会导致中介者对象十分复杂，难以维护

如果你的对象引用是如下这种情况
![对象引用](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/intermediary-false.png)

很明显的，你违背了迪米特法则。对象的四处引用会导致你的程序变得不太牢固。也许你可以尝试下用`中介者模式`来进行改造
![中介者模式](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/intermediary-false.png)

这里使用一个中介者模式进行举例，如开发一个聊天室系统，咱们应尽量避免用户之间直接发送信息，而是通过“中介者-聊天室”来进行消息传递。如果还需要额外的信息，如发送图片等，直接在中介者类中添加即可，不会对用户类和以前的功能产生耦合。

```ts
// 举例：中介者模式
// 聊天室类
class CharRoom {
  static showMessage(name: string, message: string) {
    console.log(`${name}：${message}`);
  }
}

// 抽象
abstract class User {
  protected name: string;

  public abstract sendMessage(message: string): void;
}

class Jock extends User {
  constructor() {
    super();
    this.name = 'Jock';
  }

  public sendMessage(message: string): void {
    CharRoom.showMessage(this.name, message);
  }
}

class Mary extends User {
  constructor() {
    super();
    this.name = 'Mary';
  }

  public sendMessage(message: string): void {
    CharRoom.showMessage(this.name, message);
  }
}

const mary = new Mary();
const jock = new Jock();

mary.sendMessage('Hello world!');
jock.sendMessage('Hello Vue');
```

### 3.开放-封闭原则(Open Closed Principle, OCP)

> 在面向对象的程序设计中，`开放封闭原则(OCP)`是最重要的一条原则。其意思是当需要对一个程序的某个功能进行新增或改变时候，**对源码的扩展/新增开放，对源码的修改关闭，也就是说尽量在不修改源码逻辑的情况下，通过增加代码的方式来满足变化的需求**。其核心在于区分系统中变化和不变的地方，利用对象的多态性将变化的地方进行封装处理。（几乎所有的设计模式/原则都是遵守开放-封闭原则的）

这里举个例子，计算多边形的面积

```ts
class Rectangle {
  public width: number;
  public height: number;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
}

class Circle {
  public radius: number;
  constructor(radius: number) {
    this.radius = radius;
  }
}

function calculateAreasOfMultipleShapes(shapes: Array<Rectangle | Circle>) {
  return shapes.reduce((calculatedArea, shape) => {
    if (shape instanceof Rectangle) {
      return calculatedArea + shape.width * shape.height;
    }
    if (shape instanceof Circle) {
      return calculatedArea + shape.radius * Math.PI;
    }
  }, 0);
}
```

这时候需求变了。有更多的多边形面积需要计算，如果直接添加`else if`可能会去修改到我们的源代码，如果其源码本身已经很复杂了，则可能导致不必要的影响。那么我们就可以考虑下利用`开放封闭原则`。利用对象的`多态性`来进行重构，把变化的进行封装，让变化的和不变的内容进行隔离。

```ts
interface Shape {
  getArea(): number;
}

class Rectangle implements Shape {
  public width: number;
  public height: number;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
  public getArea() {
    return this.width * this.height;
  }
}

class Circle implements Shape {
  public radius: number;
  constructor(radius: number) {
    this.radius = radius;
  }
  public getArea() {
    return this.radius * Math.PI;
  }
}

function calculateAreasOfMultipleShapes(shapes: Shape[]) {
  return shapes.reduce((calculatedArea, shape) => {
    return calculatedArea + shape.getArea();
  }, 0);
}
```

上面的例子中可以看出，遵守开放-封闭原则，我们的代码多了许多。而开放-封闭原则是一个看起来比较虚幻的原则，我们很难在第一次了解需求的时候就知道哪些地方可能改变。所以，我们在第一次开发时，最好还是优先保证项目交付，让代码尽可能简洁即可。当需求变化时，再去考虑“封装”并遵守开放-封闭原则。不然，可能会导致你过度封装，代码臃肿。（如：客户让你计算地球的体积，你按球体计算即可，没必要考虑地球变方了，又去把计算体积的方法进行抽象封装）

### 4.里式置换原则(Liskov Substitution Princple, LSP)

子类能覆盖父类；父类能出现的地方子类就能出现

### 5.依赖倒置原则(Dependency Inversion Principle, DIP)

编程依赖抽象接口，不要依赖具体实现；使用方只关注接口而不关注具体类的实现；

### 6.接口独立原则(Interface Segregation Principle, ISP)

保持接口的单一独立，避免出现臃肿接口。在使用接口隔离原则时，我们需要注意控制接口的粒度，接口不能太小，如果太小会导致系统中接口泛滥，不利于维护；接口也不能太大，太大的接口将违背接口隔离原则，灵活性较差，使用起来很不方便。

## 二 设计模式

> 针对特定上下文的特定问题的解决方案，这种解决方案被抽象化、模版化，就是设计模式。

### 1.单例模式

一个类仅有一个实例，并提供一个访问它的全局访问点。我们在开发中，`惰性单例`会使用得较多，即需要使用的时候才创建实例

```ts
export class Singleton {
  private static singleton: Singleton;

  private constructor() {}

  public static getInstance(): Singleton {
    if (!Singleton.singleton) {
      Singleton.singleton = new Singleton();
    }
    return Singleton.singleton;
  }
}
```

### 2.工厂模式

https://zhuanlan.zhihu.com/p/120071984

简单工厂：根据不同参数创建不同的对象，但一个新的权限出现时。不需要修改外部代码，可以直接调用`new UserFactory().create()`。但内部需要额外增加判定条件。

举个例子，咱们在新增用户的时候，需要根据用户选择的权限，来新增不同权限的用户。

```ts
class UserFactory {
  create(name: string, age: number, type: string): void {
    if (type === 'Admin') {
      return {
        name,
        age,
        root: 'Admin',
      };
    } else if (type === 'Vip') {
      return {
        name,
        age,
        root: 'Vip',
      };
    }
  }
}

const aa = new UserFactory();
aa.create('Jim', 23, 'Vip');
```

工厂方法：利用多态的方式，去除简单工厂模式中的判断语句。如果需要新增一种权限，即新增一个工厂即可。符合了咱们的`开放封闭原则`。

举个例子，我们需要创建一个用户。如果是`Admin`权限，则将其添加到一个分组下，方便通知系统信息。如果是`Vip`用户，则需要添加一对一的客服人员。这时候，**把工厂抽象出来，让子工厂来决定怎么生产产品, 每个产品都由自己的工厂生产。**

```ts
interface User {
  name: string;
  age: number;
  root: string;
}

abstract class UserFactory {
  public abstract create(name: string, age: number): User;
}

class AdminFactory extends UserFactory {
  public create(name: string, age: number): User {
    this.addAdminGroup(name); // 将其分配到admin分组下
    return {
      name,
      age,
      root: 'Admin',
    };
  }

  private addAdminGroup(name: string): void {
    console.log('将xx用户添加到admin分组中去');
  }
}

class VipFactory extends UserFactory {
  this.addCustomerService(name); // 安排vip一对一服务
  public create(name: string, age: number): User {
    return {
      name,
      age,
      root: 'Vip',
    };
  }

  private addCustomerService(name: string): void {
    console.log('Vip用户安排一对一的客服人员');
  }
}

const aa = new VipFactory();
aa.create('kerwin', 23);
```

抽象工厂：同样隐藏了具体产品的生产，不过生产的是多种类产品。当需要生产的是一个产品族，并且产品之间或多或少有关联时可以考虑抽象工厂方法。（如：生产枪时，除了生产枪，还需要生产其弹药；创建用户时，除了创建用户，还需要创建其角色权限等）

```ts
interface User {
  name: string;
  age: number;
  root: string;
}

interface Role {
  [props: string]: string[];
}

abstract class UserFactory {
  public abstract create(user: User, role: Role): void;
  public abstract createUser(name: string, age: number): User;
  public abstract createRole(name: string): Role;
}

class AdminFactory extends UserFactory {
  public create(user: User, role: Role): void {
    console.log('successfully created');
  }

  public createUser(name: string, age: number): User {
    this.addAdminGroup(name); // 将其分配到admin分组下
    return {
      name,
      age,
      root: 'Admin',
    };
  }

  public createRole(): Role {
    return {
      'Admin': ['add', 'delete', 'update', 'detail']; // 赋予admin角色，拥有增删改查权限
    }
  }

  private addAdminGroup(name: string): void {
    console.log('将xx用户添加到admin分组中去');
  }
}

class VipFactory extends UserFactory {
  public create(user: User, role: Role): void {
    console.log('successfully created');
  }

  public createUser(name: string, age: number): User {

  this.addCustomerService(name); // 安排vip一对一服务
    return {
      name,
      age,
      root: 'Vip',
    };
  }

  public createRole(): Role {
    return {
      'Vip': ['detail'] // 赋予vip角色，拥有查看权限
    }
  }

  private addCustomerService(name: string): void {
    console.log('Vip用户安排一对一的客服人员');
  }
}

const aa = new VipFactory();
const user = aa.createUser('kerwin', 23);
const role = aa.createRole();
aa.create(user, role);
```

## 参考

https://github.com/torokmark/design_patterns_in_typescript/tree/master/singleton
