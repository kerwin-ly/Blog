## interview

> 参考链接
> [2018 年最新经典 web 前端面试题](https://juejin.im/post/5baa0797f265da0aaa0517e6) > [前端面试总结](https://github.com/InterviewMap/CS-Interview-Knowledge-Map) > [大厂面试回忆录](https://segmentfault.com/a/1190000009662029) > [每天一道大厂面试题](https://github.com/Advanced-Frontend/Daily-Interview-Question)

### HTML && CSS

#### 1.css 的盒模型

标准模型：一个块的总宽度=width+margin(左右)+padding(左右)+border(左右)

怪异模式：width+margin（左右）（既 width 已经包含了 padding 和 border 值）

#### 2.定位问题

static: 默认的定位

absolute: 绝对定位，根据上一个不是 static 定位的元素进行定位，脱离文档流。

relative: 相对定位，根据自身进行定位，设置了定位后，该位置仍然占位，不脱离文档流。

fixed: 根据浏览器进行定位

#### 3.css3 动画属性

> 如果让用 js 去实现一个动画，不考虑兼容性的话尽量使用`requestAnimationFrame` > `requestAnimationFrame`接受一个动画执行函数作为参数，这个函数的作用是仅执行一帧动画的渲染，并根据条件判断是否结束，如果动画没有结束，则继续调用`requestAnimationFrame`并将自身作为参数传入

```
.header {
  animation: mymove 2s infinite;
}

@keyframes mymove {
  from {
    background-color: red;
  }
  to {
    background-color: green;
  }
}
```

```js
let box = document.getElementById("box");
let num = 10;
function step() {
  num += 10;
  box.style.left = num + "px";
  if (num <= 1000) {
    window.requestAnimationFrame(step);
  }
}
window.requestAnimationFrame(step);
```

#### 4.CSS3 中新增伪类举例

:nth-child, :first-of-type, :last-of-type, :enabled, :disabeld, :empty, :not

#### 5.link 和@import 引用样式的区别

1. 一个是标签（不存在兼容性问题），一个是在 css 中的引用（存在兼容性问题）
2. 加载顺序区别。`link`是在页面被加载时候同时加载。而`import`则是在页面全部被下载完后再开始加载
3. 使用`js`控制 dom 样式时候，只能使用`link`标签。`@import`的样式无法修改。

#### 6.事件委托

利用`冒泡`和`e.target`完成事件委托，将事件绑定在`ul`上，点击任意的`li`标签，通过其`e.target`获取

```
<ul id="list">
  <li></li>
  <li></li>
  <li></li>
</ul>
```

```js
var list = document.getElementById("list");
list.addEventListener("click", function(e) {
  console.log(e.target); // 对应点击的li标签
});
```

#### 7.html5 新增了哪些新特性？移除了哪些？

新增

```
现在html5已经不是SGML的子集，主要是对图像，位置，存储等的添加。
绘画canvas
媒介播放的video和audio标签
存储方式sessionStorage,localStorage
更好的语义化标签header,article,footer,nav,section
新的技术webWorker,websocket,Geolocation
```

移除

```
纯表现的元素：basefont，big，center，font, s，strike，tt，u;
对可用性产生负面影响的元素：frame，frameset，noframes；
```

#### 8.CSS 选择符有哪些？哪些属性可以继承？

```
  1.id选择器（ # myid）
  2.类选择器（.myclassname）
  3.标签选择器（div, h1, p）
  4.相邻选择器（h1 + p）
  5.子选择器（ul > li）
  6.后代选择器（li a）
  7.通配符选择器（ * ）
  8.属性选择器（a[rel = "external"]）
  9.伪类选择器（a:hover, li:nth-child）

  可继承的样式： font-size font-family color;

  不可继承的样式：border padding margin width height ;
```

#### 9.右边宽度固定，左边自适应

```
<body>
  <div class="parent">
    <div class="left"></div>
    <div class="right"></div>
  </div>
</body>
```

第一种方法：使用 flex,注意使用`flex: 1`,父元素一定要`display: flex`

```
<style>
.parent {
  display: flex;
}

.left {
  background-color: red;
  height: 300px;
  width: 300px;
}

.right {
  flex: 1;
  background-color: green;
}
</style>
```

第二种方法：使用 calc

```
<style>
.left {
  background-color: red;
  width: 300px;
  height: 300px;
}

.right {
  background-color: green;
  width: calc(100% - 300px);
  height: 300px;
}
</style>
```

第三种方法：使用定位

```
<style>
.parent {
  position: relative;
}

.left {
  position: absolute;
  background-color: red;
  width: 300px;
  height: 300px;
}

.right {
  height: 300px;
  margin-left: 300px;
}
</style>
```

#### 10.怎么用 div 来模拟实现一个 textarea？

关键：我们要知道一个 h5 的属性，那就是 contenteditable，将属性设置成 true 就会使得 div 是可以编辑的。这个属性兼容 IE6 之后的版本，很强大

```
<div id="textarea" contenteditable="true"></div>
```

#### 11.移动端实现 1px 边框

1.用 height：1px 的 div，然后根据媒体查询设置 transform: scaleY(0.5);

```
div {
  height: 1px;
  background: #000;
  -webkit-transform: scaleY(0.5);
  -webkit-transform-origin: 0 0;
  overflow: hidden;
}
```

2.用::after 和::befor,设置 border-bottom：1px solid #000,然后在缩放-webkit-transform: scaleY(0.5);可以实现两根边线的需求

```
div::after {
  content: '';
  width: 100%;
  border-bottom: 1px solid #000;
  transform: scaleY(0.5);
}
```

3.::after 设置 border：1px solid #000; width:200%; height:200%,然后再缩放 scaleY(0.5); 优点可以实现圆角，京东就是这么实现的，缺点是按钮添加 active 比较麻烦。

```
.div::after {
  content: '';
  width: 200%;
  height: 200%;
  position: absolute;
  top: 0;
  left: 0;
  border: 1px solid #bfbfbf;
  border-radius: 4px;
  -webkit-transform: scale(0.5,0.5);
  transform: scale(0.5,0.5);
  -webkit-transform-origin: top left;
}
```

#### 12.如何处理图片懒加载

> 参考连接：[图片懒加载踩坑](https://juejin.im/post/5add55dd6fb9a07aad171f76)

核心：页面进行滑动(注意滑动使用节流函数)，判定`offsetTop <= clientHeight + scrollTop`，则进行图片加载。

#### 13.visibility: hidden 和 display: none 的区别

```
1，display：none会让元素从渲染树中消失，渲染的时候不占据任何空间；visibility：hidden不会让元素从渲染树中消失，渲染的时候仍然占据空间，只是内容不可见。
2，display：none是非继承属性，子孙节点消失是由于元素从渲染树中消失造成，通过修改子孙节点的属性无法显示；visibility：hidden是继承属性，子孙节点消失是由于继承了hidden，通过设置visibility：visible，可以让子孙节点显示。
3，读屏器不会读取display：none的元素内容，而会读取visibility：hidden的元素内容。
```

### JavaScript 基础

#### 1.javascript 有哪些基本数据类型

[基本类型 && 引用类型详解](https://github.com/kerwin-ly/Blog/blob/master/javascript/%E5%9F%BA%E6%9C%AC%E7%B1%BB%E5%9E%8B%E5%92%8C%E5%BC%95%E7%94%A8%E7%B1%BB%E5%9E%8B%E7%9A%84%E5%8C%BA%E5%88%AB.md)

#### 2.原型和原型链

[类和类的继承](https://github.com/kerwin-ly/Blog/blob/master/javascript/%E7%B1%BB%E5%92%8C%E7%B1%BB%E7%9A%84%E7%BB%A7%E6%89%BF.md)

#### 3.apply 和 call 有什么区别

> 参考连接
> [javascript 深入之 call 和 apply](https://github.com/mqyqingfeng/Blog/issues/11)

`apply`和`call`区别不大，都可以改变`this`指针的指向。只是后面参数。`apply`可以接数组，`call`则要一个一个挨着写。

```js
var Person1 = function(name) {
  this.name = name;
};
var Person2 = function() {
  this.getname = function() {
    console.log(this.name); // 这里没有this.name
  };
  Person1.call(this, "kerwin"); // 通过改变指针，获取this.name
};
var person = new Person2();
person.getname(); // linxin
```

call 的实现原理

```js
// 相当于将方法函数作为其对象的一个属性，执行完成后，再将其属性删除
Function.prototype.call2 = function(context) {
  // 首先要获取调用call的函数，用this可以获取
  context.fn = this;
  context.fn();
  delete context.fn;
  ...
}

// 测试一下
var foo = {
  value: 1
};

function bar() {
  console.log(this.value);
}

// 相当于bar的this指针指向了foo
// foo.bar = this;
// foo.bar();
// delete foo.bar;
bar.call2(foo); // 1
```

#### 4.什么是 bind

> [JavaScript 深入之 bind 的模拟实现](https://github.com/mqyqingfeng/Blog/issues/12)
> bind() 方法会创建一个新函数。当这个新函数被调用时，bind() 的第一个参数将作为它运行时的 this，之后的一序列参数将会在传递的实参前传入作为它的参数。(来自于 MDN )

```js
var foo = {
  value: 1
};

function bar() {
  console.log(this.value);
}

// 返回了一个函数
var bindFoo = bar.bind(foo);

bindFoo(); // 1
```

#### 5.作用域和作用域链

> JavaScript 采用`词法作用域`，**函数的作用域在函数定义的时候就决定了**，函数的作用域基于函数创建的位置。而与词法作用域相对的是`动态作用域`，函数的作用域是在函数调用的时候才决定的。（ps:作用域主要有全局作用域，函数作用域，块级作用域）

> 当查找变量的时候，会先从当前上下文的变量对象中查找，如果没有找到，就会从父级(词法层面上的父级)执行上下文的变量对象中查找，一直找到全局上下文的变量对象，也就是全局对象。这样由多个执行上下文的变量对象构成的链表就叫做`作用域链`。(ps:执行上下文，变量对象等概念在`6.js的执行过程`中)

#### 6.js 的执行过程

> 参考连接：
> [js 引擎的执行过程一](https://heyingye.github.io/2018/03/19/js%E5%BC%95%E6%93%8E%E7%9A%84%E6%89%A7%E8%A1%8C%E8%BF%87%E7%A8%8B%EF%BC%88%E4%B8%80%EF%BC%89/) > [js 引擎的执行过程二](https://heyingye.github.io/2018/03/26/js%E5%BC%95%E6%93%8E%E7%9A%84%E6%89%A7%E8%A1%8C%E8%BF%87%E7%A8%8B%EF%BC%88%E4%BA%8C%EF%BC%89/) > [javascript 深入之变量对象](https://github.com/mqyqingfeng/Blog/issues/5)

##### 1.语法分析

分析该 js 脚本代码块的语法是否正确，如果出现不正确，则向外抛出一个语法错误（SyntaxError），停止该 js 代码块的执行，然后继续查找并加载下一个代码块；如果语法正确，则进入预编译阶段

##### 2.预编译阶段

通过语法分析阶段后，进入预编译阶段，遇到`js的运行环境`则开始创建执行上下文。

> js 的运行环境主要有三种
> `全局环境`（js 代码加载完毕后，进入代码预编译即进入全局环境）
> `函数环境`（函数调用执行时，进入该函数环境，不同的函数则函数环境不同）
> `eval`（有安全，性能问题）
> 每进入一个不同的运行环境都会创建一个相应的`执行上下文（Execution Context）`，那么在一段 JS 程序中一般都会创建多个执行上下文，js 引擎会以栈的方式对这些执行上下文进行处理，形成`函数调用栈（call stack）`，栈底永远是全局执行上下文（Global Execution Context），栈顶则永远是当前执行上下文。

创建执行上下文做了什么？

```
1.创建变量对象（Variable Object）（创建arguments对象（函数运行环境下），函数声明提前解析，变量声明提升）
2.建立作用域链（Scope Chain）
3.确定this指向
```

什么是变量对象和活动对象？

> `变量对象(VO)`是执行上下文相关的数据作用域，存储了在上下文中定义的变量和函数声明。在执行阶段之前，`变量对象(VO)`中的属性是不能被访问的。在执行阶段之后，`变量对象(VO)`变成活`活动对象（AO）`，里面的属性都能被访问了，然后开始进行执行阶段的操作。它们其实是同一个对象，只是处于执行上下文中的不同生命周期。

##### 3.执行阶段

> js 是单线程的，但是参与 js 执行的线程主要有 4 个。`JS引擎线程` `事件触发线程` `定时器触发线程` `HTTP异步请求线程`.
> 经典例子：

```js
// 这里主要涉及到了宏任务（同步任务，异步任务），微任务，事件循环（Event Loop）
console.log('script start');

setTimeout(function() {
  console.log('setTimeout');
}, 0);

Promise.resolve(
  console.log('这里是同步');
).then(function() {
  console.log('promise1');
}).then(function() {
  console.log('promise2');
});

console.log('script end');
```

打印的值依次为：`script start`,`script end`,`promise1`,`promise2`,`setTimeout`

如果忘了什么原因就去看[js 引擎的执行过程二](https://heyingye.github.io/2018/03/26/js%E5%BC%95%E6%93%8E%E7%9A%84%E6%89%A7%E8%A1%8C%E8%BF%87%E7%A8%8B%EF%BC%88%E4%BA%8C%EF%BC%89/)

#### 7.将'get-element-by-id'转换为'getElementById'（字符串和数组的基本操作）

```js
function convertLowerToCamel(str, token) {
  var camelList = [];
  var lowerList = str.split(token); // ['get', 'element', 'by', 'id']
  var camelStr = "";

  arr.map((item, index) => {
    var tempStr = "";
    var upperWord = "";

    if (index > 0) {
      upperWord = item.charAt(0).toUpperCase();
      tempStr = upperWord + item.substring(1);
    } else {
      tempStr = item;
    }
    camelList.push(tempStr);
  });

  camelStr = camelList.join("");
  return camelStr;
}

convertToCamelStr("get-element-by-id", "-");
```

#### 8.排序(从小到大排序)

冒泡排序

```js
var arr = [3, 4, 2, 4, 1, 2, 7, 8, 2, 6];

function sort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] > arr[j]) {
        var temp = arr[j];
        arr[j] = arr[i];
        arr[i] = temp;
      }
    }
  }
  return arr;
}
sort(arr);
```

快速排序

```js
function quickSort(arr) {
  if (arr.length <= 1) {
    return arr;
  }

  var left = [];
  var right = [];
  var index = Math.floor(arr.length / 2);
  var target = arr.splice(index, 1)[0];

  for (let i = 0; i < arr.length; i++) {
    if (target > arr[i]) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }
  return quickSort(left).concat([target], quickSort(right));
}

quickSort([1, 4, 2, 3, 7, 9, 10, 2, 1]);
```

#### 9.commonJS && CMD && AMD && ES6 模块化的区别

> 参考链接：[commonJS && CMD && AMD && ES6 模块化详解](https://juejin.im/post/5aaa37c8f265da23945f365c)

AMD 规范（require.js）使用的是异步加载，不会影响后面 js 的执行。他会把所有需要的模块放在一起，等待加载完成之后，然后执行对应的回调函数进行操作。

```js
/** AMD写法 **/
define(["a", "b", "c", "d", "e", "f"], function(a, b, c, d, e, f) {
  // 等于在最前面声明并初始化了要用到的所有模块
  a.doSomething();
  if (false) {
    // 即便没用到某个模块 b，但 b 还是提前执行了
    b.doSomething();
  }
});
```

CMD 规范（sea.js）和 AMD 类似，不过他推崇的是一个按需加载。也就是说，需要用到该模块的时候，再进行一个引用。

```js
/** CMD写法 **/
define(function(require, exports, module) {
  var a = require("./a"); //在需要时申明
  a.doSomething();
  if (false) {
    var b = require("./b");
    b.doSomething();
  }
});
```

1.commonJS 支持动态导入，如`require(${path}/xx.js)`;后者不支持

2.commonJS 是同步导入，因为服务端文件都在本地，导入不会造成太明显的线程阻塞。而 import 是异步导入，大多用于浏览器端，需要对文件进行下载，所以同步导入影响很大。

3.commonJSd 导入的值是对值的拷贝，如果发生改变，不会影响原始值。而 import 导出的值是绑定的，它们指向了同一个内存地址，导出值改变会影响原始值。

#### 10.综合面试题

> [该题分析解答](https://www.cnblogs.com/xxcanghai/p/5189353.html)

```js
function Foo() {
  getName = function() {
    alert(1);
  };
  return this;
}
Foo.getName = function() {
  alert(2);
};
Foo.prototype.getName = function() {
  alert(3);
};
var getName = function() {
  alert(4);
};
function getName() {
  alert(5);
}

Foo.getName(); // 2
getName(); // 4
Foo().getName(); // 1
getName(); // 1
new Foo.getName(); // 2
new Foo().getName(); // 3
new new Foo().getName(); // 3
```

#### 11.节流函数和防抖函数自我实现

> 为解决页面多次调用方法，造成页面卡顿内存泄漏等问题（如：计时器，滑动页面卡顿），提出了节流函数和防抖函数。

节流函数：在一定的时间内，函数只能被触发一次

```js
function throttle(func, wait) {
  var startTime = 0;

  return function() {
    var nowTime = Date.now();

    if (nowTime - startTime > wait) {
      func.call(this);
      startTime = nowTime;
    }
  };
}

function getNum() {
  console.log(Date.now());
}

document.onmousemove = throttle(getNum, 3000);
```

防抖函数：在规定时间内，如果函数被再次触发，则以最新的时间为准，推迟多少时间后触发。总之在规定时间内，如果被触发了多次，就只按最后一次调用为准。

```js
function debounce(func, wait) {
  var timeout;
  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(func, wait);
  };
}

function getNum() {
  console.log(Date.now());
}

document.onmousemove = debounce(getNum, 3000);
```

#### 12.for in 和 for of 的区别

`for of`主要是遍历数据/数组对象/字符串等拥有**迭代器**的集合

`for in`主要是遍历对象，它会遍历所有的可枚举属性，包括原型

#### 13. Generator 函数

> Generator 函数是一个普通函数（状态机），但是有两个特征。一是，function 关键字与函数名之间有一个星号；二是，函数体内部使用 yield 表达式，定义不同的内部状态（yield 在英语里的意思就是“产出”）。

> Generator 方法执行后，并不会返回函数的运行结果。而是一个指向内部状态的指针对象，通过`next`方法，使得指针指向下一个状态。每次调用 next 方法，内部指针就从函数头部或上一次停下来的地方开始执行，直到遇到下一个 yield 表达式（或 return 语句）为止。

> yield 表达式是暂停执行的标记，而 next 方法可以恢复执行

```js
function* hello() {
  console.log(1);
  yield console.log("hello");
  console.log(2);
  yield console.log("word");
}

var h = hello();
h.next();
h.next();
```

#### 14.什么是 this

[加深对 this 的理解](http://huang-jerryc.com/2017/07/15/understand-this-of-javascript/)

#### 15.promise 的实现原理

> 参考连接：[Promise 实现原理（附源码）](https://juejin.im/post/5b83cb5ae51d4538cc3ec354)

> 构造函数 Promise 必须接受一个函数作为参数，我们称该函数为 handle，handle 又包含 resolve 和 reject 两个参数，它们是两个函数。

```js
new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("FULFILLED");
  }, 1000);
});
```

Promise 的状态

```
Pending(进行中)
Fullfilled(已成功)
Rejected(已失败)

Promise对象存在以下三种状态，状态只能由 Pending 变为 Fulfilled 或由 Pending 变为 Rejected ，且状态改变之后不会在发生变化，会一直保持这个状态。

resolve : 将Promise对象的状态从 Pending(进行中) 变为 Fulfilled(已成功)
reject : 将Promise对象的状态从 Pending(进行中) 变为 Rejected(已失败)
resolve 和 reject 都可以传入任意类型的值作为实参，表示 Promise 对象成功（Fulfilled）和失败（Rejected）的值
```

Promise 的 then 方法

```
当 promise 状态变为成功时必须被调用，其第一个参数为 promise 成功状态传入的值（resolve 执行时传入的值）
在 promise 状态改变前其不可被调用
其调用次数不可超过一次
then 方法必须返回一个新的 promise 对象，因此 promise 支持链式调用
```

#### 16.JS 正则表达式

> 参考连接:[JS 正则表达式完整教程](https://juejin.im/post/5965943ff265da6c30653879)

#### 17.异步面试题

```js
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}
async function async2() {
  console.log("async2");
}
console.log("script start");
setTimeout(function() {
  console.log("setTimeout");
}, 0);
async1();
new Promise(function(resolve) {
  console.log("promise1");
  resolve();
}).then(function() {
  console.log("promise2");
});
console.log("script end");

/*
script start
async1 start
async2
promise1
script end
async1 end
promise2
setTimeout
*/
```

[解答连接](https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/7)

#### 18.高阶函数和柯里化的使用

高阶函数：函数可以作为参数传递，也可以作为返回值输出

```js
// 这里我们创建了一个单例模式
let single = function(fn) {
  let ret;
  return function() {
    console.log(ret); // render一次undefined,render二次true,render三次true
    // 所以之后每次都执行ret，就不会再次绑定了
    return ret || (ret = fn.apply(this, arguments));
  };
};

let bindEvent = single(function() {
  // 虽然下面的renders函数执行3次，bindEvent也执行了3次
  // 但是根据单例模式的特点，函数在被第一次调用后，之后就不再调用了
  document.getElementById("box").onclick = function() {
    alert("click");
  };
  return true;
});

let renders = function() {
  console.log("渲染");
  bindEvent();
};

renders();
renders();
renders();
```

函数柯里化:也叫部分求值，柯里化函数会接收一些参数，然后不会立即求值，而是继续返回一个新函数，将传入的参数通过闭包的形式保存，等到被真正求值的时候，再一次性把所有传入的参数进行求值

```js
// 普通函数
function add(x, y) {
  return x + y;
}

add(3, 4); // 7

// 实现了柯里化的函数
// 接收参数，返回新函数，把参数传给新函数使用，最后求值
let add = function(x) {
  return function(y) {
    return x + y;
  };
};

add(3)(4); // 7
```

### 前端框架 && 工具

#### 1.vue 的 mvvm 的实现原理

> 参考连接：[剖析 Vue 实现原理 - 如何实现双向绑定 mvvm](https://github.com/DMQ/mvvm)

```
核心：数据劫持 + 订阅者/发布者模式
```

#### 2.vue-cli 生成了哪些文件

```
build/
  build.js --- 生产环境构建
  check-version.js --- 版本检查(node, npm)
  dev-client.js --- 开发服务器的热重载（用于实现页面的自动刷新）
  dev-server.js --- 构建本地服务器（npm run dev就是执行的它）
  utils.js --- 构建相关的工具
  vue-loader.conf.js --- vue模板的编译
  webpack.base.conf.js --- webpack基础配置
  webpack.dev.conf.js --- webpack开发环境配置
  webpack.prod.conf.js --- webpack生产环境配置
config/
  dev.env.js --- 项目开发环境配置
  index.js --- 项目主要配置
  prod.env.js --- 项目生产环境配置
...
```

#### 2.jQuery 如何自定义插件

jquery 插件实现基本原理，对原型进行继承

```js
// $.fn = jQuery.prototype实际上是对原型的继承
$.fn.myplugin = function() {
  ...
}

// 防止$变量污染，将jquery传参到闭包中执行
(function( $ ) {
  $.fn.myPlugin = function() {
    // this指向jQuery对象
    ...
  };
})( jQuery );
```

一个简单的插件，获取最大高度

```js
(function($) {
  $.fn.maxHeight = function() {
    var max = 0;

    this.each(function() {
      max = Math.max(max, $(this).height());
    });

    return max;
  };
})(jQuery);

var tallest = $("div").maxHeight(); // 返回最高 div 的高度
```

保证 jquery 的链式调用，返回 this(jQuery 实例)

```js
(function($) {
  $.fn.lockDimensions = function(type) {
    return this.each(function() {
      var $this = $(this);

      if (!type || type == "width") {
        $this.width($this.width());
      }

      if (!type || type == "height") {
        $this.height($this.height());
      }
    });
  };
})(jQuery);

$("div")
  .lockDimensions("width")
  .css("color", "red");
```

`$.extend`让默认参数和参数对象合并

```js
(function($) {
  $.fn.tooltip = function(options) {
    // Create some defaults, extending them with any options that were provided
    var settings = $.extend(
      {
        location: "top",
        "background-color": "blue"
      },
      options
    );

    return this.each(function() {
      // Tooltip plugin code here
    });
  };
})(jQuery);

$("div").tooltip({
  location: "left"
});
```

#### 3.vue 和 react 的区别

相同点

```
1.都是组件化开发和虚拟dom
2.都支持使用props进行父子通信
3.都支持数据驱动，不操作真实dom，更新数据后页面自动更新
```

不同点

```
1.react使用的是单向数据流，而vue使用的是双向数据绑定
2.react使用的是jsx方法(all in js的理念)，而vue使用的是模版渲染，通过webpack进行打包
3.react通过setState改变数据会使整个页面重新渲染，需要通过shouldComponent控制局部更新。而vue会跟踪每一个组件的依赖关系，不需要重新渲染整个组件树。。
```

#### 4.react 虚拟 dom

> 参考连接：[虚拟 dom 的实现](https://juejin.im/entry/5aedcfa351882506a36c664c) > [React 虚拟 Dom 和 diff 算法](https://juejin.im/post/5a3200fe51882554bd5111a0)

#### 5.vue 和 react 的生命周期

vue

```
beforeCreate created beforeMount mounted beforeUpdate updated beforeDestroy destroyed
```

- vue 父子组件渲染过程，父组件 => 子组件 => 父组件

```
parent-beforeCreated parent-created parent-beforeMount child-beforeCreated child-created child-beforeMount child-mounted parent-mounted
```

- 在各自组件中的 data 修改中，各自执行 update，互不影响
- 当使用 props 修改父子关联的属性时，父组件 => 子组件 => 父组件

```
parent-beforeUpdate child-beforeUpdate child-updated parent-updated
```

- 当组件进行销毁过程，父组件 => 子组件 => 父组件

```
parent-beforeDestory child-beforeDestory child-destoryed parent-destoryed
```

react

```
componentWillMount render componentDidMount (shouldComponentUpdate componentWillUpdate render componentDidUpdate) componentWillUnmount
```

#### 6.react 中的 setState 什么时候同步触发？什么时候异步触发？

> [react 中 setState 原理](https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/17)

```js
class Example extends React.Component {
  constructor() {
    super();
    this.state = {
      val: 0
    };
  }

  componentDidMount() {
    this.setState({ val: this.state.val + 1 });
    console.log(this.state.val); // 第 1 次 log

    this.setState({ val: this.state.val + 1 });
    console.log(this.state.val); // 第 2 次 log

    setTimeout(() => {
      this.setState({ val: this.state.val + 1 });
      console.log(this.state.val); // 第 3 次 log

      this.setState({ val: this.state.val + 1 });
      console.log(this.state.val); // 第 4 次 log
    }, 0);
  }

  render() {
    return null;
  }
}

// 0 0 2 3
```

### 构建工具

#### 1.webpack 与 grunt、gulp 的不同？

gulp 和 grunt 是比较轻量级的，基于任务和流(task, stream)的。类似 jQuery，找到一个（或一类）文件，对其做一系列链式操作，更新流上的数据， 整条链式操作构成了一个任务，多个任务就构成了整个 web 的构建流程。

webpack 是基于入口的。webpack 会自动地递归解析入口所需要加载的所有资源文件，然后用不同的 Loader 来处理不同的文件，用 Plugin 来扩展 webpack 功能。他和其他的工具最大的不同在于他支持 code-splitting、模块化(AMD，ESM，CommonJs)、全局分析。

总结：

```
gulp和grunt需要开发者将整个前端构建过程拆分成多个`Task`，并合理控制所有`Task`的调用关系
webpack需要开发者找到入口，并需要清楚对于不同的资源应该使用什么Loader做何种解析和加工
```

#### 2.webpack 有哪些常见的 Loader？他们是解决什么问题的？

```
file-loader：把文件输出到一个文件夹中，在代码中通过相对 URL 去引用输出的文件
url-loader：和 file-loader 类似，但是能在文件很小的情况下以 base64 的方式把文件内容注入到代码中去
source-map-loader：加载额外的 Source Map 文件，以方便断点调试
image-loader：加载并且压缩图片文件
babel-loader：把 ES6 转换成 ES5
css-loader：加载 CSS，支持模块化、压缩、文件导入等特性
style-loader：把css-loader打包好的css代码以<style>标签的形式插入到html文件中。
eslint-loader：通过 ESLint 检查 JavaScript 代码
```

#### 3.webpack 有哪些常见的 Plugin？他们是解决什么问题的？

```
define-plugin：定义环境变量
commons-chunk-plugin：提取公共代码
uglifyjs-webpack-plugin：通过UglifyES压缩ES6代码
optimize-css-assets-webpack-plugin：优化css插件
html-webpack-plugin：该插件将为你生成一个 HTML5 文件， 其中包括使用 script 标签的 body 中的所有 webpack 包。
```

#### 4.Loader 和 Plugin 的不同？

不同的作用

```
Loader直译为"加载器"。Webpack将一切文件视为模块，但是webpack原生是只能解析js文件，如果想将其他文件也打包的话，就会用到loader。 所以Loader的作用是让webpack拥有了加载和解析非JavaScript文件的能力。

Plugin直译为"插件"。Plugin可以扩展webpack的功能，让webpack具有更多的灵活性。 在 Webpack 运行的生命周期中会广播出许多事件，Plugin 可以监听这些事件，在合适的时机通过 Webpack 提供的 API 改变输出结果。
```

不同的用法

```
Loader在module.rules中配置，也就是说他作为模块的解析规则而存在。 类型为数组，每一项都是一个Object，里面描述了对于什么类型的文件（test），使用什么加载(loader)和使用的参数（options）

Plugin在plugins中单独配置。 类型为数组，每一项是一个plugin的实例，参数都通过构造函数传入。
```

#### 5.webpack 的编译构建流程

> 参考连接：[webpack 的编译&构建](https://juejin.im/post/5ac2d8a7f265da23a049bd8a)

### 计算机网络基础

#### 1.从输入了一个 url 后，浏览器做了什么？

> 参考连接：
> https://zhuanlan.zhihu.com/p/38240894 > https://segmentfault.com/a/1190000016404843

总体流程

```
1.域名解析（因为tcp连接只能识别ip地址）
2.tcp连接（三次握手）
(2) 如果遇到的是https协议，则会进行TLS握手，对信息进行加密。
3.浏览器发送请求报文（请求报文：请求行，请求头，空行（结束标示），请求数据）
4.服务端响应报文（响应报文：状态行，消息头，响应正文）
5.浏览器解析渲染页面
6.tcp连接断开（四次挥手）
```

三次握手
![三次握手分析图](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/tcp.jpg)

```
目的：它可以保证两端（发送端和接收端）通信主机之间的通信可达。它能够处理在传输过程中丢包、传输顺序乱掉等异常情况；此外它还能有效利用宽带，缓解网络拥堵。

第一次握手：建立连接。客户端发送连接请求报文段，SYN设为1（Syn--表示同步序号），Seq(Sequence Number请求序号)为X；然后，客户端进入SYN_SEND状态，等待服务器的确认；

第二次握手：服务器收到客户端的SYN报文段，需要对这个SYN报文段进行确认并返回；设置确认号码Acknowledgment Number为X+1(Sequence Number+1)；Sequence Number为Y；此时服务器进入SYN_RECV状态；

第三次握手：客户端收到服务器的SYN+ACK报文段。然后将Acknowledgment Number设置为y+1，向服务器发送ACK报文段，这个报文段发送完毕以后，客户端和服务器端都进入ESTABLISHED状态，完成TCP三次握手。
```

渲染步骤

```
1. 解析HTML，构建 DOM 树
2. 解析 CSS ，生成 CSS 规则树
3. 合并 DOM 树和 CSS 规则，生成 render 树
4. 布局 render 树（ Layout / reflow ），负责各元素尺寸、位置的计算
5. 绘制 render 树（ repaint ），绘制页面像素信息
6. 浏览器会将各层的信息发送给 GPU，GPU 会将各层合成（ composite ），显示在屏幕上
```

#### 2.get 和 post 的区别？

1.get 请求能够缓存，post 不能

2.get 请求参数是放在路径后面的，post 放在 request-body 中，相对来说更加安全，传输量更大

3.url 有长度限制，这会影响 get 请求（这是浏览器规定的，不是 RFC 规定的）

#### 3.如何优化提升前端性能？

1.减少 http 请求次数：CSS Sprites, JS、CSS 源码压缩、图片大小控制合适；网页 Gzip，CDN 托管，data 缓存 ，图片服务器。

2.前端模板 JS+数据，减少由于 HTML 标签导致的带宽浪费，前端用变量保存 AJAX 请求结果，每次操作本地变量，不用请求，减少请求次数。

3.用 innerHTML 代替 DOM 操作，减少 DOM 操作次数，优化 javascript 性能。

4.当需要设置的样式很多时设置 className 而不是直接操作 style。

5.少用全局变量、缓存 DOM 节点查找的结果。减少 IO 读取操作。

6.避免使用 CSS Expression（css 表达式)又称 Dynamic properties(动态属性)。

7.图片预加载，将样式表放在顶部，将脚本放在底部 加上时间戳。

8.路由懒加载（webpack3 新方式），大的库（lodash）按需加载

9.减少打包体积，万年不动的包，用`external`提出来。在`index.html`中用 cdn 方式引入。

#### 4.关于浏览器跨域问题

> 参考连接：[我知道的跨域与安全](https://juejin.im/post/5a6320d56fb9a01cb64ee191)

##### 为什么需要跨域

跨域只存在于浏览器端，不存在于安卓/ios/Node.js/python/ java 等其它环境。跨域请求能发出去，服务端能收到请求并正常返回结果，只是结果被浏览器拦截了。之所以会跨域，是因为受到了`同源策略`的限制，同源策略要求源相同才能正常进行通信，即`协议`、`域名`、`端口号`都完全一致。

##### CORS 跨域

只要浏览器检测到响应头带上了 CORS，并且允许的源包括了本网站，那么就不会拦截请求响应

```
Access-Control-Allow-Methods: GET, PUT, POST, OPTIONS, DELETE, PATCH
Access-Control-Allow-Origin: *
```

##### JSONP 跨域

JSONP 是利用了 script 标签能够跨域

```js
function updateList (data) {
  console.log(data);
}

$body.append(‘<script src=“http://otherdomain.com/request?callback=updateList"></script>');
```

代码先定义一个全局函数，然后把这个函数名通过 callback 参数添加到 script 标签的 src，script 的 src 就是需要跨域的请求，然后这个请求返回可执行的 JS 文本：

```js
// script响应返回的js内容为
updateList([
  {
    name: "hello"
  }
]);
```

由于它是一个 js，并且已经定义了 upldateList 函数，所以能正常执行，并且跨域的数据通过传参得到。这就是 JSONP 的原理。

##### postMessage 跨域

> client to client,iframe 访问父页面可通过 window.parent 得到父窗口的 window 对象，通过 open 打开的可以用 window.opener，进而得到父窗口的任何东西；父窗口如果和 iframe 同源的，那么可通过 iframe.contentWindow 得到 iframe 的 window 对象，如果和 iframe 不同源，则存在跨域的问题，这个时候可通过 postMessage 进行通讯。

```js
// main frame
let iframeWin = document.querySelector("#my-iframe").contentWindow;
iframeWin.postMessage({ age: 18 }, "http://parent.com");
iframeWin.onmessage = function(event) {
  console.log("recv from iframe ", event.data);
};

// iframe
window.onmessage = function(event) {
  // test event.origin
  if (event.origin !== expectOrigin) {
    return;
  }
  console.log("recv from main frame ", event.data);
};

window.parent.postMessage("hello, this is from iframe ", "http://child.com");
```

#### 5.Ajax 的原理

> 参考连接：[深入理解 Ajax 原理](https://juejin.im/post/5b1cebece51d4506ae71addf)

Ajax 基本上就是把 JavaScript 技术和 XMLHttpRequest 对象放在 Web 表单和服务器之间。当用户向服务器请求时，数据发送给一些 JavaScript 代码而不是直接发送给服务器。JavaScript 代码在幕后发送异步请求,然后服务器将数据返回 JavaScript 代码，后者决定如何处理这些数据,它可以迅速更新表单数据。这就是 Ajax 的原理所在。

#### 6.CSRF（跨站请求伪造）XSS（跨站脚本攻击）

> 参考连接：[前端安全系列：如何防止 CSRF 攻击](https://juejin.im/post/5bc009996fb9a05d0a055192) > [前端安全系列：如何防止 XSS 攻击](https://tech.meituan.com/2018/09/27/fe-security.html)

CSRF(Cross-site request forgery)攻击防护措施

```
CSRF自动防御策略：同源检测（Origin 和 Referer 验证）。
CSRF主动防御措施：Token验证 或者 双重Cookie验证 以及配合Samesite Cookie。
保证页面的幂等性，后端接口不要在GET页面中做用户操作。
```

XSS(Cross-Site Scripting)攻击预防措施

```
禁止加载外域代码，防止复杂的攻击逻辑。
禁止外域提交，网站被攻击后，用户的数据不会泄露到外域。
禁止内联脚本执行（规则较严格，目前发现 GitHub 使用）。
禁止未授权的脚本执行（新特性，Google Map 移动版在使用）。
合理使用上报可以及时发现 XSS，利于尽快修复问题。
```

#### 7.关于浏览器的缓存

> 参考连接:[前端必须要懂的浏览器缓存机制](https://juejin.im/entry/59c8d4675188256bb018ff89)

```
浏览器端缓存分为200 from cache和304 not modified
HTTP协议中Cache-Control 和 Expires可以用来设置新鲜度的限值，前者是HTTP1.1中新增的响应头，后者是HTTP1.0中的响应头。
max-age（单位为s）而Expires指定的是具体的过期日期而不是秒数
Cache-Control和Expires同时使用的话，Cache-Control会覆盖Expires
客户端不用关心ETag值如何产生，只要服务在资源状态发生变更的情况下将ETag值发送给它就行
Apache默认通过FileEtag中FileEtag INode Mtime Size的配置自动生成ETag(当然也可以通过用户自定义的方式)。
ETag常与If-None-Match或者If-Match一起，由客户端通过HTTP头信息(包括ETag值)发送给服务端处理。
Last-Modified常与If-Modified-Since一起由客户端将Last-Modified值包括在HTTP头信息中发给服务端进行处理。
有些文档资源周期性的被重写，但实际内容没有改变。此时文件元数据中会显示文件最近的修改日期与If-Modified-Since不相同，导致不必要的响应。
```

#### 8.垃圾回收机制

参考连接：[内存管理](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Memory_Management)

#### 9.简单说下 http2 的多路复用

http1:

- 1.http1 采用的是文本格式进行传输
- 2.多次请求会建立多个 tcp 连接，浏览器为了控制资源都会有 6-8 个连接限制。

http2:

- 1.采用的是二进制格式传输；
- 2.在同一个域名下所有请求通信都在一个 tcp 连接上进行，单个连接可以并行交错的
  请求和响应(因为 http2 有两个非常重要的概念，分别是帧和流，帧代表着最小的数据单位，每个帧会标识出该帧属于哪个流，流也就是多个帧组成的数据流。
  多路复用，就是在一个 TCP 连接中可以存在多条流。换句话说，也就是可以发送多个请求，对端可以通过帧中的标识知道属于哪个请求。通过这个技术，可以避免 HTTP 旧版本中的队头阻塞问题，极大的提高传输性能。)
