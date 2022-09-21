# HTML && CSS 编码规范

## 一、命名规范

### 1. class 命名中间用短横线隔离，id 应为驼峰式。

```
<!--正确方式-->
.danger-message {
    color: red;
}
#dangerMessage {
    color: red;
}
```

```
<!--错误方式-->
.danger_message {
    color: red;
}
#danger-message {
    color: red;
}
```

### 2. scss:变量、函数、混合、placeholder 采用驼峰式命名

```
@mixin centerBlock {}
@function pxToRem($px) {}
$colorBlack: #000;
```

### 3. 禁止出现拼音，命名必须语意化且具有描述性。

```
<!--正确方式-->
.img-pda, img-app {
	color: rgba(255, 255, 255, .5);
}
```

```
<!--错误方式-->
.img1, img2 {
	color: rgba(255,255,255,.5);
}
.img-one, img-two {
	color: rgba(255,255,255,.5);
}
```

### 4. 常用命名

    	头：header
    	内容：content/container
    	尾：footer
    	导航：nav
    	侧栏：sidebar
    	栏目：column
    	页面外围控制整体佈局宽度：wrapper
    	左右中：left right center
    	登录条：loginbar
    	标志：logo
    	广告：banner
    	页面主体：main
    	热点：hot
    	新闻：news
    	下载：download
    	子导航：subnav
    	菜单：menu
    	子菜单：submenu
    	搜索：search
    	友情链接：friendlink
    	页脚：footer
    	版权：copyright
    	滚动：scroll
    	内容：content
    	标签：tags
    	文章列表：list
    	提示信息：msg
    	小技巧：tips
    	栏目标题：title
    	加入：joinus
    	指南：guide
    	服务：service
    	注册：regsiter
    	状态：status
    	投票：vote
    	合作伙伴：partner

## 二、书写规范

### 1. 禁止无意义的标签嵌套，禁止行标签和块标签同层。

```
<!--正确方式-->
<el-row>
	<el-col :span="8"></el-col>
</el-row>

<el-row>
	...
</el-row>
```

```
<!--错误方式-->
<el-row></el-row>

<el-col :span="24">
	<el-row></el-row>
</el-col>
```

### 2. 选择器与{之间必须包含空格

```
.selector {}
```

### 3. 列表属性书写：后必须包含空格

```
.selector {
  margin: 0;
}
```

### 4. 列表性属性书在单行时，,后必须跟一个空格

```
font-family: Aria, sans-serif;
```

### 5. 当一个 rule 包含多个 selector 时，每个选择器声明必须独占一行。

```
.post,
.page,
.comment {
  line-height: 1.5;
}
```

### 6. 缩进为两个空格

### 7. +、>、~ 选择器的两边各保留一个空格

```
main > nav {
  padding: 10px;
}
```

### 8. 如果行内样式超过两个，必须新建 class，在 style 中编写样式

```
<!--正确方式-->
p {
	color: rgba(255, 255, 255, .5);
	font-size: 12px;
}
```

```
<!--错误方式-->
<p style="color: rgba(255, 255, 255, .5);font-size: 12px;"></p>
```

### 9. 长度为 0 时须省略单位

```
body {
  padding: 0 5px;
}
```

### 10. 当数值为 0 - 1 之间的小数时，省略整数部分的 0

```
panel {
  opacity: .8;
}
```

### 11. 每个规则集之间保留一个空行

```
.selector1 {
  display: block;
  width: 100px;
}

.selector2 {
  padding: 10px;
  margin: 10px auto;
}
```

### 12. 禁止页面中出现重复 id

### 13. 规则中若有 , 隔开的，需在 , 后保留一个空格

```
<!--正确方式-->
.selector1 {
	color: rgba(255, 255, 255, .5);
}
```

```
<!--错误方式-->
.selector2 {
	color: rgba(255,255,255,.5);
}
```

### 14. 使用@import、@include、@extend 须放在样式之前, 且与样式之间保留一个空行（sass）

```
<!--正确方式-->
.seriousError {
  @extend .error;

  border-width: 3px;
}
```

```
<!--错误方式-->
.seriousError {
  border-width: 3px;
  @extend .error;
}
```

### 15. sass 选择器嵌套，父选择器规则 与 子选择器规则集 保留一个空行

```
<!--正确方式-->
.parent {
	@include clearfix()

	position: relative;
	left: 10px;
	font-size: 16px;

	&:hover {
		font-size: yellow;
	}

	.child {
		color: red;
	}
}
```

```
<!--错误方式-->
.parent {
	@include clearfix()

	position: relative;
	left: 10px;
	font-size: 16px;
	&:hover {
		font-size: yellow;
	}
	.child {
		color: red;
	}
}
```

### 16. 每个属性声明末尾都要加分号。

```
<!--正确方式-->
.element {
	width: 20px;
}
```

```
<!--错误方式-->
.element {
	width: 20px
}
```

### 17.禁止在行内写过多样式（大于等于两个样式请将其抽离为 class，在 css 中书写）

## 三、CSS 缩写属性

### 1.字体

```
顺序: font-style | font-variant | font-weight | font-size | line-height | font-family

栗子: font:normal small-caps bold 14px/1.5em '宋体',arial,verdana;
```

### 2.背景

```
顺序：background-color | background-image | background-repeat | background-attachment | background-position

栗子：background:#F00 url(header_bg.gif) no-repeat fixed left top;
```

### 3.外边距&内边距

```
顺序： margin-top | margin-right | margin-bottom | margin-left

栗子： margin: 4px 0 1.5em -12px;（注意1，2，3，4个值分别代表什么）
```

### 4.边框

```
顺序：border-width | border-style | border-color

栗子：border: 1px solid #CCC;
```

### 5.列表样式

```
顺序： list-style-type | list-style-position | list-style-image

栗子： list-style: square outside url(bullet.gif);
```

## 四、使用 sass 建议

### 1.sass 结构，嵌套要有意义，不超过 3 级

### 2.有效的使用变量，使用是否有意义

### 3.需要通过传参数来实现快速创建的情况才使用 mixins

### 4.拥抱 placeholder(@extend),%placeholder 可以多次使用，并且不会产生多余的代码

### 5.使用 function 计算，sass 的函数不会输出任何 css 代码
