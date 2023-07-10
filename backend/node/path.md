# node中路径问题

>今天在做cli工具时候遇到了一个问题。我将模板文件存在了`cli`目录中，当用户输入完命令后，将从`cli`目录下载到用户当前目录。所以去探究了下node的路径问题。

* `__dirname`: 代码文件所在的目录
* `__filename`: 代码文件地址
* `process.cwd()`: 用户执行node命令所在的当前目录
* `path.resolve()`和`path.join()`的区别：https://juejin.im/post/6844903861920989198

接下来，我们可以直接拿项目来测试下

初始化一个项目，并添加`bin`字段用于全局安装包
```shell
mkdir test_path
cd test_path && npm init
```
![test1](https://raw.githubusercontent.com/kerwin-ly/Blog/main/assets/imgs/test-path1.png)
![test2](https://raw.githubusercontent.com/kerwin-ly/Blog/main/assets/imgs/test-path2.png)

接下来，在本地模拟全局安装npm包来进行测试
```shell
# 生成一个test_path-1.0.0.tgz文件
npm pack 
# 全局安装包
npm install -g test_path-1.0.0.tgz
# 根据指定的bin字段，输入命令测试
test_path
```

输出结果如下：
其中，我是在目录`/Users/xxx/Desktop/test_path`下执行的命令
```shell
__dirname： /usr/local/lib/node_modules/test_path/demo # 代码文件所在的目录
__filename： /usr/local/lib/node_modules/test_path/demo/test.js # 代码文件
process.cwd()： /Users/xxx/Desktop/test_path # 用户执行node命令时的当前目录
```
![test3](https://raw.githubusercontent.com/kerwin-ly/Blog/main/assets/imgs/test-path3.png)