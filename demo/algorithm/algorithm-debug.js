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
      typeof onFulFilled === 'function' ? onFulFilled : (value) => value;
    onRejected =
      typeof onRejected === 'function'
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
}

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
