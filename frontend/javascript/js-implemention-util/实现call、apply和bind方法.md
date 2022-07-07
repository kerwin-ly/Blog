# call、apply 和 bind 函数的实现

### 1.实现 call 方法

```js
// 在node环境中，函数内this指向global；在函数外，this是指向module.exports，如果没声明，则是一个空对象{}
// 在浏览器环境中，全局环境的this均指向window
function getGlobalContext() {
  return this; 
}
Function.prototype._call = function (context) {
  if (typeof this !== "function") {
    throw new Error("Type Error");
  }
  let callObj = context ?? getGlobalContext(); // 获取当前绑定的调用对象
  // arguments是包含所有实参的类数组对象，第一个参数是当前绑定的this，当前this也可以通过arguments[0]来获取
  const args = [...arguments].slice(1); // 将arguments转换为数组并获取call方法中所有实参
  callObj.fn = this; // this就是目标函数的引用。如下面的 function getName() {},将目标函数保存为调用对象的一个属性。如下面测试demo中: obj.fn = function getName() {}
  const result = callObj.fn(...args); // 执行调用对象下的fn方法，相当于将目标函数的this指向调用对象
  delete callObj.fn; // 删除临时key
  return result; // 返回并执行目标函数
};

// 以下为测试demo
const name = "kerwin";
const obj = {
  name: "obj-name",
};
function getName() {
  return this.name;
}
console.log(getName()); // 浏览器环境中输出kerwin，node环境中输出undefined
console.log(getName._call(obj)); // obj-name
```

### 2.实现 apply 方法

与上面的 call 方法类似，唯一区别在于，apply 方法的实参是一个数组包裹的

```js
function getGlobalContext() {
  return this;
}
Function.prototype._apply = function (context, arr = []) {
  if (typeof this !== "function") {
    throw new Error("Type Error");
  }
  const callObj = context ?? getGlobalContext();
  callObj.fn = this;
  let result = null;

  if (arr.length) {
    result = callObj.fn(...arr);
  } else {
    result = callObj.fn();
  }
  delete callObj.fn;
  return result;
};

// 以下为测试demo
const name = "global";
const obj = {
  name: "obj-name",
};
function getName(a, b) {
  return this.name + a + b;
}
console.log(getName(1, 2)); // 浏览器环境中输出 global12，node环境中输出 NaN（因为this.name是undefined）
console.log(getName._apply(obj, [1, 2])); // obj-name12
```

### 3.实现 bind 方法

在实现 bind 方法时，我们需要注意：

> 一个绑定函数也能使用 new 操作符创建对象：这种行为就像把原函数当成构造器。提供的 this 值被忽略，同时调用时的参数被提供给模拟函数。

为印证上述这句话，我们来看一个例子：

```js
const obj = {
  value: 1,
  name: "obj-name",
  age: "obj-age",
};
function getName(name, age) {
  this.name = name;
  this.age = age;
  console.log(this.name); // kerwin
  console.log(this.age); // 12
  console.log(this.value); // undefined
}
const fn = getName.bind(obj, "kerwin");
const instance = new fn(12);
```

上面这行代码`getName`方法绑定了`obj`作为其调用者，所以`this`指向`obj`。但在后面对返回的`bind函数 fn`进行了实例化，所以 this 实际指向了实例对象`instance`。所以最终打印为`kerwin 12 undefined`，而不是`obj-name obj-age 1`。

```js
Function.prototype._bind = function (context) {
  if (typeof this !== "function") {
    throw new Error("Type Error");
  }
  const args = Array.prototype.slice.call(arguments, 1); // 获取当前函数的实参，第0个值是当前函数的执行上下文this
  const self = this; // 此时的this指向即目标函数。如下面demo中的 function getName() {}
  const tempFn = function () {}; // 临时函数，用于实例化赋值使用

  const bindFn = function () {
    const boundArgs = Array.prototype.slice.call(arguments); // 此时的arguments是绑定函数的所有实参，新绑定函数的所有参数
    // 修改getName方法的执行上下文this指向
    return self.apply(
      // 如果是个构造函数，由于下方通过bindFn.prototype = new tempFn()实现了继承，那么可以判定tempFn构造函数是在this实例上；
      // 如果是一个普通函数，此时的this指向全局window
      this instanceof tempFn ? this : context,
      args.concat(boundArgs)
    );
  };
  // 利用一个临时函数中转，否则直接使用bindFn.prototype = this.prototype时，会导致修改bindFn原型链上的方法，也直接修改了原函数
  // bindFn.prototype = this.prototype;
  tempFn.prototype = this.prototype; // 原型继承
  bindFn.prototype = new tempFn(); 
  return bindFn;
};

const obj = {
  name: 'obj-name',
  age: 'obj-age',
  value: 'obj-value'
};
function getName(name, age, value) {
  this.name = this.name ?? name;
  this.age = this.age ?? age;
  this.value = this.value ?? value;
  // 使用new操作符实例化后，this指向该实例instance。而不是obj
  console.log(this.name); // kerwin
  console.log(this.age); // 12
  console.log(this.value); // instance
}
const fn = getName._bind(obj, "kerwin");
const instance = new fn(12, 'instance');
```
