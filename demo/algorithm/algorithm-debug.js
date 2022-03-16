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
      typeof onFulFilled === 'function' ? onFulFilled : (value) => value;
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : (err) => {
            throw err;
          }; // 直接抛出错误，终止流程
    if (this.status === FULFILLED) {
      onFulFilled(this.value);
    }
    if (this.status === REJECTED) {
      onRejected(this.reason);
    }
    if (this.status === PENDING) {
      // 为保证链式调用，结果需返回一个promise函数
      return new MyPromise((resolve, reject) => {
        // 回调成功方法
        const fulfillFn = (res) => {
          const beforeResolvedResult = onFulFilled(res); // 获取当前then方法中的返回值
          // 如果当前then方法中返回了一个Promise，则执行then方法，将函数加入到执行队列中
          // 如果返回的是一个值，则执行resolve方法，触发通知，将队列中的函数取出来执行
          beforeResolvedResult instanceof MyPromise
            ? beforeResolvedResult.then(resolve, reject)
            : resolve(res);
        };
        this.onResolvedCallbacks.push(fulfillFn); // 加入函数执行队列

        // 回调失败方法，同理
        const rejectFn = (err) => {
          const res = onRejected(err);
          res instanceof MyPromise ? res.then(resolve, reject) : reject(res);
        };
        this.onRejectedCallbacks.push(rejectFn);
      });
    }
  }

  catch(fn) {
    this.then(undefined, fn);
  }
}

const p1 = new Promise((resolve, reject) => {
  resolve(1);
});

p1.then((res) => {
  console.log(res);
  throw new Error('error test');
  // return一个Promise
  // return new Promise((resolve, reject) => {
  //   setTimeout(() => {
  //     resolve(2);
  //   }, 1000);
  // });
})
  .then((res) => {
    console.log(res);
    // return一个值
    return 3;
  })
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log('this is err', err);
  });
