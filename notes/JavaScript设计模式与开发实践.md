# JavaScript 设计模式与开发实践

## 设计模式

### 1.原型模式

> 从 设计模式的角度讲，原型模式是用于创建对象的一种模式。原型模式的实现关键在于语言本身是否提供了`clone`方法。如 ECMAScript 5 提供了 Object.create 方法，可以用来克隆对象。在 js 中，一个对象的创建，实际上相当于*一个对象的克隆/继承*，JavaScript 中的根对象是 Object.prototype 对象。

原型继承：如果对象 b 和其原型上没有属性`name`，请求将通过`__proto__`记录委托给其构造器的原型如：`Object.prototype`去查找。但这不是无限制的，当查找到`Object.prototype`时候还没有查找到`name`。由于其构造器的原型`Object.prototype`值为`null`，而`null`没有 prototype 了。原型链的请求便终止。返回`undefined`

```ts
const obj = { name: "kerwin" };
obj.__proto__ === Object.Prototype; // true

var A = function() {};
A.prototype = { name: "sven" };
var B = function() {};
B.prototype = new A();
var b = new B();
console.log(b.name); // 输出:sven
```

### 2.单例模式

> 保证一个类仅有一个实例，并提供一个访问它的全局访问点

```ts
var Singleton = function(name) {
  this.name = name;
  this.instance = null;
};
Singleton.prototype.getName = function() {
  alert(this.name);
};
Singleton.getInstance = function(name) {
  if (!this.instance) {
    this.instance = new Singleton(name);
  }
  return this.instance;
};
var a = Singleton.getInstance("sven1");
var b = Singleton.getInstance("sven2");

alert(a === b); // true
```

#### 2.1 通用的惰性单例

把创建实例对象的职责和管理单例的职责分别放置在两个方法里，这两 个方法可以独立变化而互不影响，当它们连接在一起的时候，就完成了创建唯一实例对象的功能，

```ts
var createSingleIframe = getSingle(function() {
  var iframe = document.createElement("iframe");
  document.body.appendChild(iframe);
  return iframe;
});
document.getElementById("loginBtn").onclick = function() {
  var loginLayer = createSingleIframe();
  loginLayer.src = "http://baidu.com";
};
```

### 3.策略模式

> 定义一系列的算法，把它们一个个封装起来，并且使它们可以相互替换。(定义一系列的算法，把它们各自封装成策略类，算法被 封装在策略类内部的方法里)

例子：绩效为 S 的人年 终奖有 4 倍工资，绩效为 A 的人年终奖有 3 倍工资，而绩效为 B 的人年终奖是 2 倍工资。假设财 务部要求我们提供一段代码，来方便他们计算员工的年终奖。

简单暴力方法(这样做的一个弊端是，如果一旦修改了员工等级，如新增了一个登记'c'，需要去函数内部再次创建一个判断出来，违反了其封闭-开放原则)

```ts
var calculateBonus = function(performanceLevel, salary) {
  if (performanceLevel === "S") {
    return salary * 4;
  }
  if (performanceLevel === "A") {
    return salary * 3;
  }
  if (performanceLevel === "B") {
    return salary * 2;
  }
};
calculateBonus("B", 20000); // 输出:40000 calculateBonus( 'S', 6000 ); // 输出:24000
```

策略模式 ：当调用计算奖金方法时候，不是直接执行其计算逻辑，而是委托给`策略对象`。使逻辑不会无限堆积在`caculateBonus`中。当发起请求时，根据其`level salary`进行替换，这正是对象的多态性，也是`它们可以相互替换`的目的。替换 Context 中当前保存的策略对象，便能执 行不同的算法来得到我们想要的结果。

```ts
const strategies = {
  1: salary => salary * 1,
  2: salary => salary * 2,
  3: salary => salary * 3
};

var caculateBonus = (level, salary) => {
  return strategies[level](salary);
};

console.log(caculateBonus(2, 2000));
```

广义的'算法': 如何策略模式只使用一些简单的'计算'，未免有点大材小用了。也可以对`业务规则`进行封装，只要这些业务规则指向的目标一致，并且可以被替换使用。如下：对表单验证进行封装

传统的表单验证

```ts
var registerForm = document.getElementById("registerForm");
registerForm.onsubmit = function() {
  if (registerForm.userName.value === "") {
    alert("用户名不能为空");
    return false;
  }
  if (registerForm.password.value.length < 6) {
    alert("密码长度不能少于 6 位");
    return false;
  }
  if (!/(^1[3|5|8][0-9]{9}$)/.test(registerForm.phoneNumber.value)) {
    alert("手机号码格式不正确");
    return false;
  }
};
```

策略模式封装

```ts
var strategies = {
  isNotEmpty: (value, errorMsg) => {
    if (value === "") {
      return errorMsg;
    }
  },
  minLength: (value, length, errorMsg) => {
    if (value.length < length) {
      return errorMsg;
    }
  },
  isMobile: (value, errorMsg) => {
    // 手机号码格式
    if (!/(^1[3|5|8][0-9]{9}$)/.test(value)) {
      return errorMsg;
    }
  }
};

var Validator = function(){
this.cache = []; // 保存校验规则
};
Validator.prototype.add = function(
  var ary = rule.split( ':' );
  this.cache.push(function(){ //
  var strategy = ary.shift(); ary.unshift( dom.value ); ary.push(errorMsg); // return strategies[ strategy
  });
};
Validator.prototype.start = function(){
  for ( var i = 0, validatorFunc; validatorFunc = this.cache[ i++ ]; ){
    var msg = validatorFunc(); // 开始校验，并取得校验后的返回信息 if ( msg ){ // 如果有确切的返回值，说明校验没有通过
    return msg; 
  }
};

var validataFunc = function() {
  var validator = new Validator(); // 创建一个 validator 对象
  /***************添加一些校验规则****************/
  validator.add(registerForm.userName, "isNonEmpty", "用户名不能为空");
  validator.add(registerForm.password, "minLength:6", "密码长度不能少于 6 位");
  validator.add(registerForm.phoneNumber, "isMobile", "手机号码格式不正确");
  var errorMsg = validator.start(); // 获得校验结果
  return errorMsg; // 返回校验结果
};
var registerForm = document.getElementById("registerForm");
registerForm.onsubmit = function() {
  var errorMsg = validataFunc(); // 如果 errorMsg 有确切的返回值，说明未通过校验 if ( errorMsg ){
  alert(errorMsg);
  return false; // 阻止表单提交 }
};

```
