# JavaScript 中的开发技巧

## 最佳实践

### 1.判断条件时，尽量不要用否定形式。用关键字来表明 boolean

```js
// not good
if (!isEmail) { ... }

// good
if (isEmail) { ... }
```

### 2.多个条件判定时，使用includes
```js
// not good
if (person === 'kerwin' || person === 'bob' || person === 'jim') {
  return 'man';
}

// good
const names = ['kerwin', 'bob', 'jim'];
return names.includes(person);
```

### 3.尽量不要过多的使用 if 嵌套,可以用 return 来跳出方法

```js
// not good
function demo() {
  if (age > 18) {
    if (sex === 'man') {
      // do something
    } else {
      console.log('not man');
    }
  } else {
    console.log('too young');
  }
}

// good
function demo() {
  if (age <= 18) return 'too young';
  if (sex !== 'man') return 'not man';
  // do something
}
```

### 4.使用 map 或映射取代 switch

```js
// not good
const getCarsByState = (state) => {
  switch (state) {
    case 'usa':
      return ['Ford', 'Dodge'];
    case 'france':
      return ['Renault', 'Peugeot'];
    case 'italy':
      return ['Fiat'];
    default:
      return [];
  }
};
console.log(getCarsByState()); // 输出 []
console.log(getCarsByState('usa')); // 输出 ['Ford', 'Dodge']
console.log(getCarsByState('italy')); // 输出 ['Fiat']

// good
const carState = {
  usa: ['Ford', 'Dodge'],
  france: ['Renault', 'Peugeot'],
  italy: ['Fiat'],
};

const getCarsByState = (state) => {
  return carState[state] || [];
};

console.log(getCarsByState()); // 输出 []
console.log(getCarsByState('usa')); // 输出 ['Ford', 'Dodge']
console.log(getCarsByState('france')); // 输出 ['Renault', 'Peugeot']
```

### 5.判断输出框中的值是否为空

```js
// not good
if (value !== null && value !== undefined && value !== '') {
  ...
}

// good
if (value ?? '' !== '') {
  ...
}
```

`??`表示默认值。当遇到`null`和`undefined`时，使用默认值；为空字符串时，为原值。
```js
console.log(1 || "xx") //1
console.log(0 || "xx") //xx
console.log(null || "xx") //xx
console.log(undefined || "xx") //xx
console.log(-1 || "xx") //-1
console.log("" || "xx") //xx

console.log(1 ?? "xx") //1
console.log(0 ?? "xx") //0
console.log(null ?? "xx") //xx
console.log(undefined ?? "xx") //xx
console.log(-1 ?? "xx") //-1
console.log("" ?? "xx") //''
```

## Number 的常用方法

### 1.补零

```js
const FillZero = (num, len) => num.toString().padStart(len, '0');
const num = FillZero(169, 5);
// num => "00169"
```

### 2.转数值

**只对 null、""、false、数值字符串有效**

```js
const num1 = +null;
const num2 = +'';
const num3 = +false;
const num4 = +'169';
// num1 num2 num3 num4 => 0 0 0 169
```

## 数组中的常用方法

### 1.filter

```js
//过滤掉小于 10 的数组元素：

//代码：
function isBigEnough(element, index, array) {
  return element >= 10;
}
var filtered = [12, 5, 8, 130, 44].filter(isBigEnough);
// 12, 130, 44
//结果：[12, 5, 8, 130, 44].filter(isBigEnough) ： 12, 130, 44
```

### 2.some

```js
//检查是否有数组元素大于等于10：

function isBigEnough(element, index, array) {
  return element >= 10;
}
var passed = [2, 5, 8, 1, 4].some(isBigEnough);
// passed is false
passed = [12, 5, 8, 1, 4].some(isBigEnough);
// passed is true
//结果：
//[2, 5, 8, 1, 4].some(isBigEnough) ： false
//[12, 5, 8, 1, 4].some(isBigEnough) ： true
```

### 3.every

```js
//测试是否所有数组元素都大于等于10：

function isBigEnough(element, index, array) {
  return element >= 10;
}
var passed = [12, 5, 8, 130, 44].every(isBigEnough);
// passed is false
passed = [12, 54, 18, 130, 44].every(isBigEnough);
// passed is true
//结果：
//[12, 5, 8, 130, 44].every(isBigEnough) 返回 ： false
//[12, 54, 18, 130, 44].every(isBigEnough) 返回 ： true
```

### 4.forEach

```js
//打印数组内容：
function printElt(element, index, array) {
  document.writeln('[' + index + '] is ' + element + '<br />');
}
[2, 5, 9].forEach(printElt);
// Prints:
// [0] is 2
// [1] is 5
// [2] is 9
//结果：
//[0] is 2
//[1] is 5
//[2] is 9
```

### 5.数组去重

```js
const arr [...new Set([0, 1, 2, 1, 3, 5])]
```

## 内置对象

### 1. Date 转换为时间戳

`date.toJSON`返回格林威治时间的 JSON 格式字符串，转换为北京高时间需要额外加 8 个时区，然后通过正则把`T`干掉，添加空格

```js
function time(time = +new Date()) {
  var date = new Date(time + 8 * 3600 * 1000);
  return date.toJSON().substr(0, 19).replace('T', ' ').replace(/-/g, '.');
}
// "2018.08.09 18:25:54"
```

## 函数方法

### 1.判定条件并执行

```js
// good
const isPass = true;
isPass && myFunc();

// not good
if (isPass) {
  myFunc();
}
```

### 2.判断类型

```js
function DataType(tgt, type) {
  const dataType = Object.prototype.toString
    .call(tgt)
    .replace(/\[object /g, '')
    .replace(/\]/g, '')
    .toLowerCase();
  return type ? dataType === type : dataType;
}
DataType('young'); // "string"
DataType(20190214); // "number"
DataType(true); // "boolean"
DataType([], 'array'); // true
DataType({}, 'array'); // false
```

### 3.函数退出代替条件分支退出

```js
// good
if (flag) {
  return myFunc();
}

// not good
if (flag) {
  myFunc();
  return false;
}
```

### 3.js 科学计数法转十进制数字

在 js 中，如果小数点后超过 6 为小数或正数超过 21 位，会将数字转换位科学计数法。

```ts
function toNonExponential(num) {
  var m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
  return num.toFixed(Math.max(0, (m[1] || '').length - m[2]));
}
```

### 4.获取 url 中的参数

```js
function getQueryString(name) {
  let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  let r = window.location.search.substr(1).match(reg);
  if (r != null) {
    return decodeURIComponent(r[2]);
  }
  return null;
}
```
