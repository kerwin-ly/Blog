# JavaScript 设计模式与开发实践

## 基础知识

### 静态类型和动态类型语言
编程语言按照数据类型大体可以分为两类，一类是静态类型语言，另一类是动态类型语言。静态类型语言**在编译时便已确定变量的类型**，而动态类型语言的变量类型要到**程序运行的时候，待变量被赋予某个值之后，才会具有某种类型**。

### 多态
统一操作作用与不同对象上，产生不同的执行结果。也就是说，**向不同的对象发送同一个消息，这些对象会根据消息作出不同的反馈**。（举例：当鸭子和鸡都收到“叫”的消息后，鸭子反馈的是“嘎嘎嘎”，鸡反馈的是“咯咯咯”）

多态背后的思想是将“可变的部分”和“不变的部分”进行隔离，达到解耦的目的，同时满足开放-封闭原则。

```js
// not good
// 当增加一只狗叫唤时，需要修改makeSound方法，增加else if判断，违反了开放-封闭原则
function makeSound(animal) {
  if (animal instanceof Duck) {
    console.log('嘎嘎嘎');
  } else if (animal instanceof Chicken) {
    console.log('咯咯咯');
  }
}
class Duck {
  constructor() {}
}
class Chicken {
  constructor() {}
}
makeSound(new Duck())
makeSound(new Chicken())
```

```js
// good，如果希望添加再添加一只狗，只需要增加狗的类即可，不需要修改makesound方法
function makeSound(animal) {
  animal.sound();
}
class Duck {
  constructor() {}

  sound() {
    console.log('嘎嘎嘎');
  }
}
class Chicken {
  constructor() {}

  sound() {
    console.log('咯咯咯')
  }
}
makeSound(new Duck()) // 嘎嘎嘎
makeSound(new Chicken()) // 咯咯咯
```

### 封装
封装的目的是将信息隐藏。通过封装变化的方式，咱们也可以把系统中稳定不变的部分和容易变化的部分隔离开来，在系统的演变过程中，我们只需要替换那些变化的部分，而如果变化的部分是已经封装好了，替换起来也相对容易，便可以最大程度的保证程序的稳定性和可扩展性。

### 继承
面向对象编程最重要的特性之一就是可以扩展已有的类，它允许我们创建一个类（子类），从已有的类（父类）上继承所有的属性和方法，子类可以包含父类中没有的属性和方法；

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

### 4.代理模式

> 代理模式表示，当不方便去访问某对象时，采用访问其替身对象来控制对其的访问。

例子：计算乘积的函数（缓存代理）

```ts
var mult = function() {
  var a = 1;
  for (var i = 0, l = arguments.length; i < l; i++) {
    // console.log(arguments[i], a)
    a = a * arguments[i];
  }
  return a;
};

var proxyMult = (function(aa) {
  var cache = {};
  return function() {
    var args = Array.prototype.join.call(arguments, ",");
    if (args in cache) {
      return cache[args];
    }
    return (cache[args] = mult.apply(this, arguments));
  };
})();

proxyMult(1, 2, 3, 4); // print 24
```

### 5.迭代器模式

> 迭代器模式是指提供一种顺序方法去访问某聚合对象的元素，而又不暴露其内部构造。

#### 内部迭代器和外部迭代器

- **内部迭代器**在调用的时候非常方便，外界不用关心迭代器内部的实现，跟迭代器的交互也仅 仅是一次初始调用。但如果想修改内部迭代方式，则十分麻烦。如上面的`each`方法

```js
var each = function(array, callback) {
  for (var i = 0, l = array.length; i < l; i++) {
    callback(array[i], i, array[i]);
  }
};

each([1, 2, 3], function(i, n) {
  console.log(i, n);
});
```

- **外部迭代器**必须显式地请求迭代下一个元素，增加了一些调用的复杂度，但相对也增强了迭代器的灵活性，我们可以手工控制 迭代的过程或者顺序。

```js
var Iterator = function(obj) {
  var current = 0;
  var next = function() {
    current += 1;
  };
  var isDone = function() {
    return current >= obj.length;
  };
  var getCurrenItem = function() {
    return obj[current];
  };
  return {
    next,
    isDone,
    getCurrenItem
  };
};
```

### 6.发布订阅模式

> 发布—订阅模式又叫观察者模式，它定义对象间的一种一对多的依赖关系，当一个对象的状 态发生改变时，所有依赖于它的对象都将得到通知。在 JavaScript 开发中，我们一般用事件模型 来替代传统的发布—订阅模式。

```js
var event = {
  clientList: [],
  listen: function(key, fn) {
    if (!this.clientList[key]) {
      this.clientList[key] = [];
    }
    this.clientList[key].push(fn); // 订阅的消息添加进缓存列表
  },
  trigger: function() {
    var key = Array.prototype.shift.call(arguments),
      fns = this.clientList[key];
    if (!fns || fns.length === 0) {
      // 如果没有绑定对应的消息
      return false;
    }
    for (var i = 0, fn; (fn = fns[i++]); ) {
      fn.apply(this, arguments);
    }
  }
};

var installEvent = function(obj) {
  for (var i in event) {
    obj[i] = event[i];
  }
};

var salesOffices = {};
installEvent(salesOffices);
salesOffices.listen("squareMeter88", function(price) {
  console.log("价格= " + price);
});
salesOffices.listen("squareMeter100", function(price) {
  console.log("价格= " + price);
  // 小明订阅消息
  // 小红订阅消息
});
salesOffices.trigger("squareMeter88", 2000000); // 输出:2000000
salesOffices.trigger("squareMeter100", 3000000); // 输出:3000000
```

### 7. 命令模式

> 命令模式中的命令(command)指的是一个执行某些特定事情的指令。命令模式最常见的应用场景是:有时候需要向某些对象发送请求，但是并不知道请求的接收 者是谁，也不知道被请求的操作是什么。此时希望用一种松耦合的方式来设计程序，使得请求发送者和请求接收者能够消除彼此之间的耦合关系。在 js 中，使用高阶函数能够轻易实现

```js
const closeDoorCommand = {
  excute: function() {
    console.log("close the door");
  }
};

const openPcCommand = {
  excute: function() {
    console.log("open pc");
  }
};

const openQQCommand = {
  excute: function() {
    console.log("open QQ");
  }
};

var MarcoCommand = function() {
  return {
    commandList: [],
    add: function(command) {
      this.commandList.push(command);
    },
    excute: function() {
      for (let i = 0; i < this.commandList.length; i++) {
        this.commandList[i].excute();
      }
    }
  };
};

const marcoCommand = new MarcoCommand();
marcoCommand.add(closeDoorCommand);
marcoCommand.add(openPcCommand);
marcoCommand.add(openQQCommand);
marcoCommand.excute();
```

### 8. 模板模式

> 模板模式通常是指在父类封装了子类的算法结构，包括了一些公共方法及其子类中方法的执行顺序（如：angular/vue/react 的生命周期执行顺序）子类可以集成这个抽象类，来继承其整个算法结构，也可以进行重写

举例：煮 coffee || tea，他们有类似的操作步骤。如 把水煮沸 => 用沸水冲泡咖啡/茶 => 把咖啡/茶倒进杯子 => 加糖/柠檬

```js
const Beverage = function(param) {
  const boilWater = function() {
    console.log("把水煮沸");
  };

  const brew =
    param.brew ||
    function() {
      throw new Error("必须传递 brew 方法");
    };

  const pourInCup =
    param.pourInCup ||
    function() {
      throw new Error("必须传递 pourInCup 方法");
    };

  const addCondiments =
    param.addCondiments ||
    function() {
      throw new Error("必须传递 addCondiments 方法");
    };

  const F = function() {};

  F.prototype.init = function() {
    boilWater();
    brew();
    pourInCup();
    addCondiments();
  };

  return F;
};

const Coffee = Beverage({
  brew: function() {
    console.log("用沸水冲泡咖啡");
  },
  addCondiments: function() {
    console.log("把咖啡倒进杯子");
  },
  pourInCup: function() {
    console.log("加糖和牛奶");
  }
});

const Tea = Beverage({
  brew: function() {
    console.log("用沸水冲泡茶叶");
  },
  addCondiments: function() {
    console.log("把茶叶倒进杯子");
  },
  pourInCup: function() {
    console.log("加柠檬");
  }
});
```

### 9. 享元模式

> 享元(flyweight)模式是一种用于性能优化的模式，目的在于尽量减少共享对象的数量。使用享元模式的关键是如何区别内部状态和外部状态，可以被对象共享的属性通常被划分为 内部状态，如同不管什么样式的衣服，都可以按照性别不同，穿在同一个男模特或者女模特身上， 模特的性别就可以作为内部状态储存在共享对象的内部。而外部状态取决于具体的场景，并根据 场景而变化，就像例子中每件衣服都是不同的，它们不能被一些对象共享，因此只能被划分为外 部状态。

举例：有个服装厂，生产了男女服装各 50 种款式，为了推销需要找模特来拍照，正常可能会找男女模特各 50 个，每个模特分别穿一种服装拍一组照片。传统方法其代码实现如下：

常规写法：有多少款式，就会生成多少对象

```js
class Modal {
  constructor(name, gender, clothes) {
    this.name = name;
    this.gender = gender;
    this.clothes = clothes;
  }

  takePhoto() {
    console.log(`${this.gender}模特${this.name}穿${this.clothes}拍了张照`);
  }
}

// 穿衣拍照实现
for (let i = 0; i < 50; i++) {
  let manModel = new Modal(`张${i}`, "男", `服装${i}`);
  manModel.takePhoto();
}

for (let i = 50; i < 100; i++) {
  let womanModel = new Modal(`李${i}`, "女", `服装${i}`);
  womanModel.takePhoto();
}
```

使用享元模式重构

```js
class Modal {
  // 单例模式
  static create(id, gender) {
    if (this[gender]) {
      return this[gender];
    }
    return (this[gender] = new Modal(id, gender));
  }
}

// 管理外部状态
class TakeClothesManager {
  static addClothes(id, gender, clothes) {
    const modal = ModalFactory.create(id, gender);
    this[id] = {
      clothes,
      modal
    };
  }

  static takePhoto(id) {
    const obj = this[id];
    console.log(
      `${obj.modal.gender}模特${obj.modal.name}穿${obj.clothes}拍了张照`
    );
  }
}

for (let i = 0; i < 50; i++) {
  TakeClothesManager.addClothes(i, "男", `服装${i}`);
  TakeClothesManager.takePhoto(i);
}

for (let i = 50; i < 100; i++) {
  const { addClothes, takePhoto } = TakeClothesManager;
  TakeClothesManager.addClothes(i, "女", `服装${i}`);
  TakeClothesManager.takePhoto(i);
}
```

### 10. 职责链模式

> 使多个对象都有机会去处理请求，避免了发送者与接收者之间的耦合，将这些对象连成一条链，依次传递，直到有对象处理请求为止。（如：公交车递卡刷卡行为）

eg: 假设我们负责一个售卖手机的电商网站，经过分别交纳 500 元定金和 200 元定金的两轮预定后(订单已在此时生成)，现在已经到了正式购买的阶段。
公司针对支付过定金的用户有一定的优惠政策。在正式购买后，已经支付过 500 元定金的用 户会收到 100 元的商城优惠券，200 元定金的用户可以收到 50 元的优惠券，而之前没有支付定金 的用户只能进入普通购买模式，也就是没有优惠券，且在库存有限的情况下不一定保证能买到。

- orderType:表示订单类型(定金用户或者普通购买用户)，code 的值为 1 的时候是 500 元 定金用户，为 2 的时候是 200 元定金用户，为 3 的时候是普通购买用户。
- pay:表示用户是否已经支付定金，值为 true 或者 false, 虽然用户已经下过 500 元定金的 订单，但如果他一直没有支付定金，现在只能降级进入普通购买模式。
- stock:表示当前用于普通购买的手机库存数量，已经支付过 500 元或者 200 元定金的用 户不受此限制。

常规写法：`if else`判断

```js
const order = function(orderType, pay, stock) {
  if (orderType === 1) {
    // 500 元定金购买模式
    if (pay === true) {
      // 已支付定金
      console.log("500 元定金预购, 得到 100 优惠券");
    } else {
      // 未支付定金，降级到普通购买模式
      if (stock > 0) {
        // 用于普通购买的手机还有库存
        console.log("普通购买, 无优惠券");
      } else {
        console.log("手机库存不足");
      }
    }
  } else if (orderType === 2) {
    if (pay === true) {
      // 已支付定金
      console.log("200 元定金预购, 得到 50 优惠券");
    } else {
      // 未支付定金，降级到普通购买模式
      if (stock > 0) {
        // 用于普通购买的手机还有库存
        console.log("普通购买, 无优惠券");
      } else {
        console.log("手机库存不足");
      }
    }
  } else {
    if (stock > 0) {
      // 用于普通购买的手机还有库存
      console.log("普通购买, 无优惠券");
    } else {
      console.log("手机库存不足");
    }
  }
};
```

使用职责链模式重构

```js
const order500 = function(orderType, pay, stock) {
  if (orderType === 1 && pay === true) {
    console.log("500 元定金预购, 得到 100 优惠券");
  } else {
    return "nextSuccessor";
  }
};

const order200 = function(orderType, pay, stock) {
  if (orderType === 2 && pay === true) {
    console.log("200 元定金预购, 得到 50 优惠券");
  } else {
    return "nextSuccessor";
  }
};

const orderNormal = function(orderType, pay, stock) {
  if (stock > 0) {
    // 用于普通购买的手机还有库存
    console.log("普通购买, 无优惠券");
  } else {
    console.log("手机库存不足");
  }
};

Function.prototype.after = function(fn) {
  var self = this;

  return function() {
    var ret = self.apply(this, arguments);

    if (ret === "nextSuccessor") {
      return fn.apply(this, arguments);
    }
    return ret;
  };
};

var order = order500.after(order200).after(orderNormal); // 定义职责链规则

order(1, true, 500); // 输出:500 元定金预购，得到 100 优惠券
order(2, true, 500); // 输出:200 元定金预购，得到 50 优惠券
order(1, false, 500); // 输出:普通购买，无优惠券
```

### 11. 中介者模式

> 中介者模式目的在于，解决业务开发时，很多对象与对象的引用，高耦合度问题。让其对象只与中介者通信，处理业务均在中介者中，来达到解耦的目的。比如：买卖房子，买方只需要和中介来询问房屋资源，不用挨个询问 xxx 你是否卖房。卖方也只需要把自己的房屋信息交给中介。由中介来保持双方通信。

### 12. 装饰者模式

> 在不改变自身的逻辑情况下，在代码运行时给其添加职责。

### 13. 状态模式

> 状态模式定义了状态与行为之间的关系，并将它们封装在一个类里。通过增加新的状态 类，很容易增加新的状态和转换。避免 Context 无限膨胀，状态切换的逻辑被分布在状态类中，也去掉了 Context 中原本过多的条件分支。用对象代替字符串来记录当前状态，使得状态的切换更加一目了然。Context 中的请求动作和状态类中封装的行为可以非常容易地独立变化而互不影响。

### 14.适配器模式

> 适配器模式的作用是解决两个软件实体间的接口不兼容的问题。使用适配器模式之后，原本由于接口不兼容而不能工作的两个软件实体可以一起工作。个人认为和装饰器模式，理念类似。

适配器模式举例：以前调用 googleMap 和 baiduMap 都是 show 方法，某次版本后，baiduMap 改成了 display 方法。在不改动以前复杂逻辑情况下使用适配器

```ts
const googleMap = {
  show: function() {
    console.log('render googleMap');
  }
}

const baiduMap = {
  display: function() {
    console.log('render baiduMap');
  }
}

function renderMap(map) {
  map.show();
}

function baiduMapAdapter(baiduMap) {
  show: function() {
    return baiduMap.display();
  }
}

renderMap(googleMap);
// renderMap(baiduMap);
renderMap(baiduMapAdapter);

```

## 设计原则

### 1.单一职责原则(Single Responsibility Principle, SRP)

> 单一职责原则体现为：**一个对象(方法)只做一件事情**（eg: 装饰者模式 ，代理模式，单例模式，单例模式等）

需要注意的是，不是所有的职责都应该被一一分离。一方面，如果随着需求的变化，有两个职责总是同时变化，那就不必分离他们。（如：`ajax`创建`XMLHttpRequest`和发送`xhr`请求）另一方面，某些情况下，两个职责被耦合在一起，但几乎没有变化的可能性，就没有必要分开它们。等到真正变化的时候，再解耦也不迟。

* 优点：降低了单个类或者对象的复杂度，按照职责把对象分解成更小的粒度， 这有助于代码的复用，也有利于进行单元测试。当一个职责需要变更的时候，不会影响到其他 的职责。

* 缺点：最明显的是会增加编写代码的复杂度。当我们按照职责把对象分解成更小的粒度之后，实际上也增大了这些对象之间相互联系的难度。

“单一职责原则”是咱们在开发中最常见的一个规则，比起一个上百行代码的“胖函数”，拆成一个个更小颗粒的函数并组装，会显得更加易读，优雅。

下面是cli工具中根据yapi生成service代码的部分逻辑
```ts
// not good, 如果不考虑单一职责，一个run函数就可以执行完所有逻辑，但让代码的阅读者着实头痛。
async run(projectId: string, answers: inquirer.Answers) {
  const swaggerAddress = cwd() + '/swaggerApi.json'; // 本地swagger保存地址
  try {
      const user = await yApi.login({ email: yapiConfig.email, password: yapiConfig.password });

      if (user.errcode && user.errcode !== 0) {
        error('Error: ' + user.errmsg);
        process.exit(1);
      }
      const swagger = await yApi.getSwaggerJson({
        type: 'xxx',
        pid: Number(projectId),
        status: 'all',
        isWiki: false,
      });

      if (swagger.errcode && swagger.errcode !== 0) {
        if (swagger.errcode === 502) {
          error(`Error: You don't have rights to download swaggerApi.json`);
        } else {
          error('Error: ' + swagger.errmsg);
        }
        process.exit(1);
      }
      fs.writeFileSync(localAddress, JSON.stringify(swagger, null, '\t'));
      log(`${chalk.green('✔')}  Successfully created swaggerApi.json in the root directory`);
    } catch (err) {
      throw err;
    }
    const swaggerJson = require(swaggerAddress);
    const str = tags.reduce((total: string, item: Tag) => (total += item.name), '');
    const reg = /.*[\u4e00-\u9fa5]+.*$/i;
    if (reg.test(str)) return;
    const packageJson = require(cwd() + '/package.json');

    if (packageJson['devDependencies']['xxx']) return;
    install({
      devDependencies: ['xxx'],
    });
}
```

```ts
// good, 将职责划分到各个函数中去。一个函数仅拥有一个职责，并进行关联。可以很亲清晰的了解开发者的用意
async run(projectId: string, answers: inquirer.Answers) {
  const swaggerAddress = cwd() + '/swaggerApi.json';
  await this.downloadSwaggerJson(projectId, swaggerAddress); // 下载swaggerApi.json到本地
  const swaggerJson = require(swaggerAddress);
  if (this.hasChinese(swaggerJson.tags)) { // 判断swagger的分类是否含有中文
    error('Error: Tags should be english in yapi');
    return;
  }
  this.installPackages(); // 安装依赖
  ...
}
```

### 2.最少知识原则/迪米特法则(Least Knowledge Principle)

> `迪米特法则`是指尽量较少对象与对象之间的引用，如果迫不得已，最好是通过第三方对象来对这两个对象进行通信。而不让两个对象直接发生关系。（eg: 中介者模式，外观模式）

* 优点：可以实现对象之间的关系解耦，避免混乱的对象之间的引用

* 缺点：当系统的体量十分庞大时，也会导致中介者对象十分复杂，难以维护

如果你的对象引用是如下这种情况
![对象引用](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/intermediary-false.png)

很明显的，你违背了迪米特法则。对象的四处引用会导致你的程序变得不太牢固。也许你可以尝试下用`中介者模式`来进行改造
![中介者模式](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/intermediary-false.png)

这里使用一个中介者模式进行举例，如开发一个聊天室系统，咱们应尽量避免用户之间直接发送信息，而是通过“中介者-聊天室”来进行消息传递。如果还需要额外的信息，如发送图片等，直接在中介者类中添加即可，不会对用户类和以前的功能产生耦合。
```ts
// 举例：中介者模式
// 聊天室类
class CharRoom {
  static showMessage(name: string, message: string) {
    console.log(`${name}：${message}`)
  }
}

// 抽象
abstract class User {
  protected name: string

  public abstract sendMessage(message: string): void
}

class Jock extends User {
  constructor () {
    super()
    this.name = 'Jock'
  }

  public sendMessage (message: string): void {
    CharRoom.showMessage(this.name, message)
  }
}

class Mary extends User {
  constructor () {
    super()
    this.name = 'Mary'
  }

  public sendMessage (message: string): void {
    CharRoom.showMessage(this.name, message)
  }
}

const mary = new Mary()
const jock = new Jock()

mary.sendMessage('Hello world!')
jock.sendMessage('Hello Vue')
```

### 3.开放-封闭原则(Open Closed Principle, OCP)

> 在面向对象的程序设计中，`开放封闭原则(OCP)`是最重要的一条原则。其意思是当需要对一个程序的某个功能进行新增或改变时候，**对源码的扩展/新增开放，对源码的修改关闭，也就是说尽量在不修改源码逻辑的情况下，通过增加代码的方式来满足变化的需求**。其核心在于区分系统中变化和不变的地方，利用对象的多态性将变化的地方进行封装处理。（几乎所有的设计模式/原则都是遵守开放-封闭原则的）

这里举个例子，计算多边形的面积
```ts
class Rectangle {
  public width: number;
  public height: number;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
}

class Circle {
  public radius: number;
  constructor(radius: number) {
    this.radius = radius;
  }
}

function calculateAreasOfMultipleShapes(
  shapes: Array<Rectangle | Circle>
) {
  return shapes.reduce(
    (calculatedArea, shape) => {
      if (shape instanceof Rectangle) {
        return calculatedArea + shape.width * shape.height;
      }
      if (shape instanceof Circle) {
        return calculatedArea + shape.radius * Math.PI;
      }
    },
    0
  );
}
```

这时候需求变了。有更多的多边形面积需要计算，如果直接添加`else if`可能会去修改到我们的源代码，如果其源码本身已经很复杂了，则可能导致不必要的影响。那么我们就可以考虑下利用`开放封闭原则`。利用对象的`多态性`来进行重构，把变化的进行封装，让变化的和不变的内容进行隔离。
```ts
interface Shape {
  getArea(): number;
}

class Rectangle implements Shape {
  public width: number;
  public height: number;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
  public getArea() {
    return this.width * this.height;
  }
}

class Circle implements Shape {
  public radius: number;
  constructor(radius: number) {
    this.radius = radius;
  }
  public getArea() {
    return this.radius * Math.PI;
  }
}

function calculateAreasOfMultipleShapes(
  shapes: Shape[]
) {
  return shapes.reduce(
    (calculatedArea, shape) => {
      return calculatedArea + shape.getArea();
    },
    0
  );
}
```

上面的例子中可以看出，遵守开放-封闭原则，我们的代码多了许多。而开放-封闭原则是一个看起来比较虚幻的原则，我们很难在第一次了解需求的时候就知道哪些地方可能改变。所以，我们在第一次开发时，最好还是优先保证项目交付，让代码尽可能简洁即可。当需求变化时，再去考虑“封装”并遵守开放-封闭原则。不然，可能会导致你过度封装，代码臃肿。（如：客户让你计算地球的体积，你按球体计算即可，没必要考虑地球变方了，又去把计算体积的方法进行抽象封装）

### 4.里式置换原则(Liskov Substitution Princple, LSP)
子类能覆盖父类；父类能出现的地方子类就能出现

### 5.依赖倒置原则(Dependency Inversion Principle, DIP)
编程依赖抽象接口，不要依赖具体实现；使用方只关注接口而不关注具体类的实现；

### 6.接口独立原则(Interface Segregation Principle, ISP)
保持接口的单一独立，避免出现臃肿接口。在使用接口隔离原则时，我们需要注意控制接口的粒度，接口不能太小，如果太小会导致系统中接口泛滥，不利于维护；接口也不能太大，太大的接口将违背接口隔离原则，灵活性较差，使用起来很不方便。

## 重构

### 1.提炼函数

避免出现超大函数，更利于代码复用，同时函数方法的命名起到了注释的作用

```ts

// not good
this.http.post('xxx', res => {
  _.forEach(res.data, item => {
    ...
  })
})

// good
this.http.post('xxx', res => {
  this.addExtraParam(res.data);
})

function addExtraParam(data) {
  ...
}
```

### 2.合并重复的条件片段

将重复的代码提炼出来

```ts
// not good
if (age < 18) {
  console.log("未成年");
  goNetBar();
} else if (age >= 18 && age <= 40) {
  console.log("中年人");
  goNetBar();
} else {
  console.log("老头子");
  goNetBar();
}

// good
if (age < 18) {
  console.log("未成年");
} else if (age >= 18 && age <= 40) {
  console.log("中年人");
} else {
  console.log("老头子");
}
goNetBar();
```

### 3.把条件分支语句提炼成函数

```ts
// not good
function getPrice(price) {
  const date = new Date();
  if (date.getMonth() >= 6 && date.getMonth <= 9) {
    return price * 0.8;
  }
  return price;
}

// good
function getPrice(price) {
  if (isSummer()) {
    return price * 0.8;
  }
  return price;
}

function isSumer() {
  const date = new Date();
  return date.getMonth() >= 6 && date.getMonth <= 9;
}
```

### 4.合理使用循环

### 5.提前让函数退出代替嵌套条件分支

```ts
// not good
function getPerson(person) {
  if (person.age < 18) {
    if (person.sexy === "man") {
      console.log("不要男的");
    } else {
      console.log("ok");
    }
  } else {
    console.log("不要成年人");
  }
}

// good
function getPerson(person) {
  if (person.age >= 18) {
    console.log("不要成年人");
    return;
  }
  if (person.sexy === "man") {
    console.log("不要男的");
    return;
  }
  console.log("ok");
}
```

### 6.传递对象参数代替过长的参数列表(超过 3 个参数，建议使用参数对象)

```ts
// not good
function getPerson(name, age, phone, address) {
  console.log(name, age, phone, address);
}
getPerson("kerwin", 23, 182323232, "earth");

// good
function getPerson(person) {
  console.log(person);
}
getPerson({
  name: "kerwin",
  age: 23,
  phone: 23342343,
  address: "earth"
});
```

### 7.尽量减少参数数量

### 8.少用三目运算符，尤其是嵌套的三目运算符

### 9.合理使用链式调用

### 10.分解大型类

### 11.用 return 退出多重循环

```ts
// not good
function getNum() {
  let flag;
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      if (i * j >= 30) {
        flag = true;
      }
      if (flag) {
        break;
      }
    }
  }
}

// good
function getNum() {
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      // if (i * j >= 30) return;
      if (i * j >= 30) return printNum(i * j); // 如果return后，还要调用方法
    }
  }
}

function printNum(num) {
  console.log(num);
}
```
