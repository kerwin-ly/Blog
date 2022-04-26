# 实现new操作符
new 关键字会进行如下的操作：

1. 首先创建了一个新的空对象

2. 设置原型，将对象的原型设置为函数的 prototype 对象。

3. 让函数的 this 指向这个对象，执行构造函数的代码（为这个新对象添加属性）

4. 判断函数的返回值类型，如果是值类型，返回创建的对象。如果是引用类型，就返回这个引用类型的对象。

```js
function _new() {
  const constructor = Array.prototype.shift.call(arguments); // 获取构造函数
  if (typeof constructor !== "function") {
    throw new Error("TypeError");
  }
  const obj = Object.create(constructor.prototype); // 构建一个新对象，对象的原型为构造函数的prototype。即：obj.__proto__ === constructor.prototype
  const result = constructor.apply(obj, arguments); // 修改this指向

  return (typeof result === "object" || typeof result === 'function') ? result : obj; // 判断返回结果
}

// 测试demo
function Parent(name) {
  this.name = name;
}
const a = _new(Parent, 'kerwin');
console.log(a.name); // 输出kerwin
```

这里补充下`Object.create()`的实现

```js
create(proto) {
  function F() {}
  F.prototype = proto;
  return new F();
}
```