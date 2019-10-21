# JavaScript设计模式与开发实践

## 面向对象的javascript

### 1.静态类型语言/动态类型语言
>静态类型语言是在编译时便确定了其变量的类型，如果有类型错误在编译时能提前预知，规定了其变量的类型也保证了代码的健壮性。而动态类型语言：在代码执行时才能确定其变量的类型

## 设计模式

### 1.原型模式
从 设计模式的角度讲，原型模式是用于创建对象的一种模式。原型模式的实现关键在于语言本身是否提供了`clone`方法。如ECMAScript 5 提供了 Object.create 方法，可以用来克隆对象。在js中，一个对象的创建，实际上相当于*一个对象的克隆/继承*，JavaScript 中的根对象是 Object.prototype 对象。

原型继承：如果对象b和其原型上没有属性`name`，请求将通过`__proto__`记录委托给其构造器的原型如：`Object.prototype`去查找。但这不是无限制的，当查找到`Object.prototype`时候还没有查找到`name`。由于其构造器的原型`Object.prototype`值为`null`，而`null`没有prototype了。原型链的请求便终止。返回`undefined`
```ts
const obj = { name: 'kerwin' };
obj.__proto__ === Object.Prototype // true

ar A = function(){}; A.prototype = { name: 'sven' };
var B = function(){}; B.prototype = new A();
var b = new B();
console.log( b.name ); // 输出:sven
```

### 2.单例模式