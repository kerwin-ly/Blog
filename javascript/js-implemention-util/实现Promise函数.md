# 实现 Promise 函数

> Promise 是异步编程的一种解决方案，其通常用于解决异步任务导致的回调地狱问题。

## 代码实现

首先，我们得明白，一个 Promise 的函数实现必须满足[Promises/A+ 规范](https://promisesaplus.com/)

该内容较多，我们总结几个比较核心的规则：

> 1.  Promise 有三个状态：待定（pending）、已执行（fulfilled）、已拒绝（rejected），并且 Promise 状态一旦改变，就不会再变。创造 promise 实例后，它会立即执行。
>
> 2.  then 方法接收两个可选参数，分别对应状态改变时触发的回调。then 方法返回一个 promise。then 方法可以被同一个 promise 调用多次。

### 第一版：Promise 状态控制

下面，我们通过一个例子，来看下 Promise 的执行顺序：

```js
const p = new Promise((resolve, reject) => {
  console.log(1);
  resolve(3);
  reject(4);
});
p.then((res) => {
  console.log(res);
});
console.log(2);
// 输出结果如下：
// 1
// 2
// 3
```

上述代码的输出结果顺序是 1 2 3，不会输出 4。是由于 Promise 以下两个特性：

- 创建 Promise 实例后，函数立即执行
- Promise 的状态切换，pending -> fulfilled 或 pending -> rejected，状态一旦改变，不会再变

接下来，我们编写代码实现：

```js
const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';
class MyPromise {
  // promise实例的函数
  constructor(executor) {
    this.status = PENDING; // 当前状态
    this.value = null; // 成功回调的值
    this.reason = null; // 失败回调的值

    // 注意：这里的resolve和reject是在executor内部执行，需要用箭头函数，否则this指向当前作用域
    const _resolve = (value) => {
      // 状态由PENDING转换为FULFILLED后，不可再更改状态
      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value; // 更新成功回调的值
      }
    };

    const _reject = (reason) => {
      // 状态由PENDING转换为REJECTED后，不可再更改状态
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.reason = reason; // 更新失败回调的值
      }
    };

    // new Promise()后立即执行 executor方法，绑定resolve和reject参数
    try {
      executor(_resolve, _reject);
    } catch (error) {
      _reject(error);
    }
  }

  // then方法接收两个参数
  then(onFulFilled, onRejected) {
    // 如果当前状态是FULFILLED，则执行成功回调方法
    if (this.status === FULFILLED) {
      onFulFilled(this.value);
    }
    // 如果当前状态是REJECTED，则执行失败回调方法
    if (this.status === REJECTED) {
      onRejected(this.reason);
    }
  }
}

const p1 = new MyPromise((resolve, reject) => {
  console.log('立刻触发该函数 p1');
  resolve('成功');
});

p1.then(
  (res) => {
    console.log(res);
  },
  (err) => {
    console.log(err);
  }
);

const p2 = new MyPromise((resolve, reject) => {
  console.log('立刻触发该函数 p2');
  reject('失败');
});

p2.then(
  (res) => {
    console.log(res);
  },
  (err) => {
    console.log(err);
  }
);
// 输出结果如下：
// 立刻触发该函数 p1
// 成功
// 立刻触发该函数 p2
// 失败
```

### 第二版：实现异步函数

上面，我们执行了一个同步方法，接下来再看一个异步的方法：

```js
// ...上面代码类似
const p1 = new MyPromise((resolve, reject) => {
  console.log('立刻触发该函数 p1');
  setTimeout(() => {
    resolve('异步成功');
  }, 1000);
});

p1.then(
  (res) => {
    console.log(res);
  },
  (err) => {
    console.log(err);
  }
);

// 输出结果如下：
// 立刻触发该函数 p1
```

注意上述输出结果中并没有“异步成功”的字符串。

这是因为在执行`then()`方法时，由于上面延迟了 1 秒才进行`resolve`，导致`then`方法执行时，当前 Promise 的状态还是`pending`。所以没有被执行。

那么，我们此时就要考虑，如何实现：当`resolve`方法执行后，才执行`then`方法？

其实，我们可以通过实现一个`观察者模式`来达到该目的，观察者模式的常见实现流程是`收集依赖 -> 触发通知 -> 取出依赖执行`。

在 Promise 中实现时，即：`then收集依赖 -> 异步触发resolve通知 -> 取出依赖并执行`

```js
const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';
class MyPromise {
  constructor(executor) {
    this.status = PENDING;
    this.value = null;
    this.reason = null;
    this.onResolvedCallbacks = [];
    this.onRejectedCallbacks = [];

    const _resolve = (value) => {
      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;
        while (this.onResolvedCallbacks.length) {
          // 3. 取出依赖并执行
          const cb = this.onResolvedCallbacks.shift();
          cb(this.value);
        }
      }
    };

    const _reject = (reason) => {
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.reason = reason;
      }
    };

    try {
      executor(_resolve, _reject);
    } catch (error) {
      _reject(error);
    }
  }

  then(onFulFilled, onRejected) {
    if (this.status === FULFILLED) {
      onFulFilled(this.value);
    }
    if (this.status === REJECTED) {
      onRejected(this.reason);
    }
    if (this.status === PENDING) {
      // 1.收集依赖
      this.onResolvedCallbacks.push(onFulFilled);
      this.onRejectedCallbacks.push(onRejected);
    }
  }
}

const p = new MyPromise((resolve, reject) => {
  console.log('立刻触发该函数 p1');
  setTimeout(() => {
    // 2.异步触发resolve通知
    resolve('异步-成功');
  }, 1000);
});

p.then(
  (res) => {
    console.log(res);
  },
  (err) => {
    console.log(err);
  }
);

// 输出结果如下：
// 立刻触发该函数 p1
// 异步-成功
```

### 参考

[promise-polyfill](https://github.com/taylorhakes/promise-polyfill/blob/master/src/index.js)

[9k 字 | Promise/async/Generator 实现原理解析](https://juejin.cn/post/6844904096525189128#heading-14)

[面试官：“你能手写一个 Promise 吗”](https://zhuanlan.zhihu.com/p/183801144)
