# 实现 async/await 函数

async/await 实际上是对 Generator（生成器）的封装，是一个语法糖。所以，我们先来看下`Generator`的使用

> ES6 新引入了 Generator 函数，可以通过 yield 关键字，把函数的执行流挂起，通过 next()方法可以切换到下一个状态，为改变执行流程提供了可能，从而为异步编程提供解决方案。

> yield 关键字实际返回一个 IteratorResult 对象，它有两个属性，value 和 done。value 属性是对 yield 表达式求值的结果，而 done 是 false，表示生成器函数尚未完全完成。

```js
function* myGenerator() {
  yield '1';
  yield '2';
  return '3';
}

const gen = myGenerator(); // 获取迭代器
const item1 = gen.next();
console.log(item1); //  {value: "1", done: false}
const item2 = gen.next();
console.log(item2); // {value: "2", done: false}
const item3 = gen.next();
console.log(item3); // {value: "3", done: true}
```

> yield 关键字后面的表达式的值返回给生成器的调用者。它可以被认为是一个基于生成器的版本的 return 关键字。如果将参数传递给生成器的 next()方法，则该值将成为生成器当前 yield 操作返回的值。如下：

```js
function* myGenerator() {
  console.log(yield '1'); // test1
  console.log(yield '2'); // test2
  console.log(yield '3'); // test3
  console.log('end'); // end
}

// 获取迭代器
const gen = myGenerator();

gen.next();
gen.next('test1');
gen.next('test2');
gen.next('test3');
```

这种`*/yield`语法和我们要实现的`async/await`其实很类似。主要区别在于：

1. `async/await`当“状态”改变时，自动执行后面的逻辑。而`Generator`函数还需要调用`next()`方法

2. `async`函数返回值是 Promise 对象，而`Generator`返回的是生成器对象

3. `await`可以返回其`resolve/reject`的值

根据上述区别，我们来实现一个`async/await`：

## 1. 自动执行

第一步，我们需要先实现：`async/await`当“状态”改变时，自动执行后面的逻辑。无需用户在每次调用`next()`方法。

这里的实现其实也很简单，不让用户手动去调`next()`方法，那我在`_async`函数里面自己调就好啦。

上面，我们看到每次执行`gen.next()`其都会返回一个当前状态：`{value: "当前状态yield返回的值", done: true/false}`。其中，`done`就表示是否结束。我们可以直接递归调用`gen.next()`方法，然后通过`done`字段判断是否结束递归。即可实现`Generator`的自动执行了。代码如下：

```js
function* myGenerator() {
  yield Promise.resolve(1);
  yield Promise.resolve(2);
  yield Promise.resolve(3);
}

function _async(generator) {
  const gen = generator(); // 获取迭代器
  const _next = function (value) {
    const state = gen.next(value); // 获取当前状态
    // 如果当前状态为{done: true}，结束递归
    if (state.done) {
      return state.value;
    }
    state.value.then((res) => {
      console.log('res', res);
      _next(res); // 如果状态done为false，则继续执行递归操作
    });
  };
  _next(); // 第一次执行
}

_async(myGenerator); // 输出结果1，2，3
```

## 2. 返回 Promise 对象，支持 resolve/reject

返回 Promise 对象比较简单，在最外层返回一个 Promise 即可。如果返回的值正确，则`resolve(xx)`。如果有错误信息，则通过`Generator.prototype.throw()`抛出，然后在`myGenerator`的函数内部使用`try/catch`进行捕获即可。

代码如下：

```js
function* myGenerator() {
  try {
    console.log(yield 2); // 2
    console.log(yield Promise.reject('xxx is not defined'));
  } catch (error) {
    console.log('catch error', error); // catch error xxx is not defined
  }
}

function _async(generator) {
  return new Promise((resolve, reject) => {
    const gen = generator();
    const _next = function (value) {
      let state;
      // 防止报错，通过try/catch捕获并抛出
      try {
        state = gen.next(value); // 获取当前状态的值。如果value为空，则返回yield后面表达式的值
      } catch (error) {
        reject(error);
      }
      // done为true，表示代码执行到了最后一步。结束递归，并将当前状态的值抛出。
      if (state.done) {
        return resolve(state.value);
      }
      // 兼容yield返回非Promise的情况，直接将返回的值都转成Promise。如:yield 2
      Promise.resolve(state.value).then(
        (res) => {
          _next(res); // 继续执行下一个状态
        },
        (err) => {
          gen.throw(err); // 通过Generator.prototype.throw将错误抛出，外侧通过try/catch捕获
        }
      );
    };
    _next();
  });
}

_async(myGenerator);
```

## 3. 返回一个函数

通过`babel`编译出来的`async`代码如下：

```js
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
      args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'next', value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'throw', err);
      }
      _next(undefined);
    });
  };
}
```

我们可以看出，实现逻辑类似。但`async`应该返回的是一个新函数。所以我们这里也做下改造，同时修改对应的调用方式。

最终代码如下：

```js
function _async(fn) {
  // async实际返回的是一个新函数
  return function () {
    return new Promise((resolve, reject) => {
      const gen = fn.apply(this, arguments); // 修改调用方式，绑定this
      const _next = function (value) {
        let state;
        // 防止报错，通过try/catch捕获并抛出
        try {
          state = gen.next(value); // 获取当前状态的值。如果value为空，则返回yield后面表达式的值
        } catch (error) {
          reject(error);
          return;
        }
        // done为true，表示代码执行到了最后一步。结束递归，并将当前状态的值抛出。
        if (state.done) {
          return resolve(state.value);
        }
        // 兼容yield返回非Promise的情况，直接将返回的值都转成Promise。如:yield 2
        Promise.resolve(state.value).then(
          (res) => {
            _next(res); // 继续执行下一个状态
          },
          (err) => {
            gen.throw(err); // 通过Generator.prototype.throw将错误抛出，外侧通过try/catch捕获
          }
        );
      };
      _next(undefined);
    });
  };
}
```

使用方式

```js
const foo = _async(function* () {
  try {
    console.log(yield 2); // 2
    return 3;
  } catch (error) {
    console.log('catch error', error);
  }
});

foo().then((res) => {
  console.log(res); // 3
});
```

## 参考

[https://juejin.cn/post/6844904096525189128#heading-13](https://juejin.cn/post/6844904096525189128#heading-19)