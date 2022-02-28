# 实现函数柯里化curry

> 柯里化：将使用多个参数的一个函数 转换成 一系列使用一个参数的函数的实现方法

核心逻辑：**用闭包把传入参数保存起来，当传入参数的数量足够执行函数时，就开始执行函数**

```js
const _curry = (fn) => {
  return (judge = (...args) => {
    // 补充：args.length和fn.length均表示函数的所有形参个数，而arguments表示函数的所有实参
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
