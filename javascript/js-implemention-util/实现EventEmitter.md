# 实现 EventEmitter

实现一个简单的`EventEmitter`，功能如下：

- addListener(event, listener)：为指定事件添加一个监听器到监听器数组的尾部。

- on(event, listener)：为指定事件注册一个监听器，接受一个字符串 event 和一个回调函数。

- emit(event, [arg1], [arg2], [...])：按监听器的顺序执行执行每个监听器，如果事件有注册监听返回 true，否则返回 false。

- once(event, listener)：为指定事件注册一个单次监听器，即 监听器最多只会触发一次，触发后立刻解除该监听器。

- removeListener(event, listener)：移除指定事件的某个监听器，监听器必须是该事件已经注册过的监听器。它接受两个参数，第一个是事件名称，第二个是回调函数名称。

- removeAllListeners([event])：移除所有事件的所有监听器， 如果指定事件，则移除指定事件的所有监听器。

- setMaxListeners(n)：默认情况下， EventEmitters 如果你添加的监听器超过 10 个就会输出警告信息。 setMaxListeners 函数用于改变监听器的默认限制的数量。

```js
class EventEmitter {
  constructor() {
    this.events = {}; // 存储格式： { 'event-type': [fn1, fn2, fn3] }
    this._maxListeners = undefined; // 最大监听者数量
  }

  addListener(type, handler) {
    if (!this.events[type]) {
      this.events[type] = [];
    }
    // 如果事件已绑定的订阅者数量大于最大限制，则警告
    if (this.events[type].length >= Number(this._maxListeners)) {
      console.warn("Out of range");
      return;
    }

    this.events[type].push(handler);
  }

  prependListener(type, handler) {
    if (!this.events[type]) {
      this.events[type] = [];
    }

    this.events[type].unshift(handler);
  }

  on(type, handler) {
    this.addListener(type, handler);
  }

  emit(type, ...args) {
    if (!this.events[type]) {
      throw new Error(`Cannot find event ${type}`);
    }

    this.events[type].forEach((fn) => {
      Reflect.apply(fn, this, args); // 对一个函数进行调用操作，同时可以传入一个数组作为调用参数，和 Function.prototype.apply() 功能类似
    });
  }

  removeListener(type, handler) {
    if (!this.events[type]) {
      throw new Error(`Cannot find event ${type}`);
    }

    this.events[type] = this.events[type].filter((fn) => fn !== handler);
  }

  once(type, handler) {
    const onceWrap = (...args) => {
      Reflect.apply(handler, this, args);
      this.removeListener(type, onceWrap); // 执行完一次后，立刻将绑定的onceWrap函数移除
    };

    this.on(type, onceWrap);
  }

  removeAllListeners(type) {
    if (arguments.length === 0) {
      for (let key in Reflect.ownKeys(this.events)) {
        Reflect.deleteProperty(key);
      }
      return;
    }
    // 如果传入指定事件，则删除该事件
    Reflect.deleteProperty(type);
  }

  setMaxListeners(n) {
    if (typeof n !== "number" || n < 0 || Number.isNaN(n)) {
      throw new RangeError(
        'The value of "n" is out of range. It must be a non-negative number. Received ' +
          n +
          "."
      );
    }
    this._maxListeners = n;
  }
}

const e = new EventEmitter();
// 测试emit/on
let cb = (data) => {
  console.log("test get params", data);
};
e.on("test", cb);
e.emit("test", "kerwin");

// 测试removeListener
let cb2 = (data) => {
  console.log("test get params2", data);
};
e.on("test2", cb2);
e.removeListener("test2", cb2);
e.emit("test2", "kerwin1"); // 由于上面执行了removeListener，cb2不会执行

// 测试once
let cb3 = (data) => {
  console.log("test get params3", data);
};
e.once("test3", cb3);
e.emit("test3", "kerwin3");
e.emit("test3", "kerwin33");

e.removeAllListeners();
```

## 参考

[Node.js EventEmitter](https://www.runoob.com/nodejs/nodejs-event.html)

[events.js](https://github.com/browserify/events/blob/main/events.js)
