# TypeScript 学习笔记

> 参考连接：
> [深入理解 TypeScript](https://jkchao.github.io/typescript-book-chinese/#why)
> [官方文档](https://www.tslang.cn/docs/home.html)

## 安装配置

全局安装 typescript

```bash
npm install -g typescript
```

编译 ts 文件

```bash
# 生成hello.js
tsc hello.ts

# 监听ts文件变化
tsc -w hello.ts
```

## 笔记

### 1.基础类型

#### 1.1 基本数据类型

```js
// 布尔值
let isNumber: boolean = false;

// 数字
let num: number = 123;

// 字符串
let str: string = "kerwin";

// null && undefined：默认情况下null和undefined是所有类型的子类型
```

#### 1.2 其他类型

```js
// 数组
let arr: Array<number> = [1, 2, 4];
let anyArr: any[] = [1, true, 'kerwin'];

// 元组
let x: [string, number, boolean];
x = ['kerwin', 23, true]; // 当对远足进行初始化或赋值的时候，需要提供所有元组类型中的指定的项
x = ['kerwin']; // 报错
x.push('jim'); // 当添加越界的元素，它的类型会被限制为元组中每个类型的联合类型
x.push(Symbol(1)); // 报错

// object
let x: f

// 枚举
enum Flag { Error, Success } // 如果没有赋值，那么他的值就是下标（从0开始）
enum Flag { Error = 1, Success } // 从1开始计算
enum Color { Primary = 'blue', Danger = 'red', Warning = 'yellow'.length }; // 注意：如果紧接在计算所得项后面的是未手动赋值的项，那么它就会因为无法获得初始值而报错
let colorName: Color = Color.Primary;
enum Color {Red = "red".length, Green, Blue}; // 报错
const enum Color { Primary, Danger } // 常数枚举，不能包含计算成员
declare enum Color { Primary, Danger } // 外部枚举

// any
let x: any = 'kerwin';
x = 123;

// void:当一个函数值没有返回值时，返回void类型
function logName(): void {
  console.log('kerwin');
}

// never:表示那些永不存在的值（类似抛出异常或根本）
function error(message: string): never {
  throw new Error(message);
}

// object
function create(o: object | null): void {
  console.log(o);
}
create({
  name: 'kerwin'
})
```

#### 1.3 类型断言

第一种：as 写法（jsx 中语法只支持这种）

```js
let value: any = 'maybe string';
let num: number = (value as string).length
```

第二种：尖括号

```js
let value: any = 'maybe string';
let num: number = (<string>value).length
```

#### 1.4 联合类型：该值是多个类型中的任意一种

```js
let value: string | number;
value = "123";
value = 123;
```

### 2.接口

#### 2.1 接口限制

如果使用`interface`中没有定义的字段，将报错

限制接口中的字段：

```js
interface Person {
  name: string;
  age: number;
  gendar?: boolean;
}

// sex可选属性,多加一个接口中不存在的属性，报错
let tom: Person = {
  name: "Tom",
  age: 22,
  isMan: true // 这个属性是接口中不存在的，会报错
};
```

不限制接口中的字段，注意：**一旦定义了任意属性，那么确定属性和可选属性的类型都必须是它的类型的子集**

```js
interface Person {
  name: string;
  age?: number;
  [propName: string]: any; // 如果这里写的是string类型，由于number不是string的子类型，将报错
}

let tom: Person = {
  name: "Tom",
  age: 25,
  gender: "male"
};
```

#### 2.2 可选属性

```js
interface Person {
  name: string;
  age?: number;
}

let tom: Person = {
  name: "Tom"
};
```

#### 2.3 只读属性

```js
interface Person {
  readonly id: number;
  name: string;
  age: number;
}

let tom: Person = {
  id: 1,
  name: 'kerwin',
  age: 23
}

tom.id = 2; // 报错：Cannot assign to 'id' because it is a constant or a read-only property.
```

#### 2.4 函数类型

```js
interface GetPerson {
  (name: string, age: number): object;
}

let tom: GetPerson = function(name: string, age: number): object {
  return {
    name,
    age
  };
};
```

#### 2.5 索引类型

限制数组

```js
interface UserArr {
  [index: number]: string; // 小标必须是number类型，值必须是string类型
}
let userArr: UserArr = ["kerwin", "bob"];
```

限制对象

```js
interface UserObj {
  [index: string]: string;
}
let userObj: UserObj = {
  name: "kerwin",
  sex: "man"
};
```

#### 2.6 接口继承接口

```js
interface Animal {
  name: string,
  age: number,
  (lang: string)?: object
}

interface Cat extends Animal {
  look: string
}

let cat: Cat = {
  name: 'cat',
  age: 4,
  look: 'cat'
}
```

#### 2.7 接口继承类

```js
class Point {
  x: number;
  y: number;
}

interface Point3d extends Point {
  z: number;
}

let point3d: Point3d = { x: 1, y: 2, z: 3 };
```

### 3.函数

在 typescript 中必须把函数的输入和输出考虑到

#### 3.1 函数声明

注意：**函数参数中，可选参数后面不允许再出现必须参数了**

```js
// 输入number类型，输出number类型
function sum(x: number = 20, y?: number): number {
  return x + y;
}

// 函数操作，不返回具体的值
function do(x: number): void {
  console.log(x);
}
```

#### 3.2 函数表达式

通过赋值操作，类型推论出左侧变量的类型

```js
let mySum = function(x: number, y: number): number {
  return x + y;
};
```

手动赋值定义左侧变量类型，注意:**这个箭头函数是表明函数输出的类型，不是 es6 中的箭头函数**

```js
let mySum: (x: number, y: number) => number = function(
  x: number,
  y: number
): number {
  return x + y;
};
```

#### 3.3 接口定义函数的形状

```js
interface sunFunc {
  (x: number, y: number): number;
}

let mySum: sunFunc = function(x: number, y: number): number {
  return x + y;
};
```

#### 3.4 函数扩展参数

```js
function sum(a: number, ...result: number[]): number {
  let sum = a; // a = 0

  for (let i = 0; i < result.length; i++) {
    sum += result[i];
  }
  return sum;
}

sum(0, 1, 2, 3, 4, 5); // 将0赋值给a,剩下的实参参数传给result
```

#### 3.5 函数重载

```js
```

### 4.声明文件

declare 定义的类型只会用于编译时的检查，编译结果中会被删除

只声明类型，全局变量的声明文件主要有以下几种语法：

- `declare var` 声明全局变量
- `declare function` 声明全局方法
- `declare class` 声明全局类
- `declare enum` 声明全局枚举类型
- `declare namespace` 声明（含有子属性的）全局对象
- `interface` 和 `type` 声明全局类型

注意：**在 ts 中，只有 `function`、`class` 和 `interface` 可以直接默认导出，其他的变量需要先定义出来，再默认导出**

```js
// index.d.ts
export default function foo(): string

declare enum Directions {
  Up,
  Down
}
export default Directions;
```

### 5. 内置对象

> 官方定义地址:https://github.com/Microsoft/TypeScript/tree/master/src/lib

#### 5.1 ECMAScript 的内置对象

```js
let b: Boolean = new Boolean(1);
let e: Error = new Error("Error Message");
let d: Date = new Date();
let t: RegExp = /[a-z]/;
```

#### 5.2 DOM 和 BOM 的内置对象

```js
let body: HTMLElement = document.body;
let divList: NodeList = document.querySelectorAll("div");
document.addEventListener("click", function(e: MouseEvent) {
  // do...
});
```

### 6. 类型别名

类型别名用来给一个类型起个新名字，类型别名常用于联合类型。

```js
type Name = string;
type NameResolver = () => string;
type NameOrResolver = Name | NameResolver;
let person: Name = "kerwin";
let getName;

function getName(n: NameOrResolver): Name {
  if (typeof n === "string") {
    return n;
  } else {
    return n();
  }
}
```

### 7. 字符串字面量类型

```js
// 约定事件只能是下面3种的一种，其他事件报错
type EventNames = "click | mousemove | scroll";
function handleEvent(ele: Element, event: EventNames) {
  // do
}

handleEvent(document.getElementById("hello"), "scroll");
```

### 8. 类

> ES6 中类的概念请参考:[类的定义](https://github.com/kerwin-ly/Blog/blob/master/javascript/%E7%B1%BB%E5%92%8C%E7%B1%BB%E7%9A%84%E7%BB%A7%E6%89%BF.md)

#### 8.1 访问修饰符 public privete protected

public 修饰的属性或方法是公有的，可以在任何地方被访问到，默认所有的属性和方法都是 public 的。默认使用

```js
class Animal {
  name: string; // 等同于 public name: string
  public constructor(name: string) {
    this.name = name;
  }
}
let a: Animal = new Animal('Jack');
console.log(a.name); // Jack
```

private 修饰的属性或方法是私有的，不能在声明它的类的外部访问

```js
class Animal {
  private name;
  private constructor(name) {
    this.name = name;
  }
}

class Cat entends Animal {
  constructor(name) {
    super(name);
    console.log(this.name); // 报错
  }
}
```

protected 修饰的属性或方法是受保护的，它和 private 类似，区别是它在子类中也是允许被访问的

```js
class Animal {
  static kind: string; // 静态属性声明
  protected name: string;
  protected constructor(n: string) {
    this.name = n;
  }
  static getKind() { // 静态方法声明
    console.log(Animal.kind); // 静态属性调用
  }
}

class Cat entends Animal {
  constructor(name) {
    super(name);
    console.log(this.name); // jack
  }
}

Animal.getKind(); // 静态方法调用
```

#### 8.2 抽象类 abstract

用于定义抽象类和其中的抽象方法

- 不允许被实例化
- 抽象类中的抽象方法必须被子类实现

```js
abstract class Animal {
  public name;
  public constructor(name) {
    this.name = name;
  }
  public abstract getName();
}

class Cat extends Animal {
  // 子类必须实现抽象方法，否则报错
  public getName() {
    console.log(this.name);
  }
}

let cat = new Cat('Kerwin');
cat.getName();
```

#### 8.3 类实现接口 implements

一般来讲，一个类只能继承自另一个类，有时候不同类之间可以有一些共有的特性，这时候就可以把特性提取成接口`interface`，用`implements`关键字来实现。

```js
interface Animal {
  name: string;
  say(): void;
}

// 相当于约束Cat类，必须含有某些属性和方法
// class Cat extends Animal implements AnimalLimit {}
class Cat implements Animal {
  public name: string;
  constructor(n: string) {
    this.name = n;
  }
  public say(): void {
    console.log(this.name);
  }
}
```

### 9. 泛型

泛型（Generics）是指在定义函数、接口或类的时候，不预先指定具体的类型，**而在调用的时候再指定类型的一种特性**。它保证了咱们在复用组件时，传入不同的类型后函数返回对应的不同类型。

泛型方法

```js
// T相当于一个变量，保证了咱们传入和输出值是同一个类型
function identity<T>(arg: T): T {
  return arg;
}

let output = identity < string > "myString";
```

泛型类

```js
class Animal<T> {
  public name: T
  constructor(name: T) {
    this.name = name;
  }
  say(): void {
    console.log(this.name);
  }
}
let cat = new Animal<string>('cat');
cat.say();
```

泛型接口

```js
interface Config {
  <T>(value: T): T;
}
var getData: Config = function<T>(value: T): T {
  return value;
};
getData < string > "kerwin";
```

泛型映射

```js
// interface DBI<T> {}
// class MysqlDb<T> implements DBI<T> {} // 如果要实现一个泛型接口，类也必须是泛型类

class MysqlDb<T> {
  add(info: T):boolean {
    console.log(info);
    return true;
  }
}

class User {
  username: string | undefined;
  password: string | number;
}

let u = new User();
u.username = 'kerwin';
u.password = '123321';

let db = new MysqlDb<User>(); // 把类当作参数，传入到泛型类中
db.add(u);
```

#### 9.1 多个类型参数

```js
function swap<T, U>(tuple: [T, U]): [U, T] {
  return [tuple[1], tuple[0]];
}

swap([7, "seven"]); // ['seven', 7]
```

#### 9.2 类型约束

```js
// 限制参数必须有length属性
interface Lengthwise {
  length: number
}

function loggingIdentity<T entends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}
```

#### 9.3 泛型接口

```js
interface CreateArrayFunc<T> {
  (length: number, value: T): Array<T>;
}

let createArray: CreateArrayFunc;
createArray = function<T>(length: number, value: T): Array<T> {
  let result: T[] = [];
  for (let i = 0; i < length; i++) {
    result[i] = value;
  }
};

createArray(3, "x"); // ['x', 'x', 'x']
```

#### 9.4 泛型类

```js
class GenericNumber<T> {
  zeroValue: T;
  add: (x: T, y: T) => T;
}

let myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = function(x, y) { return x + y; };
```

### 10. 装饰器

装饰器是一种特殊类型的声明，它能够被附加到类声明，方法， 访问符，属性或参数上。在不改动或最小改动情况下，新增逻辑。

#### 10.1 类装饰器

普通装饰器

```js
function extraName(params: any) { // 这里的params指代的就是下面的类
  return class extends params {
    // 重写getName方法
    public kind: string = 'fist'
    getName() {
      console.log('kind changed' + this.kind);
    }
  }
}

@extraName
class Animal {
  constructor(
    public kind: string
  ) {}
  getName() {
    console.log('kind is' + this.kind);
  }
}

var b = new Animal('bird');
b.getName();
```

装饰器工厂

```js
function extraName(name: string) {
  // 这里的name是装饰器传递进来的参数
  return function(params: any) {
    // 这里的params对于静态成员来说是类的构造函数，对于实例成员是类的原型对象
    params.prototype.name = name;
  }
}

@extraName('kerwin')
class Animal {
  constructor(
    public kind: string
  ) {}
  getName() {
    console.log('...');
  }
}

var b = new Animal('bird');
console.log(b.name, b.kind);
```

#### 10.2 属性装饰器

```js
function changeKind(kind: string) {
  return function(params: any, key: string) { // params => 对于静态成员来说是类的构造函数，对于实例成员是类的原型对象，key => 属性名
    params[key] = kind; // 修改kind
  }
}

class Animal {
  @changeKind('kerwin')
  public kind: string | undefined;

  constructor() {}

  getName() {
    console.log(this.kind);
  }
}

var d = new Animal('bird');
d.getName();
```

#### 10.3 方法装饰器

```js
function changeKind(kind: string) {
  return function(params: any, methodName: any, descriptor: string) { // params => 对于静态成员来说是类的构造函数，对于实例成员是类的原型对象，methodName => 方法名， descriptor => 属性描述器
    console.log(params, methodName, descriptor);
    params[key] = kind; // 修改kind
  }
}

class Animal {
  public kind: string | undefined;

  constructor() {}

  @changeKind('kerwin')
  getName() {
    console.log(this.kind);
  }
}

var d = new Animal('bird');
d.getName();
```
