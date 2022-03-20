# 实现new操作符
new 关键字会进行如下的操作：

1. 创建一个空的简单JavaScript对象（即{}）；

2. 为步骤1新创建的对象添加属性__proto__，将该属性链接至构造函数的原型对象 ；

3. 将步骤1新创建的对象作为this的上下文 ；

4. 如果该函数没有返回对象，则返回this

```js
function _new() {
  const obj = new Object(); // 创建一个新对象
  const constructor = Array.prototype.shift.call(arguments); // 获取构造函数
  obj.__proto__ = constructor.prototype; // 将构造函数与新创建的对象链接起来
  const result = constructor.apply(obj, arguments); // 修改this指向
  return typeof result === 'object' ? result : obj; // 如果有返回结果，则返回，否则返回当前 this指向
}

// 测试demo
function Parent(name) {
  this.name = name;
}
const a = _new(Parent, 'kerwin');
console.log(a.name); // 输出kerwin
```
