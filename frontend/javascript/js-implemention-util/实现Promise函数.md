# 实现 Promise 函数

> Promise 是异步编程的一种解决方案，其通常用于解决异步任务导致的回调地狱问题。

## 代码实现

首先，我们得明白，一个 Promise 的函数实现必须满足[Promises/A+ 规范](https://promisesaplus.com/)

该内容较多，我们总结几个比较核心的规则：

> 1.  Promise 有三个状态：待定（pending）、已执行（fulfilled）、已拒绝（rejected），并且 Promise 状态一旦改变，就不会再变。创造 promise 实例后，它会立即执行。
>
> 2.  then 方法接收两个可选参数，分别对应状态改变时触发的回调。then 方法返回一个 promise。then 方法可以被同一个 promise 调用多次。

### 1.实现 Promise 状态控制

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
const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";
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

  // 这里的catch方法，实际就是调用then的第二个方法
  catch(errorCallback) {
    this.then(null, errorCallback);
  }
}

const p1 = new MyPromise((resolve, reject) => {
  console.log("立刻触发该函数 p1");
  resolve("成功");
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
  console.log("立刻触发该函数 p2");
  reject("失败");
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

### 2.实现异步函数

上面，我们实现了同步方法的 Promise，但接下来再看一个异步的方法（由于没办法模拟微任务，我们通过宏任务的异步任务模拟）：

```js
const p1 = new MyPromise((resolve, reject) => {
  console.log("立刻触发该函数 p1");
  setTimeout(() => {
    resolve("异步成功");
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
const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";
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
          // 3. 取出执行队列中的回调函数并执行
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
      // 1.收集依赖-将回调函数加入到执行队列中
      this.onResolvedCallbacks.push(onFulFilled);
      this.onRejectedCallbacks.push(onRejected);
    }
  }

  catch(errorCallback) {
    this.then(null, errorCallback);
  }
}

const p = new MyPromise((resolve, reject) => {
  console.log("立刻触发该函数 p1");
  setTimeout(() => {
    // 2.异步触发resolve通知观察者
    resolve("异步-成功");
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

### 3.实现 then 链式调用和值穿透

> 链式调用是指在 then 方法中 return 一个任何值，都可以在下一个 then 方法中拿到。而且，当我们不在 then 中放入参数，例：promise.then().then()，那么其后面的 then 依旧可以得到之前 then 返回的值，这就是所谓的值的穿透

我们先来看一个链式调用的例子，如下：

```js
const p1 = new Promise((resolve, reject) => {
  resolve(1);
});

p1.then((res) => {
  console.log(res);
  //then回调中可以return一个Promise
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(2);
    }, 1000);
  });
})
  .then((res) => {
    console.log(res);
    //then回调中也可以return一个值
    return 3;
  })
  .then((res) => {
    console.log(res);
  });

// 输出结果如下：
// 1
// 2
// 3
```

通过上面例子，我们可以大致整理出链式调用的实现逻辑：

1. then 方法中需返回一个 Promise 函数，才能继续执行`then`方法

2. 判断`then`方法中返回的是否是一个 Promise 函数。是，则将其加入到`执行任务队列`中；否，则直接执行 resolve 方法进行通知，将执行队列中的函数取出并执行

具体实现代码如下：

```js
const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";
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
    // 处理onFulFilled和onRejected未传值的情况
    onFulFilled =
      typeof onFulFilled === "function" ? onFulFilled : (value) => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw new Error(reason instanceof Error ? reason.message : reason);
          }; // 直接抛出错误，终止流程

    // 为保证链式调用，结果需返回一个promise函数
    return new MyPromise((resolve, reject) => {
      // 回调成功方法
      const fulfilledFn = (res) => {
        try {
          const beforeResolvedResult = onFulFilled(res); // 获取当前then方法中的返回值
          // 如果当前then方法中返回了一个Promise，则执行then方法，将函数加入到执行队列中
          // 如果返回的是一个值，则执行resolve方法，触发通知，将队列中的函数取出来执行
          beforeResolvedResult instanceof MyPromise
            ? beforeResolvedResult.then(resolve, reject)
            : resolve(res);
        } catch (error) {
          reject(error);
        }
      };

      // 回调失败方法，同理
      const rejectedFn = (err) => {
        try {
          const res = onRejected(err);
          res instanceof MyPromise ? res.then(resolve, reject) : resolve(res);
        } catch (error) {
          reject(error);
        }
      };

      switch (this.status) {
        // 当状态为pending时,把then回调push进resolve/reject执行队列,等待执行
        case PENDING:
          this.onResolvedCallbacks.push(fulfilledFn); // 加入函数执行队列
          this.onRejectedCallbacks.push(rejectedFn);
          break;
        // 当状态已经变为resolve/reject时,直接执行then回调
        case FULFILLED:
          fulfilledFn(this.value); // this._value是上一个then回调return的值(见完整版代码)
          break;
        case REJECTED:
          rejectedFn(this.reason);
          break;
      }
    });
  }

  catch(errorCallback) {
    this.then(null, errorCallback);
  }
}

const p1 = new Promise((resolve, reject) => {
  resolve(1);
});

p1.then((res) => {
  console.log(res);
  // return一个Promise
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(2);
    }, 1000);
  });
})
  .then((res) => {
    console.log(res);
    // return一个值
    return 3;
  })
  .then((res) => {
    console.log(res);
  });
```

### 4.实现 finally 函数

> finally()方法返回一个 Promise。在 promise 结束时，无论结果是 fulfilled 或者是 rejected，都会执行指定的回调函数。在 finally 之后，还可以继续 then。并且会将值原封不动的传递给后面的 then

注意：Promise.finally

```js
finally(callback) {
  return this.then(
    // finally()如果return了一个reject状态的Promise，将会改变当前Promise的状态，这个MyPromise.resolve就用于改变Promise状态
    (value) => MyPromise.resolve(callback()).then(() => value),
    (reason) =>
      MyPromise.resolve(callback()).then(() => {
        throw reason;
      })
  );
}

// 测试demo：
 var p = MyPromise.resolve('ok')
  .finally(() => {
    return MyPromise.reject('throw error from finally');
  })
  .then(
    (value) => {
      console.log('成功', value);
    },
    (err) => {
      console.log('失败', err);
    }
  )
  .catch((err) => {
    console.log('err', err);
  });
// 输出结果如下：
// 失败 Error: throw error from finally

```

### 5.实现 Promise.resolve()

> Promise.resolve(value)方法返回一个以给定值解析后的 Promise 对象。如果该值为 promise，返回这个 promise；如果这个值是 thenable（即带有"then" 方法)），返回的 promise 会“跟随”这个 thenable 的对象，采用它的最终状态；否则返回的 promise 将以此值完成。此函数将类 promise 对象的多层嵌套展平。

```js
static resolve(value) {
  if (value instanceof MyPromise) {
    return value;
  }
  return new MyPromise((_resolve) => _resolve(value));
}
```

### 6.实现 Promise.reject()

> Promise.reject()方法返回一个带有拒绝原因的 Promise 对象。

```js
static reject(err) {
  return new MyPromise((resolve, _reject) => _reject(err));
}
```

### 7.实现 Promise.all()

> Promise.all(iterable)方法返回一个 Promise 实例，此实例在 iterable 参数内所有的 promise 都“完成（resolved）”或参数中不包含 promise 时回调完成（resolve）；如果参数中 promise 有一个失败（rejected），此实例回调失败（reject），失败原因的是第一个失败 promise 的结果。

```js
  static all(promiseArr) {
    const result = [];
    let index = 0;
    return new MyPromise((resolve, reject) => {
      promiseArr.forEach((promise, i) => {
        MyPromise.resolve(promise).then(
          (value) => {
            index++;
            // 注意返回结果的顺序不一定就是promise数组的入参顺序，为保证出参顺序和入参顺序一一对应，需要通过下标赋值，而不是push
            result[i] = value;
            if (index === promiseArr.length) {
              resolve(result);
            }
          },
          (err) => {
            reject(err);
          }
        );
      });
    });
  }

  // 测试demo
  const p2 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
      resolve(2);
    }, 1000);
  });

  const p3 = new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve(3);
    }, 200);
  });

  const p4 = new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve(4);
    }, 500);
  });

  MyPromise.all([p2, p3, p4]).then((resList) => {
    console.log('resList', resList);
  });
  // 输出结果如下:
  // 2
  // 3
  // 4
```

### 8.实现 Promise.race()

> Promise.race(iterable)方法返回一个 promise，一旦迭代器中的某个 promise 解决或拒绝，返回的 promise 就会解决或拒绝。

```js
  static race(promiseArr) {
    return new MyPromise((resolve, reject) => {
      for (let p of promiseArr) {
        MyPromise.resolve(p).then(
          (value) => {
            resolve(value);
          },
          (err) => {
            reject(err);
          }
        );
      }
    });
  }

  // 测试demo
  const p2 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(2);
  }, 1000);
});

const p3 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(3);
  }, 200);
});

const p4 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(4);
  }, 500);
});

MyPromise.race([p2, p3, p4]).then((res) => {
  console.log('res', res);
});
// 输出结果如下：
// res 3
```

### 完整代码

```js
const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";
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
          const cb = this.onResolvedCallbacks.shift();
          cb(this.value);
        }
      }
    };

    const _reject = (reason) => {
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.reason = reason;
        while (this.onRejectedCallbacks.length) {
          const cb = this.onRejectedCallbacks.shift();
          cb(this.reason);
        }
      }
    };

    try {
      executor(_resolve, _reject);
    } catch (error) {
      _reject(error);
    }
  }

  then(onFulFilled, onRejected) {
    // 处理onFulFilled和onRejected未传值的情况
    onFulFilled =
      typeof onFulFilled === "function" ? onFulFilled : (value) => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw new Error(reason instanceof Error ? reason.message : reason);
          }; // 直接抛出错误，终止流程

    // 为保证链式调用，结果需返回一个promise函数
    return new MyPromise((resolve, reject) => {
      // 回调成功方法
      const fulfilledFn = (res) => {
        try {
          const beforeResolvedResult = onFulFilled(res); // 获取当前then方法中的返回值
          // 如果当前then方法中返回了一个Promise，则执行then方法，将函数加入到执行队列中
          // 如果返回的是一个值，则执行resolve方法，触发通知，将队列中的函数取出来执行
          beforeResolvedResult instanceof MyPromise
            ? beforeResolvedResult.then(resolve, reject)
            : resolve(res);
        } catch (error) {
          reject(error);
        }
      };

      // 回调失败方法，同理
      const rejectedFn = (err) => {
        try {
          const res = onRejected(err);
          res instanceof MyPromise ? res.then(resolve, reject) : resolve(res);
        } catch (error) {
          reject(error);
        }
      };

      switch (this.status) {
        // 当状态为pending时,把then回调push进resolve/reject执行队列,等待执行
        case PENDING:
          this.onResolvedCallbacks.push(fulfilledFn); // 加入函数执行队列
          this.onRejectedCallbacks.push(rejectedFn);
          break;
        // 当状态已经变为resolve/reject时,直接执行then回调
        case FULFILLED:
          fulfilledFn(this.value); // this.value是上一个then回调return的值
          break;
        case REJECTED:
          rejectedFn(this.reason);
          break;
      }
    });
  }

  catch(errorCallback) {
    this.then(null, errorCallback);
  }

  finally(callback) {
    return this.then(
      // finally()如果return了一个reject状态的Promise，将会改变当前Promise的状态，这个MyPromise.resolve就用于改变Promise状态
      (value) => MyPromise.resolve(callback()).then(() => value),
      (reason) =>
        MyPromise.resolve(callback()).then(() => {
          throw reason;
        })
    );
  }

  static resolve(value) {
    if (value instanceof MyPromise) {
      return value;
    }
    return new MyPromise((_resolve) => _resolve(value));
  }

  static reject(err) {
    return new MyPromise((resolve, _reject) => _reject(err));
  }
}
```

### 实现并发限制的 Promise.all()

由于在`new Promise()`时候，实际已经执行了异步任务。所以我们要实现并发控制，需要在函数内部去实现异步方法。

```js
/*
 * limit: 并发限制数量
 * array: 参数数组
 * iteratorFn: 回调方法
 */
async function asyncAll(limit, array, iteratorFn) {
  let executing = []; // 正在执行的promise任务
  let res = []; // promise任务

  for (let [index, value] of array.entries()) {
    let p = Promise.resolve(iteratorFn(value)); // 将方法转换为Promise
    res.push(p); // 保存promise任务
    executing.push(p); // 先将当前promise任务push到executing中。
    p.then(() => executing.splice(index, 1)); // 当promise任务执行完成后，从executing中删除该任务

    if (executing.length >= limit) {
      await Promise.race(executing); // 等待executing中任一任务执行完成，继续执行下一个循环。继续往executing添加任务
    }
  }
  return Promise.all(res);
}

const timeout = (i) => {
  console.log("开始", i);
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve(i);
      console.log("结束", i);
    }, i)
  );
};

(async () => {
  const res = await asyncAll(2, [1000, 5000, 3000, 2000], timeout);
  console.log(res);
})();
```

## 参考

[promise-polyfill](https://github.com/taylorhakes/promise-polyfill/blob/main/src/index.js)

[9k 字 | Promise/async/Generator 实现原理解析](https://juejin.cn/post/6844904096525189128#heading-14)

[面试官：“你能手写一个 Promise 吗”](https://zhuanlan.zhihu.com/p/183801144)

[Promise.all() 并发限制](https://liangchaofei.github.io/2020/02/19/promise-all-bing-fa-xian-zhi/)
