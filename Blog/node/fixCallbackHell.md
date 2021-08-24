## 解决 node 回调地狱

### async/await

```js
let fs = require("fs");
let path = require("path");

function readFile(fileUrl) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, fileUrl), (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data.toString());
      }
    });
  });
}

async function readManyFiles() {
  try {
    let demo1 = await readFile("./txt/demo1.txt"); // 等待函数调用完再继续执行
    let demo2 = await readFile("./txt/demo2.txt");
  } catch (e) {
    console.log(e);
  }

  console.log(demo1 + demo2);
}

readManyFiles();
```

### Generator

> generator 是 es6 中的一个新的语法。在 function 关键字后添加\*即可将函数变为 generator
> 执行`generator`将会返回一个遍历器对象，用于遍历`generator`内部的状态。
> 通过方法内部`yield`方法来暂停操作，再根据方法外的`next`方法进行下一步,来控制整个流程

```js
// 我们的主任务——显示关键字
// 使用yield暂时中断下方代码执行
// yield后面为promise对象
const showKeyword = function*(filepath) {
  console.log("开始读取");
  let keyword = yield readFile(filepath);
  console.log(`关键字为${filepath}`);
};

// generator的流程控制
let gen = showKeyword();
let res = gen.next();
res.value.then(res => gen.next(res));
```

优化：引入`co`库来自动控制流程

```js
const co = reuqire('co');

const task = function* (filepath) {
  let keyword = yield readFile(filepath);
  let count = yield queryDB(keyword);
  let data = yield getData(res.length);
  console.log(data);
});

co(task, './sample.txt');
```

### Promise

> 在方法中通过 return 一个 Promise 对象，同时利用 Promise 的链式操作进行处理

```js
function queryDB() {
  return new Promise((resolve, reject) => {
    ...
  })
}

function getData() {
  return new Promise((resolve, reject) => {
    ...
  })
}

readFile('./sample.txt')
  .then(content => {
    let keyword = content.substring(0, 5);
    return queryDB(keyword); // 这里返回的promise如何成功，会被下面的.then调用到
  })
  .then(res => {
    return getData(res.length);
  })
  .then(data => {
    console.log(data);
  })
  .catch(err => {
    console.warn(err);
  });
```

### 对js流（stream）的理解
需求：对一个大文件进行读取

普通方法
```js
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer(function (req, res) {
    const fileName = path.resolve(__dirname, 'data.txt');
    fs.readFile(fileName, function (err, data) {
        res.end(data);
    });
});
server.listen(8000);

```
这样做，有一个很大的弊端，一旦并发量上来后，服务端内存开销很大。同时一个常见的例子，在我们看视频的时候，也不是直接加载好视频全部直接返回给用户的。
而是通过`流`的方式，边读边返回。将读文件的方法修改为`流`的方式实现
```js
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer(function (req, res) {
    const fileName = path.resolve(__dirname, 'data.txt');
    let stream = fs.createReadStream(fileName);  // 这一行有改动
    stream.pipe(res); // 这一行有改动
});
server.listen(8000);
```