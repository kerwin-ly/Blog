# 柯里化

> 把接受多个参数的函数变换成接受一个单一参数（最初函数的第一个参数）的函数，并且返回接受余下的参数而且返回结果的新函数

## 作用

### 1.参数复用

举例：添加一个`getAddress`方法，用于获取对应的 github 仓库地址

```js
// 普通版
function getAddress(host, repo, project) {
  return `${host}/${repo}/${project}`;
}

const cliPath = getAddress('https://github.com', 'angular', 'cli');
const zorroPath = getAddress('https://github.com', 'angular', 'zorro');
```

在上述的调用`getAddress`方法时，可以发现我们的前两个参数是一摸一样的。那么，我们可以考虑用`柯里化`方式来简化，让其能复用

```js
import _ from 'lodash';

function getAddress(host, repo, project) {
  return `${host}/${repo}/${project}`;
}

const curryFn = _.curry(getAddress);
const repoPath = curryFn('https://github.com', 'angular');
const cliPath = repoPath('cli');
const zorroPath = repoPath('zorro');
```

### 2.延迟计算

```js
const add = function (a, b) {
  return a + b;
};

const curried = _.curry(add);
const plusOne = curried(1);
```

## 实现

用闭包把传入参数保存起来，当柯里化后的函数收到足够的参数时，执行原函数。而当接收的参数不足时，则继续返回一个新的函数，用于接收余下的参数。

```js
function curry(func) {
  return function curried(...args) {
    if (args.length >= func.length) {
      return func.apply(this, args); // func.length获取该方法的形参个数
    } else {
      return function (...args2) {
        return curried.apply(this, args.concat(args2));
      };
    }
  };
}
```


更简洁易懂的实现：

`args.length`和`fn.length`均表示函数的所有形参个数，而`arguments.length`表示函数的所有实参的个数
```js
const _curry = (fn) => {
  return (judge = (...args) => {
    return args.length >= fn.length // 判断闭包函数中保存的形参总长度是否大于等于逻辑函数需要的形参个数（逻辑函数：如下面demo中的add方法）
      ? fn(...args) // 满足条件直接执行
      : (...newArgs) => judge(...args, ...newArgs); //  不满足条件，则将当前的参数和新的参数合并，继续执行judge方法
  });
};
// 测试demo
function add(a, b, c) {
  return a + b + c;
}
const curried = _curry(add);
console.log(curried(2, 3, 4)); // 9
console.log(curried(2, 3)(4)); // 9
```