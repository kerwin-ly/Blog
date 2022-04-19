# 使用setTimeout实现setInterval

首先我们要弄清楚`setInterval`的执行机制：**每间隔一定时间，将事件推入到任务队列中，而不是马上执行。**

如果队列中还有其他耗时较长的任务在前面等待，该事件则必须等待，所以，这个间隔时间不是准确的（setTimeout同样有这个问题）。

实现代码如下：
```js
function _setInterval(cb, time) {
  let timer = null;
  const interval = () => {
    // timer在node环境中是一个Timeout对象，在浏览器中返回的是一个number类型的id
    timer = setTimeout(() => {
      cb();
      interval();
    }, time);
  };
  interval();
  return () => clearTimeout(timer);
}
const clearInterval = _setInterval(() => {
  console.log(1);
}, 1000);

setTimeout(() => {
  clearInterval(); // 5秒后清除计时器，打印4个1，不是5个。因为每隔1秒推送一个计时器任务到队列中，不是马上执行。中间可能还有些网络，I/O等时间消耗。
}, 5000);
```