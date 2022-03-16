const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';
class MyPromise {
  // promise实例的函数
  constructor(executor) {
    this.status = PENDING; // 当前状态
    this.value = null; // 成功回调的值
    this.reason = null; // 失败回调的值
    this.onResolvedCallbacks = []; // 存储成功的回调函数的队列
    this.onRejectedCallbacks = []; // 存储失败的回调函数的队列

    // 注意：这里的resolve和reject是在executor内部执行，需要用箭头函数，否则this指向当前作用域
    const _resolve = (value) => {
      // s1.状态由PENDING转换为FULFILLED后，不可再更改状态
      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value; // 更新成功回调的值
        while (this.onResolvedCallbacks.length) {
          const cb = this.onResolvedCallbacks.shift();
          cb(this.value);
        }
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
    // 如果then方法调用时，当前状态是pending，表示还没被成功回调，存在异步情况
    if (this.status === PENDING) {
      //  注意这里要将成功和失败回调都保存到数组中
      this.onResolvedCallbacks.push(onFulFilled);
      this.onRejectedCallbacks.push(onRejected);
    }
  }
}

// 测试demo
const p = new MyPromise((resolve, reject) => {
  console.log('立刻触发该函数 p1');
  setTimeout(() => {
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
