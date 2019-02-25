## interview

>参考链接
[2018年最新经典web前端面试题](https://juejin.im/post/5baa0797f265da0aaa0517e6)

### CSS && DOM

#### 1.css的盒模型
标准模型：一个块的总宽度=width+margin(左右)+padding(左右)+border(左右)

怪异模式：width+margin（左右）（既width已经包含了padding和border值）

#### 2.定位问题
static: 默认的定位
absolute: 绝对定位，根据上一个不是static定位的元素进行定位，脱离文档流。
relative: 相对定位，根据自身进行定位，设置了定位后，该位置仍然占位，不脱离文档流。
fixed: 根据浏览器进行定位

#### 3.css3动画属性

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

### JavaScript基础

#### 1.javascript有哪些基本数据类型
[基本类型 && 引用类型详解](https://github.com/kerwin-ly/Blog/blob/master/javascript/%E5%9F%BA%E6%9C%AC%E7%B1%BB%E5%9E%8B%E5%92%8C%E5%BC%95%E7%94%A8%E7%B1%BB%E5%9E%8B%E7%9A%84%E5%8C%BA%E5%88%AB.md)

#### 2.原型和原型链
[类和类的继承](https://github.com/kerwin-ly/Blog/blob/master/javascript/%E7%B1%BB%E5%92%8C%E7%B1%BB%E7%9A%84%E7%BB%A7%E6%89%BF.md)

#### 3.apply和call有什么区别
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

### 前端框架 && 工具

### 计算机网络基础

#### 1.从输入了一个url后，浏览器做了什么？
>参考连接：
https://zhuanlan.zhihu.com/p/38240894
https://segmentfault.com/a/1190000016404843

总体流程
```
1.域名解析（因为tcp连接只能识别ip地址）
2.tcp连接（三次握手）
3.浏览器发送请求报文（请求报文：请求行，请求头，空行（结束标示），请求数据）
4.服务端响应报文（响应报文：状态行，消息头，响应正文）
5.浏览器解析渲染页面
6.tcp连接断开（四次挥手）
```

三次握手
![三次握手分析图](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/tcp.jpg)
```
目的：它可以保证两端（发送端和接收端）通信主机之间的通信可达。它能够处理在传输过程中丢包、传输顺序乱掉等异常情况；此外它还能有效利用宽带，缓解网络拥堵。

第一次握手：建立连接。客户端发送连接请求报文段，将SYN位置为1，Sequence Number为x；然后，客户端进入SYN_SEND状态，等待服务器的确认；

第二次握手：服务器收到SYN报文段。服务器收到客户端的SYN报文段，需要对这个SYN报文段进行确认，设置Acknowledgment Number为x+1(Sequence Number+1)；同时，自己自己还要发送SYN请求信息，将SYN位置为1，Sequence Number为y；服务器端将上述所有信息放到一个报文段（即SYN+ACK报文段）中，一并发送给客户端，此时服务器进入SYN_RECV状态；

第三次握手：客户端收到服务器的SYN+ACK报文段。然后将Acknowledgment Number设置为y+1，向服务器发送ACK报文段，这个报文段发送完毕以后，客户端和服务器端都进入ESTABLISHED状态，完成TCP三次握手。
```

渲染步骤
```
1. 解析HTML，构建 DOM 树

2. 解析 CSS ，生成 CSS 规则树

3. 合并 DOM 树和 CSS 规则，生成 render 树

4. 布局 render 树（ Layout / reflow ），负责各元素尺寸、位置的计算

5. 绘制 render 树（ paint ），绘制页面像素信息

6. 浏览器会将各层的信息发送给 GPU，GPU 会将各层合成（ composite ），显示在屏幕上
```
