# var、let 和 const 的区别

## var 的特点

var 存在变量提升，在全局环境下，会挂载到 window 对象上。如下：

```js
if (false) {
  var a = 'test';
}
console.log(a); // undefined
var b = 'test2';
console.log(b === window.b); // true
```

上述代码中，可以看到`if(false)`条件里面的代码不会被执行，但`console.log(a)`依然不会报错。这是因为在创建执行上下文的变量对象过程时，会将`var`关键字声明的语句提升到当前作用域的顶端。所以实际执行代码如下：

```js
var a; // 变量提升
if (false) {
  a = 'test';
}
console.log(a); // undefined
var b = 'test2';
console.log(b === window.b); // true
```

## let 的特点

let 的特点主要如下：

- 暂时性死区（被let声明的变量，只有在被初始化赋值后，才可以被访问）

```js
let a = 'test';
(function() {
  console.log(a); // 报错：ReferenceError: Cannot access 'a' before initialization
  let a = 'test2';
})()
```

- let 声明会形成一个块级作用域，所有外面的语句块访问不到

```js
if (true) {
  let a = 'test';
}
console.log(a); // 报错：ReferenceError: a is not defined
```

上面代码中，`if(true)`内部形成了块级作用域。所以全局作用域中无法访问到`a`。

- 块级作用域内，无法重复声明已有的变量

```js
var a = 'test';
let a = 'test1'; // 报错：SyntaxError: Identifier 'a' has already been declared
```

上述代码中，即使是用 var 进行的声明，一样会报错。

但如果在块级作用域外，是不影响的。如下：

```js
let a = 'test';
if (true) {
  let a = 'test1';
}
console.log(a); // test
```

## const 的特点

const 的特点和 let 几乎一致。其额外还有一个特点是：const 主要用于声明常量使用。如果声明的是基本类型，该基本类型无法修改；如果声明的是引用类型，引用类型存在`栈内存`中的指针（该指针指向引用类型在`堆内存`中的值）无法修改，但可以修改`堆内存`中的值。

```js
const a = 'test';
a = 'test1'; // 报错：TypeError: Assignment to constant variable.
```

```js
const a = { name: 'kerwin' };
a.name = 'bob';
console.log(a); // bob
```

## 一些常见的面试题

### 1. 每间隔 1 秒依次打印一个 1-5 的数字

如果直接用 let，我们很快就能写出来，如下：

```js
for (let i = 1; i <= 5; i++) {
  setTimeout(() => {
    console.log(i);
  }, 1000 * i);
}
```

但如果换成 var，则会出现每隔 1 秒打印一次数字 6。这是由于浏览器机制的`Event Loop`导致的，同步任务执行完后，已经退出循环，i 为 6 了。这时候才触发了`异步任务`setTimeout。

那么，为什么我们换成了 let 就行了呢。我们可以通过`babel-loader`来看下编译结果。

编译前的 ES6 代码如下：

```js
for (let i = 1; i <= 5; i++) {
  setTimeout(() => {
    console.log(i);
  }, 1000 * i);
}
```

babel-loader 编译结果如下：

```js
var _loop = function _loop(i) {
  setTimeout(function () {
    console.log(i);
  }, 1000 * i);
};

for (var i = 1; i <= 5; i++) {
  _loop(i);
}
```

通过上述代码，我们可以看到。`babel-loader`实际是通过一个闭包函数来对每次遍历的 i 进行了一个存储。

类似的题型还有，`实现点击li标签，打印出对应标签中的值`等。如下：

```html
<ul id="test">
  <li>1</li>
  <li>2</li>
  <li>3</li>
</ul>
```

如果不使用 let，也可以直接用闭包完成

```js
var node = document.getElementById('test');
for (var i = 0; i < node.children.length; i++) {
  (function (index) {
    node.children[index].onclick = function () {
      console.log(node.children[index].innerText);
    };
  })(i);
}
```
