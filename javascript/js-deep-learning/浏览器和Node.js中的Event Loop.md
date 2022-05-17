# 理解浏览器和 Node.js 中的 Event Loop

本文主要对 Node 环境和浏览器环境中的 Event Loop 进行剖析。

## 浏览器的 Event Loop

JS 的执行是单线程的，这防止了操作 DOM 的时，多个线程会导致结果不一致的情况。

但由于其是单线程模式，那么就会造成一些耗时的操作会阻塞其他代码的执行。所以，JS 提出了异步编程的解决方案。

将 JS 代码封装成一个个任务，针对一些异步任务，则交由其他线程（如：定时器线程（setTimeout/setInterval）、UI 渲染、HTTP 请求）执行。执行完成后如果有回调函数，则将其添加到任务队列中。主线程不断的从队头取任务执行即可。这就是事件轮询（Event Loop）。

当然，该机制也会存在一定的问题。比如：如果你编写了个计时器函数，期望延迟 2 秒立刻执行回调函数。但实际很可能 2 秒后还没有被执行。

因为在 Event Loop 中，**定时器线程会在 2 秒的时候将其加入到事件队列**中，而不是**执行**。它需要等前面的任务执行完之后才能被主线程取出来执行。而如果前面的任务很耗时，当然就会导致定时器的执行时间后延。所以，我们在开发过程中，尽量保证主线程中不要做过多耗时的逻辑处理。

虽然异步编程解决了任务阻塞的问题，但其没有**优先级**的概念。如果在执行过程中，我们需要"插队"执行某个任务是无法办到的。所以，JS 又提出了`微任务`和`宏任务`。

- 宏任务：setTimeout、setInterval、requestAnimationFrame、Ajax、fetch、script 标签的代码。

- 微任务：Promise.then()、MutationObserver、Object.observe。

执行机制如下：

1. 执行一个宏任务，如果遇到微任务就将它放到微任务的事件队列中

2. 当前宏任务执行完成后，会查看微任务的事件队列，然后将里面的所有微任务依次执行完。

3. 重复步骤 1-2

## Node 中的 Event Loop

浏览器的 Event Loop 只分了两层优先级，一层是宏任务，一层是微任务。但是宏任务之间没有再划分优先级，微任务之间也没有再划分优先级。

而 Node.js 任务宏任务之间也是有优先级的，比如定时器 Timer 的逻辑就比 IO 的逻辑优先级高，因为涉及到时间，越早越准确；而 close 资源的处理逻辑优先级就很低，因为不 close 最多多占点内存等资源，影响不大。

于是就把宏任务队列拆成了五个优先级：Timers、Pending、Poll、Check、Close。

解释一下这五种宏任务：

Timers Callback：涉及到时间，执行 setTimeout 和 setInterval 的回调。

Pending Callback：处理网络、IO 等异常时的回调，有的 linux 系统会等待发生错误的上报，所以得处理下。

Poll Callback：处理 IO 的 data，网络的 connection，服务器主要处理的就是这个。

Check Callback：执行 setImmediate 的回调，特点是刚执行完 IO 之后就能回调这个。

Close Callback：关闭资源的回调。

针对这 Timers 和 Check 阶段，有个比较有意思的问题。`setTimeout(fn, 0)`和`setImmediate(fn)`谁先执行？

```js
console.log("run");

setTimeout(() => {
  console.log("setTimeout");
}, 0);

setImmediate(() => {
  console.log("setImmediate");
});
```

多执行几次上述代码，你会发现输出结果中，有时会先执行 setTimeout，有时会先执行 setImmediate。

![node-timer](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/js/node-timer.png)

我们简单分析下原因。首先，在 node 环境中，并不会延迟 0ms 后执行 setTimeout 的回调函数。当参数是 0 时，会被强制修改成 1ms 执行。如：`setTimeout(fn , 1)`。（补充：HTML5 下，最低是 4ms）

> [node.js 官方文档](https://nodejs.org/api/timers.html#timers_settimeout_callback_delay_args)： When delay is larger than 2147483647 or less than 1, the delay will be set to 1. Non-integer delays are truncated to an integer.

上述代码执行过程如下：

1. 外层同步代码一次性全部执行完，遇到异步 API 就塞到对应的阶段

2. 遇到 setTimeout，虽然设置的是 0 毫秒触发，但是被 node.js 强制改为 1 毫秒，塞入 Times 阶段

3. 遇到 setImmediate 塞入 Check 阶段

4. 同步代码执行完毕，进入 Event Loop

5. 先进入 Times 阶段。**如果此时已经过了 1ms 了，那么 setTimeout 的回调函数将被执行。如果此时未超过 1ms，则跳过。**

6. 跳过空的阶段，进入 check 阶段，执行 setImmediate 回调

所以，导致这个问题的原因就是同步任务中的 JS 执行时间。这根据机器当前的状态会有不同的结果。

对于微任务，在 Node 环境中，添加了一个`process.nextTick` 的高优先级微任务，在所有的普通微任务之前来跑。

## 关于代码执行顺序的问题

在面试中，说到Event Loop，我们经常会被问到关于代码执行顺序的问题。下面拿一道题进行梳理。
```js
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}
async function async2() {
  console.log("async2");
}
console.log("script start");
setTimeout(function () {
  console.log("settimeout");
});
async1();
new Promise(function (resolve) {
  console.log("promise1");
  resolve();
}).then(function () {
  console.log("promise2");
});
console.log("script end");
```

上述代码的输出结果为：

```
script start
async1 start
async2
promise1
script end
async1 end
promise2
settimeout
```

接着，我们来分析下：

1. 执行整段代码，遇到 console.log('script start') 直接打印结果，输出 script start

2. 遇到定时器了，它是宏任务，先放着不执行

3. 遇到 async1()，执行 async1 函数，先打印 async1 start，下面遇到await怎么办？先执行 async2，打印 async2，然后阻塞下面代码（即加入微任务列表），跳出去执行同步代码

4. 跳到 new Promise 这里，直接执行，打印 promise1，下面遇到 .then()，它是微任务，放到微任务列表等待执行

5. 最后一行直接打印 script end，现在同步代码执行完了，开始执行微任务，即 await 下面的代码，打印 async1 end

6. 继续执行下一个微任务，即执行 then 的回调，打印 promise2

7. 上一个宏任务所有事都做完了，开始下一个宏任务，就是定时器，打印 settimeout

## 参考文章

[浏览器和 Node.js 的 EventLoop 为什么这么设计？](https://mp.weixin.qq.com/s/vHVu-ELdsfkytg0cTxMkYw)

[setTimeout 和 setImmediate 到底谁先执行，本文让你彻底理解 Event Loop](https://segmentfault.com/a/1190000023315304)

[The Node.js Event Loop](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
