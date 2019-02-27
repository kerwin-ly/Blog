## 如何判定JS的类型

#### typeof
一般的基本类型，我们会用`typeof`进行判断，但是遇到`引用类型`和`Null`的时候则无法判定
```js
typeof(Undefined) // undefined
typeof(Null) // object
typeof(Boolean) // boolean
typeof(Number) // number
typeof(String) // string
typeof(Object) // object
```

#### Object.prototype.toString
```js
// 以下是11种：
var number = 1;          // [object Number]
var string = '123';      // [object String]
var boolean = true;      // [object Boolean]
var und = undefined;     // [object Undefined]
var nul = null;          // [object Null]
var obj = {a: 1}         // [object Object]
var array = [1, 2, 3];   // [object Array]
var date = new Date();   // [object Date]
var error = new Error(); // [object Error]
var reg = /a/g;          // [object RegExp]
var func = function a(){}; // [object Function]

function checkType() {
  for (var i = 0; i < arguments.length; i++) {
    console.log(Object.prototype.toString.call(arguments[i]))
  }
}

checkType(number, string, boolean, und, nul, obj, array, date, error, reg, func)
```

#### type API综合封装
基本类型直接用`typeof`，引用类型用`Object.prototype.toString`
```js
var class2type = {};

// 生成class2type映射
"Boolean Number String Function Array Date RegExp Object Error".split(" ").map(function(item, index) {
    class2type["[object " + item + "]"] = item.toLowerCase();
})

function type(obj) {
    // 兼容ie6将null识别为[object object]
    if (obj == null) {
        return obj + "";
    }
    return typeof obj === "object" || typeof obj === "function" ?
        class2type[Object.prototype.toString.call(obj)] || "object" :
        typeof obj;
}
```