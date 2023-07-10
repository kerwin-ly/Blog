# js 设计模式

> 设计模式的定义是:在面向对象软件设计过程中针对特定问题的简洁而优雅的解决方案。

## 一 设计原则

### 1.单一职责原则(Single Responsibility Principle, SRP)

> 单一职责原则体现为：**一个对象(方法)只做一件事情**（eg: 装饰者模式 ，代理模式，单例模式等）

需要注意的是，不是所有的职责都应该被一一分离。一方面，如果随着需求的变化，有两个职责总是同时变化，那就不必分离他们。（如：`ajax`创建`XMLHttpRequest`和发送`xhr`请求）另一方面，某些情况下，两个职责被耦合在一起，但几乎没有变化的可能性，就没有必要分开它们。等到真正变化的时候，再解耦也不迟。

- 优点：降低了单个类或者对象的复杂度，**按照职责把对象分解成更小的粒度**， 这有助于代码的复用，也有利于进行单元测试。当一个职责需要变更的时候，不会影响到其他 的职责。

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
// good, 将职责划分到各个函数中去。一个函数仅拥有一个职责，并进行关联。可以很清晰的了解开发者的用意
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
![对象引用](https://raw.githubusercontent.com/kerwin-ly/Blog/main/assets/imgs/intermediary-false.png)

很明显的，你违背了迪米特法则。对象的四处引用会导致你的程序变得不太牢固。也许你可以尝试下用`中介者模式`来进行改造
![中介者模式](https://raw.githubusercontent.com/kerwin-ly/Blog/main/assets/imgs/intermedinary-true.png)

这里使用一个中介者模式进行举例，如我们使用“滴滴打车”。用户只需要向平台发起“叫车”请求，平台便会自动放出这一消息，司机直接通过平台进行“抢单”。

```ts
interface Client {
  getTaxi();
  pay();
}

interface Car {
  isWorking: boolean;

  startWork();
  finishWork();
}

interface Mediator {
  registerClient(client: Client);
  registerCar(car: Car);

  getCar(): Car;
  pay(car: Car);
  updateCarStatus(car: Car);
}

class User implements Client {
  taxi: Car;

  constructor(private mediator: Mediator) {
    this.mediator.registerClient(this);
  }

  getTaxi() {
    this.taxi = this.mediator.getCar();
    if (this.taxi) {
      console.log('车来了');
    } else {
      console.log('没叫到车');
    }
  }

  pay() {
    this.mediator.pay(this.taxi);
    console.log('付款');
  }
}

class Taxi implements Car {
  isWorking: boolean = false;

  constructor(private mediator: Mediator) {
    this.mediator.registerCar(this);
  }

  startWork() {
    console.log('有人叫车');
    this.isWorking = true;
    this.mediator.updateCarStatus(this);
  }

  finishWork() {
    console.log('送完这趟了');
    this.isWorking = false;
    this.mediator.updateCarStatus(this);
  }
}

class DiDi implements Mediator {
  private clientList: Array<Client> = [];
  private carList: Array<Car> = [];

  registerClient(client: Client) {
    this.clientList.push(client);
  }

  registerCar(car: Car) {
    this.carList.push(car);
  }

  getCar(): Car {
    let car = this.carList.find((o) => !o.isWorking);
    car.startWork();
    return car;
  }

  pay(car: Car) {
    car.finishWork();
  }

  updateCarStatus(car: Car) {
    console.log(`车子状态：${car.isWorking ? '工作' : '闲置'}`);
  }
}
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
      return calculatedArea + Math.pow(shape.radius, 2) * Math.PI;
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
    return Math.pow(this.radius, 2) * Math.PI;
  }
}

function calculateAreasOfMultipleShapes(shapes: Shape[]) {
  return shapes.reduce((calculatedArea, shape) => {
    return calculatedArea + shape.getArea();
  }, 0);
}
```

上面的例子中可以看出，遵守开放-封闭原则，我们的代码多了许多。而开放-封闭原则是一个看起来比较虚幻的原则，我们很难在第一次了解需求的时候就知道哪些地方可能改变。所以，我们在第一次开发时，最好还是优先保证项目交付，让代码尽可能简洁即可。当需求变化时，再去考虑“封装”并遵守开放-封闭原则。不然，可能会导致你过度封装，代码臃肿。（举个极端例子，客户让你计算地球的体积，你按球体计算即可，没必要考虑地球变方了，又去把计算体积的方法进行抽象封装）

### 4.里式置换原则(Liskov Substitution Princple, LSP)

主要阐述了有关继承的一些原则，也就是什么时候应该使用继承，什么时候不应该使用继承，以及其中蕴含的原理。其核心**子类可以扩展父类的功能，但不能改变父类原有的功能**

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

#### 简单工厂

根据不同参数创建不同的对象，但一个新的权限出现时。不需要修改外部代码，可以直接调用`new UserFactory().create()`。但内部需要额外增加判定条件。

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

上面的代码虽然达到了目的，但明显违背了我们刚提到的`开放封闭原则`。如果新增一个角色，则需要进入`create()`方法内部去添加一个条件。接下来，我们使用`工厂方法`来重构。

#### 工厂方法

当遇到不同的“产品”，需要不同的“加工”时候，我们可以考虑工厂方法。

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

#### 抽象工厂

同样隐藏了具体产品的生产，不过生产的是多种类产品。当需要生产的是一个产品族，并且产品之间或多或少有关联时可以考虑抽象工厂方法。（如：生产枪时，除了生产枪，还需要生产其弹药；创建用户时，除了创建用户，还需要创建其角色权限等）

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

简单工厂，工厂方法，抽象工厂的区别
![对象引用](https://raw.githubusercontent.com/kerwin-ly/Blog/main/assets/imgs/factory.jpeg)


### 3. 代理模式

为一个对象提供一个代用品或占位符，以便控制它的访问。

**注意**：代理对象并不会在另一对象的基础上添加方法或修改其方法，也不会简化那个对象的接口，它实现的接口与本体完全相同，所有对它进行的方法调用都会被传递给本体。在实际开发中，当遇到访问对象需要权限验证 or 请求接口十分耗时，需要缓存数据时，我们可以使用代理模式来处理。

```ts
interface IBookLibrary {
  getBook: (bookName: string) => Book;
  addBook: (book: Book) => void;
}

interface BookList {
  [bookName: string]: Book;
}

interface Book {
  author: string;
  name: string;
}

export default class Client {
  public static userTest(): Book {
    const proxy = new BookProxy('user');

    return proxy.getBook('book-a');
  }

  public static adminTest(): void {
    const proxy = new BookProxy('admin');

    proxy.addBook({
      name: 'book-a',
      author: 'kerwin',
    });
    const book = proxy.getBook('book-a');
    console.log(book);
  }
}

// 代理
class BookProxy implements IBookLibrary {
  private readonly bookLibrary: BookLibrary;
  private readonly role: string;

  constructor(role: string) {
    this.role = role;
    this.bookLibrary = new BookLibrary();
  }

  public getBook(bookName: string): Book {
    return this.bookLibrary.getBook(bookName); // 如果遇到请求耗时操作，这里也可以加一层缓存，从缓存中直接返回数据
  }

  public addBook(book: Book): void {
    if (this.role === 'user') {
      throw new Error('Dont have right to add'); // 加一层权限拦截
    }
    this.bookLibrary.addBook(book);
  }
}

// 主体
class BookLibrary implements IBookLibrary {
  private books: BookList;

  constructor() {
    this.books = {} as BookList;
  }

  public getBook(bookName: string): Book {
    if (!this.books[bookName]) {
      throw new Error(`The book ${bookName} does not exsits`);
    }
    return this.books[bookName];
  }

  public addBook(book: Book): void {
    this.books[book.name] = book;
  }
}

Client.adminTest();
// Client.userTest();
```

### 4. 观察者模式

它定义对象间的一种一对多的依赖关系，当一个对象的状 态发生改变时，所有依赖于它的对象都将得到通知。

```ts
class Subject {
  private observers: Observer[] = [];

  public addObserver(observer: Observer): void {
    console.log(observer, 'is pushed!');
    this.observers.push(observer);
  }

  public deleteObserver(observer: Observer): void {
    console.log('remove', observer);
    const n: number = this.observers.indexOf(observer);
    n != -1 && this.observers.splice(n, 1);
  }

  public notifyObservers(): void {
    console.log('notify all the observers', this.observers);
    this.observers.forEach((observer) => observer.notify());
  }
}

interface Observer {
  notify: Function;
}

class ConcreteObserver implements Observer {
  constructor(private name: string) {}

  notify() {
    console.log(`${this.name} has been notified.`);
  }
}

function show(): void {
  const subject: Subject = new Subject();
  subject.addObserver(new ConcreteObserver('Semlinker'));
  subject.addObserver(new ConcreteObserver('Kakuqo'));
  subject.notifyObservers();
  subject.deleteObserver(new ConcreteObserver('Lolo'));
  subject.notifyObservers();
}
```

### 5. 策略模式

定义一系列的算法，把它们一个个封装起来，并且使它们可以互相替换。

一个基于策略模式的程序至少由两部分组成。

- 第一个部分：一组策略类 strategy，策略类封装了具体的算法，并负责具体的计算过程。
- 第二个部分：环境类 Context , Context 接受客户的请求，随后把请求委托给某一个策略类。

```ts
interface Strategy {
  S: (salary: number) => number;
  A: (salary: number) => number;
  B: (salary: number) => number;
}
// strategy
const strategy: Strategy = {
  S: function (salary: number): number {
    return salary * 4;
  },
  A: function (salary: number): number {
    return salary * 3;
  },
  B: function (salary: number): number {
    return salary * 2;
  },
};

// Context
var calcluateBouns = function (level: string, salary: number): number {
  if (xx) {
  }
  return strategy[level](salary);
};
console.log(calcluateBouns('S', 4000)); // 输出16000
console.log(calcluateBouns('A', 3000)); // 输出9000
console.log(calcluateBouns('B', 2000)); // 输出4000
```
