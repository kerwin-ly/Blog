## interview

>参考链接
[2018年最新经典web前端面试题](https://juejin.im/post/5baa0797f265da0aaa0517e6)
[前端面试总结](https://github.com/InterviewMap/CS-Interview-Knowledge-Map)

### HTML && CSS

#### 1.css的盒模型
标准模型：一个块的总宽度=width+margin(左右)+padding(左右)+border(左右)

怪异模式：width+margin（左右）（既width已经包含了padding和border值）

#### 2.定位问题
static: 默认的定位

absolute: 绝对定位，根据上一个不是static定位的元素进行定位，脱离文档流。

relative: 相对定位，根据自身进行定位，设置了定位后，该位置仍然占位，不脱离文档流。

fixed: 根据浏览器进行定位

#### 3.css3动画属性
>如果让用js去实现一个动画，不考虑兼容性的话尽量使用`requestAnimationFrame`
`requestAnimationFrame`接受一个动画执行函数作为参数，这个函数的作用是仅执行一帧动画的渲染，并根据条件判断是否结束，如果动画没有结束，则继续调用`requestAnimationFrame`并将自身作为参数传入
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
let box = document.getElementById('box');
let num = 10;
function step() {
  num += 10;
  box.style.left = num + 'px';
  if (num <= 1000) {
    window.requestAnimationFrame(step);
  }
}
window.requestAnimationFrame(step);
```

#### 4.CSS3中新增伪类举例
:nth-child, :first-of-type, :last-of-type, :enabled, :disabeld, :empty, :not

#### 5.link和@import引用样式的区别
1. 一个是标签（不存在兼容性问题），一个是在css中的引用（存在兼容性问题）
2. 加载顺序区别。`link`是在页面被加载时候同时加载。而`import`则是在页面全部被下载完后再开始加载
3. 使用`js`控制dom样式时候，只能使用`link`标签。`@import`的样式无法修改。

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
  list.addEventListener('click', function(e) {
    console.log(e.target); // 对应点击的li标签
  })
```

#### 7.html5新增了哪些新特性？移除了哪些？
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

#### 8.CSS选择符有哪些？哪些属性可以继承？
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

### JavaScript基础

#### 1.javascript有哪些基本数据类型
[基本类型 && 引用类型详解](https://github.com/kerwin-ly/Blog/blob/master/javascript/%E5%9F%BA%E6%9C%AC%E7%B1%BB%E5%9E%8B%E5%92%8C%E5%BC%95%E7%94%A8%E7%B1%BB%E5%9E%8B%E7%9A%84%E5%8C%BA%E5%88%AB.md)

#### 2.原型和原型链
[类和类的继承](https://github.com/kerwin-ly/Blog/blob/master/javascript/%E7%B1%BB%E5%92%8C%E7%B1%BB%E7%9A%84%E7%BB%A7%E6%89%BF.md)

#### 3.apply和call有什么区别
>参考连接
[javascript深入之call和apply](https://github.com/mqyqingfeng/Blog/issues/11)

`apply`和`call`区别不大，都可以改变`this`指针的指向。只是后面参数。`apply`可以接数组，`call`则要一个一个挨着写。
```js
var Person1  = function (name) {
  this.name = name;
}
var Person2 = function () {
  this.getname = function () {
    console.log(this.name); // 这里没有this.name
  }
  Person1.call(this, 'kerwin'); // 通过改变指针，获取this.name
}
var person = new Person2();
person.getname(); // linxin
```
call的实现原理
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

// 相当于bar的this指针指向了foo（foo.fn = this;）
bar.call2(foo); // 1
```

#### 4.什么是bind
>[JavaScript深入之bind的模拟实现](https://github.com/mqyqingfeng/Blog/issues/12)
bind() 方法会创建一个新函数。当这个新函数被调用时，bind() 的第一个参数将作为它运行时的 this，之后的一序列参数将会在传递的实参前传入作为它的参数。(来自于 MDN )
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
>JavaScript 采用`词法作用域`，函数的作用域在函数定义的时候就决定了，函数的作用域基于函数创建的位置。而与词法作用域相对的是`动态作用域`，函数的作用域是在函数调用的时候才决定的。（ps:作用域主要有全局作用域，函数作用域，块级作用域）

>当查找变量的时候，会先从当前上下文的变量对象中查找，如果没有找到，就会从父级(词法层面上的父级)执行上下文的变量对象中查找，一直找到全局上下文的变量对象，也就是全局对象。这样由多个执行上下文的变量对象构成的链表就叫做`作用域链`。(ps:执行上下文，变量对象等概念在`6.js的执行过程`中)

#### 6.js的执行过程
>参考连接：
[js引擎的执行过程一](https://heyingye.github.io/2018/03/19/js%E5%BC%95%E6%93%8E%E7%9A%84%E6%89%A7%E8%A1%8C%E8%BF%87%E7%A8%8B%EF%BC%88%E4%B8%80%EF%BC%89/)
[js引擎的执行过程二](https://heyingye.github.io/2018/03/26/js%E5%BC%95%E6%93%8E%E7%9A%84%E6%89%A7%E8%A1%8C%E8%BF%87%E7%A8%8B%EF%BC%88%E4%BA%8C%EF%BC%89/)
[javascript深入之变量对象](https://github.com/mqyqingfeng/Blog/issues/5)

>js的运行环境主要有三种
`全局环境`（js代码加载完毕后，进入代码预编译即进入全局环境）
`函数环境`（函数调用执行时，进入该函数环境，不同的函数则函数环境不同）
`eval`（有安全，性能问题）
每进入一个不同的运行环境都会创建一个相应的`执行上下文（Execution Context）`，那么在一段JS程序中一般都会创建多个执行上下文，js引擎会以栈的方式对这些执行上下文进行处理，形成`函数调用栈（call stack）`，栈底永远是全局执行上下文（Global Execution Context），栈顶则永远是当前执行上下文。

##### 1.语法分析
分析该js脚本代码块的语法是否正确，如果出现不正确，则向外抛出一个语法错误（SyntaxError），停止该js代码块的执行，然后继续查找并加载下一个代码块；如果语法正确，则进入预编译阶段

##### 2.预编译阶段
通过语法分析阶段后，进入预编译阶段，遇到js的运行环境则开始创建执行上下文。

创建执行上下文做了什么？
```
1.创建变量对象（Variable Object）（创建arguments对象（函数运行环境下），函数声明提前解析，变量声明提升）
2.建立作用域链（Scope Chain）
3.确定this指向
```

什么是变量对象和活动对象？
>`变量对象(VO)`是执行上下文相关的数据作用域，存储了在上下文中定义的变量和函数声明。在执行阶段之前，`变量对象(VO)`中的属性是不能被访问的。在执行阶段之后，`变量对象(VO)`变成活`活动对象（AO）`，里面的属性都能被访问了，然后开始进行执行阶段的操作。它们其实是同一个对象，只是处于执行上下文中的不同生命周期。

##### 3.执行阶段
>js是单线程的，但是参与js执行的线程主要有4个。`JS引擎线程` `事件触发线程` `定时器触发线程` `HTTP异步请求线程`.
经典例子：
```js
// 这里主要涉及到了宏任务（同步任务，异步任务），微任务，事件循环（Event Loop）
console.log('script start');

setTimeout(function() {
  console.log('setTimeout');
}, 0);

Promise.resolve().then(function() {
  console.log('promise1');
}).then(function() {
  console.log('promise2');
});

console.log('script end');
```
打印的值依次为：`script start`,`script end`,`promise1`,`promise2`,`setTimeout`

如果忘了什么原因就去看[js引擎的执行过程二](https://heyingye.github.io/2018/03/26/js%E5%BC%95%E6%93%8E%E7%9A%84%E6%89%A7%E8%A1%8C%E8%BF%87%E7%A8%8B%EF%BC%88%E4%BA%8C%EF%BC%89/)

#### 7.将'get-element-by-id'转换为'getElementById'（字符串和数组的基本操作）
```js
function convertLowerToCamel(str, token) {
  var camelList = [];
  var lowerList = str.split(token); // ['get', 'element', 'by', 'id']
  var camelStr = '';

  arr.map((item, index) => {
    var tempStr = '';
    var upperWord = '';

    if (index > 0) {
      upperWord = item.charAt(0).toUpperCase();
      tempStr = upperWord + item.substring(1);
    } else {
      tempStr = item;
    }
    camelList.push(tempStr);
  })

  camelStr = camelList.join("");
  return camelStr;
}

convertToCamelStr('get-element-by-id', '-');
```

#### 8.冒泡排序(从小到大排序)
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

#### 9.commonJS和es6模块化的区别
1.commonJS支持动态导入，如`require(${path}/xx.js)`;后者不支持

2.commonJS是同步导入，因为服务端文件都在本地，导入不会造成太明显的线程阻塞。而import是异步导入，大多用于浏览器端，需要对文件进行下载，所以同步导入影响很大。

3.commonJSd导入的值是对值的拷贝，如果发生改变，不会影响原始值。而import导出的值是绑定的，它们指向了同一个内存地址，导出值改变会影响原始值。

#### 10.综合面试题
>[该题分析解答](https://www.cnblogs.com/xxcanghai/p/5189353.html)
```js
function Foo() {
  getName = function() {
    alert(1);
  }
  return this;
}
Foo.getName = function() {
  alert(2);
}
Foo.prototype.getName = function() {
  alert(3);
}
var getName = function() {
  alert(4);
}
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
>为解决页面多次调用方法，造成页面卡顿内存泄漏等问题（如：计时器，滑动页面卡顿），提出了节流函数和防抖函数。

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
  }
}

function getNum() {
  console.log(Date.now())
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
  }
}

function getNum() {
  console.log(Date.now())
}

document.onmousemove = debounce(getNum, 3000);
```

#### 12.for in和for of的区别
`for of`主要是遍历数据/数组对象/字符串等拥有**迭代器**的集合

`for in`主要是遍历对象，它会遍历所有的可枚举属性，包括原型

#### 13. Generator函数
>Generator 函数是一个普通函数（状态机），但是有两个特征。一是，function关键字与函数名之间有一个星号；二是，函数体内部使用yield表达式，定义不同的内部状态（yield在英语里的意思就是“产出”）。

>Generator方法执行后，并不会返回函数的运行结果。而是一个指向内部状态的指针对象，通过`next`方法，使得指针指向下一个状态。每次调用next方法，内部指针就从函数头部或上一次停下来的地方开始执行，直到遇到下一个yield表达式（或return语句）为止。

>yield表达式是暂停执行的标记，而next方法可以恢复执行

```js
function* hello() {
  console.log(1);
  yield 'hello';
  console.log(2);
  yield 'word';
}

var h = hello();
h.next();
h.next();
```

#### 14.什么是this
[加深对this的理解](http://huang-jerryc.com/2017/07/15/understand-this-of-javascript/)


### 前端框架 && 工具

#### 1.vue的mvvm的实现原理
[剖析Vue实现原理 - 如何实现双向绑定mvvm](https://github.com/DMQ/mvvm)

#### 2.jQuery如何自定义插件
jquery插件实现基本原理，对原型进行继承
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
(function( $ ){

  $.fn.maxHeight = function() {
  
    var max = 0;

    this.each(function() {
      max = Math.max( max, $(this).height() );
    });

    return max;
  };
})( jQuery );

var tallest = $('div').maxHeight(); // 返回最高 div 的高度
```

保证jquery的链式调用，返回this(jQuery实例)
```js
(function( $ ){

  $.fn.lockDimensions = function( type ) {  

    return this.each(function() {

      var $this = $(this);

      if ( !type || type == 'width' ) {
        $this.width( $this.width() );
      }

      if ( !type || type == 'height' ) {
        $this.height( $this.height() );
      }

    });

  };
})( jQuery );

$('div').lockDimensions('width').css('color', 'red');
```

`$.extend`让默认参数和参数对象合并
```js
(function( $ ){

  $.fn.tooltip = function( options ) {  

    // Create some defaults, extending them with any options that were provided
    var settings = $.extend( {
      'location'         : 'top',
      'background-color' : 'blue'
    }, options);

    return this.each(function() {        

      // Tooltip plugin code here

    });

  };
})( jQuery );

$('div').tooltip({
  'location' : 'left'
});  

```

### 计算机网络基础

#### 1.从输入了一个url后，浏览器做了什么？
>参考连接：
https://zhuanlan.zhihu.com/p/38240894
https://segmentfault.com/a/1190000016404843

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

#### 2.get和post的区别？
1.get请求能够缓存，post不能

2.get请求参数是放在路径后面的，post放在request-body中，相对来说更加安全，传输量更大

3.url有长度限制，这会影响get请求（这是浏览器规定的，不是RFC规定的）

#### 3.如何优化提升前端性能？
1.减少http请求次数：CSS Sprites, JS、CSS源码压缩、图片大小控制合适；网页Gzip，CDN托管，data缓存 ，图片服务器。

2.前端模板 JS+数据，减少由于HTML标签导致的带宽浪费，前端用变量保存AJAX请求结果，每次操作本地变量，不用请求，减少请求次数

3.用innerHTML代替DOM操作，减少DOM操作次数，优化javascript性能。

4.当需要设置的样式很多时设置className而不是直接操作style。

5.少用全局变量、缓存DOM节点查找的结果。减少IO读取操作。

6.避免使用CSS Expression（css表达式)又称Dynamic properties(动态属性)。

7.图片预加载，将样式表放在顶部，将脚本放在底部  加上时间戳。
