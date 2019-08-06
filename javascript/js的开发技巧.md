# JavaScript中的开发技巧

## Number的常用方法

### 1.补零
```js
const FillZero = (num, len) => num.toString().padStart(len, "0");
const num = FillZero(169, 5);
// num => "00169"
```

### 2.转数值
**只对null、""、false、数值字符串有效**
```js
const num1 = +null;
const num2 = +"";
const num3 = +false;
const num4 = +"169";
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
  document.writeln("[" + index + "] is " + element + "<br />");
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
