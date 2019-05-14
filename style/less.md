# Less
## 安装配置

## 笔记
### 1.变量
#### 1.1 变量声明使用
```
@primary: blue; // 颜色变量
@selector: banner // 选择器
@img: '../img' // url变量
@property: color // 属性变量
@bg: { background-color: red } // 变量声明
.@{selector} {
  width: 100px;
  height: 100px;
  background: url('@{img}/aa.png');
  @property: @primary;
  @bg();
}
```

编译结果
```
.banner {
  width:100px;
  height:100px;
  color: blue;
  background: url('../img/aa.png');
  color: blue;
  background-color: red;
}
```

#### 1.2 变量运算
```
@width: 300px;
@color: #222;

#wrap {
  width: @width - 20;
  color: @color * 2;
  background-color:@color + #111;
}
```

### 2.混合（mixin）
可以继承某个class中的所有样式属性

#### 2.1 无参数
```
.color() {
  color: #fff;
  background-color: #333;
}

.widget {
  .color();
  width: 100px;
  height: 100px;
}
```

#### 2.2 有参数
```
.color (@color: #eee) {
  color: @color;
  background-color: #333;
}

.widget {
  width: 100px;
  height: 100px;
  .color(0) // 不传参就用默认的参数
  .color(#e6e) // 传参使用
}
```

#### 2.3 默认参数
`@arguments`指代的是全部参数
```
.border(@a: 10px, @b: 50px, @c: 30px, @color: #000) {
  box-shadow: @arguments;
}
```

#### 2.4 方法的命名空间
```
#card(){
  background: #723232;
  .d(@w:300px){
      width: @w;
      
      #a(@h:300px){
          height: @h;//可以使用上一层传进来的方法
      }
  }
}
#wrap{
  #card > .d > #a(100px); // 父元素不能加 括号
}
#main{
  #card .d();
}
#con{
  //不得单独使用命名空间的方法
  //.d() 如果前面没有引入命名空间 #card ，将会报错
  
  #card; // 等价于 #card();
  .d(20px); //必须先引入 #card
}


/* 生成的 CSS */
#wrap{
  height:100px;
}
#main{
  width:300px;
}
#con{
  width:20px;
}
```

#### 2.5 方法筛选
`when`条件处理
```
#card {
  .border(@width, @color, @style) when (@width > 100px) and (@color = #999) {
    // 满足条件，下面的css生效
    border: @style @color @width;
  }
}

// not 运算符，相当于 非运算 !，条件为 不符合才会执行
.background(@color) when not (@color>=#222){
  background:@color;
}

// , 逗号分隔符：相当于 或运算 ||，只要有一个符合条件就会执行
.font(@size:20px) when (@size>50px) , (@size<100px){
  font-size: @size;
}
```

#### 2.6 数量不定的参数
类似es6中的扩展符，接受不指定数量的参数
```
.boxShadow(...) {
  box-shadow: @arguments;
}
.texShadow(@a, ...) {
  text-shadow: @arguments;
}

#main {
  .boxShadow(1px 4px, 30px, red);
}
```

#### 2.7 方法中使用!important
```
/* Less */
.border{
  border: solid 1px red; 
  margin: 50px;
}
#main{
  .border() !important;
}
/* 生成后的 CSS */
#main {
  border: solid 1px red !important;
  margin: 50px !important;
}
```

### 3. 嵌套
#### 3.1 &的使用，可以用来定义自己的私有属性
&代表的上一层选择器的名字，这个例子中就是header
```
#header {
  &:afer {
    content: 'less'
  }
  .title {
    color: red;
  }
  &_content { // 编译成header_content
    margin: 20px;
  }
}
```

### 4. 继承
extends是`Less`的一个伪类，它可以继承所匹配声明中的全部样式
```
.animation {
  transition: all .3s ease-out;

  .hide{
    transform:scale(0);
  }
}

#main {
  &:entend(.animation);
}
#con {
  &:extend(.animation .hide);
}

/*生成的css*/
.animation,#main {
  transition: all .3s ease-out;
}
.animation .hide , #con {
  transform:scale(0);
}
```

### 5. 导入
#### 5.1 导入less文件
```
import 'main' // 等价于 import 'main.less'
```

#### 5.2 在css中导入less
```
@import 'style'
```

#### 5.3 reference
使用@import (reference)导入外部文件，但**不会添加 把导入的文件 编译到最终输出中，只引用**。
```
@import (reference) "bootstrap.less";

#wrap:extend(.navbar all) {}
```

### 6.其它啊
#### 6.1 注释
* /* */ CSS原生注释，会被编译在 CSS 文件中。
* /   / Less提供的一种注释，不会被编译在 CSS 文件中。

#### 6.2 避免编译
`~`字符
```
#main {
  width: ~'calc(300px - 30px)';
}

/* 生成后的css */
#main {
  width: calc(300px - 30px);
}
```

#### 6.3变量拼接字符串
`~字符串@{变量}字符`
```
.judge(@i) when(@i=1){
  @size:15px;
}
.judge(@i) when(@i>1){
  @size:16px;
}
.loopAnimation(@i) when (@i<16) {
  
  .circle:nth-child(@{i}){
      .judeg(@i);
      border-radius:@size @size 0 0;
      animation: ~"circle-@{i}" @duration infinite @ease;
      transition-delay:~"@{i}ms";
  }
  @keyframes ~"circle-@{i}" {
      // do something...
  }
  .loopAnimation(@i + 1);
}
```

### 6.4使用js
```
/* Less */
@content:`"aaa".toUpperCase()`;
#randomColor{
  @randomColor: ~"rgb(`Math.round(Math.random() * 256)`,`Math.round(Math.random() * 256)`,`Math.round(Math.random() * 256)`)";
}
#wrap{
  width: ~"`Math.round(Math.random() * 100)`px";
  &:after{
      content:@content;
  }
  height: ~"`window.innerHeight`px";
  alert:~"`alert(1)`";
  #randomColor();
  background-color: @randomColor;
}
/* 生成后的 CSS */

// 弹出 1
#wrap{
  width: 随机值（0~100）px;
  height: 743px;//由电脑而异
  background: 随机颜色;
}
#wrap::after{
  content:"AAA";
}
```