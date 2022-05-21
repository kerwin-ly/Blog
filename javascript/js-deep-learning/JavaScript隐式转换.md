# JavaScript 隐式转换

JavaScript 在参与运算`+`、`-`、`*`、`/`、`==`、`>`、`<`时，当两侧类型不一致时，会进行`隐式转换`。

## 等于运算符（==）

在 JavaScript 中判断两个值是否相等，可以用`等于运算符（==）`和`严格相等运算符（===）`。

`等于运算符（==）`检查其两个元素是否相等，并返回 Boolean 结果。与`严格相等运算符（===）`不同，它会尝试强制类型转换并且比较不同类型的操作数。

严格相等运算符比较时，**当两个操作数类型不同，则认为不相等。不会对类型进行转换。**

也就是说，当类型不同的时候，`==`会进行`隐式转换`。比如：

```js
"1" == 1; // true
0 == false; // true
null == undefined; // true
```

下面我们来看几种操作数比较：

- 对象和对象：会比较两个对象的**引用**是否相同

```js
{} == {}; // false，两个空对象的引用不同
var a = b = {};
a == b; // true，指向同一个空对象
```

- null 和 undefined：**返回 true**，都表示空

```js
null == undefined; // true
```

- 数字和字符串：先将字符串转换为数字，再比较

```js
0 == ""; // true，先将''转换为数值0，然后比较0 == 0
```

- 布尔和其他值：**先将 Boolean 转换为 Number 类型**，再比较（true 转换为 1，false 转换为 0）

```js
true == "2"; // false，先将true转换为数值类型为1，然后比较 1 == '2'，再将'2'转换为数字，最终 1 == 2。
```

- 对象和数值/字符串：调用对象的`valueOf()`和`toString()`方法将对象转换为基本类型，再进行比较。

```js
"1,2,3" == [1, 2, 3]; // true，先调用valueOf，将数组对象转换为基本类型，得到结果'1,2,3'。'1,2,3' == '1,2,3'
```

这里补充介绍下`valueOf`和`toString()`：

`valueOf`和`toString()`方法都是在操作符中一边是对象时，自动触发的。

在 toPrimitive 规则中，优先调用`valueOf()`方法（如果有），看其返回结果是否是基本类型。如果是，则返回。否则，再调用`toString()`方法，转换为字符串类型后返回。

接着，我们来看下不同操作数调用`valueOf()`和`toString()`的区别：

```js
// valueOf 方法
let a = {};
let b = [1, 2, 3];
let c = "123";
let d = function () {
  console.log("fn");
};

console.log(a.valueOf()); // {}
console.log(b.valueOf()); // [ 1, 2, 3 ]
console.log(c.valueOf()); // '123'
console.log(d.valueOf()); // '[Function: d]'

// toString方法
let a = {};
let b = [1, 2, 3];
let c = "123";
let d = function () {
  console.log("fn");
};

console.log(a.toString()); // '[object Object]'
console.log(b.toString()); // '1,2,3'
console.log(c.toString()); // '123'
console.log(d.toString()); // 'function(){ console.log('fn') }'
```

上述代码中，我们可以看到。`valueOf()`在转换数组/对象时，返回的仍是原有对象。

而`toString()`在转换数组时，会将其转换为字符串，类似`join(',')`方法。在转换对象属性时，会将其转换为`[object Object]`字符串。

最后我们再来看一道综合的面试题：

```js
[] == ![];
```

首先，由于前面有个`取反操作符 !`，所以先将`[]`转换为 Boolean 值，即：Boolean([])，结果为`true`。（使用 Boolean 转换一个对象，只有 null 和 undefined 是 false,其余为 true）。然后再取反，`!true`结果为`false`。

所以，我们接着比较等号两侧：`[] == false`

当操作符一侧是对象时，我们先将对象转换为基本类型。这里是一个数组，通过`valueOf()`方法返回的仍然是一个数组，接着调用`toString()`方法，`[].toString()`返回一个空字符串。所以这里得到操作符两侧的结果为：`'' == false`

当 Boolean 和其他值比较时，Boolean 值先被转换为 Number，所以操作符更新为：`'' == 0`

最后，当字符串和数值比较时，字符串会被转换为数值类型。`Number('')`的结果为 0，所以最终操作符两侧为`0 == 0`，答案为 true。

## 计算运算符（+-\*/）

字符串 + 任意值，会被处理为字符串的拼接

```js
"1" + [2, 3]; // 输出"12, 3"。先将数组[2,3]转换为字符串"2,3"。再执行"1" + "2,3"
{
}
+[]; // 输出"[object Object]"。先将对象{}转换为字符串"[Object object]"，空数组[]转换为字符串""，然后执行"[Object object]" + ""
```

非字符串（基本类型） + 非字符串（基本类型），两边都会先 ToNumber

```js
true + 1; // 2。Number(true)的结果为1，执行1+1
1 + null + false + 1; // 2
1 + undefined; // NaN
1 + undefined + false; // NaN
```

任意值 - 任意值，一律执行 ToNumber，进行数字运算。

```js
true - ""; // 1
{
}
-[]; // 对象参与运算，先将对象转换为基本类型-字符串。{}.toString()结果为"[Object object]"。数组同理，此时执行"[object Object]" - ""，再将两个字符串转换为数值计算。得到 NaN - 0
```

- x 和 一元运算 +x 是等效的（以及- x)，都会强制 ToNumber

```JS
+"1" === 1; // true
```

## 比较运算符

对比不像相等，可以严格相等（===）防止类型转换，对比一定会存在隐式类型转换。

对象总是先执行 ToPrimitive 为基本类型

```js
[] < [] // false
[] <= {} // true

{} < {} // false
{} <= {} // true
```

任何一边出现非字符串的值，则一律转换成数字做对比

```js
// ["06"] => "06" => 6
["06"] <
  (2)["06"] < // false
  "2"["06"] > // true
  2; // true
```
