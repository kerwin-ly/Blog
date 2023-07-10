## node 笔记

> 学习链接:[Koa2 进阶学习笔记](https://chenshenhai.github.io/koa2-note/)

#### 1.node 在 vscode 中调试

> 参考连接：[Visual Studio Code 之调试](https://segmentfault.com/a/1190000004136202)

#### 2.node 调试方式

- 第一种：使用浏览器调试 1.启动脚本

```
node --inspect app.js
```

2.显示内容如下

```
Debugger listening on ws://127.0.0.1:9229/e6e6dfbe-52c8-41c8-8e28-451c241cef11
For help see https://nodejs.org/en/docs/inspector
```

3.输入网址`chrome://inspect`点击下面的`inspect`进入调试页面

- 第二种：使用 vscode 调试 1.使用 vscode 点击图标，![vscode-debug](https://raw.githubusercontent.com/kerwin-ly/Blog/main/assets/imgs/vscode-debug.png)

  2.debug 配置，选择`launch`![vscode-debug](https://raw.githubusercontent.com/kerwin-ly/Blog/main/assets/imgs/vscode-debug-setting.png)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch",
      "type": "node",
      "request": "launch",
      "program": "${workspaceRoot}/node-forum/bin/www",
      "stopOnEntry": false,
      "args": [],
      "cwd": "${workspaceRoot}",
      "preLaunchTask": null,
      "runtimeExecutable": null,
      "runtimeArgs": ["--nolazy"],
      "env": {
        "NODE_ENV": "development"
      },
      // "externalConsole": false,
      "sourceMaps": true // 开启源码关联
      // "outDir": null
    }
  ]
}
```

#### 3.node 中 session 和 redis 的应用(基于 koa2)

[Cookie 和 Session 的区别，Koa2+Mysql+Redis 实现登录逻辑](https://segmentfault.com/a/1190000018398276)
[Node.js 中使用 redis 数据库的正确姿势](http://www.offbye.com/2016/09/06/%E5%9C%A8koa-js%E4%B8%AD%E4%BD%BF%E7%94%A8%E5%BC%82%E6%AD%A5%E6%96%B9%E5%BC%8F%E6%93%8D%E4%BD%9Credis%E6%95%B0%E6%8D%AE%E5%BA%93/)

#### 4.控制多个 node 版本

> 参考连接：[如何利用 n 轻松切换 nodejs 的版本](https://newsn.net/say/node-n.html)

1.查看当前版本

```bash
node -v
```

2.清除 node.js 的 cache

```bash
sudo npm cache clean -f
```

3.安装`n`工具，用来管理`node.js`版本的

```bash
sudo npm install -g n
```

4.安装最新版本的 node.js

```bash
# 最新稳定版本
sudo n stable

# 指定版本v8.15.0
sudo n 8.15.0
```

5.选择 node 版本,通过上下键选择，enter 确定

```
sudo n
```

6.查看本机的 node.js 版本

```bash
node -v
```

**注意**：如果最后的`node -v`没有效果，注意`bash_profile`配置

```bash
# 打开bash_profile，将node路径重新指引
open ~/.bash_profile

# 更改前
export PATH=/usr/local/opt/node@8/bin:$PATH

# 更改后
export NODE_HOME=/usr/local
export PATH=$NODE_HOME/bin:$PATH
export NODE_PATH=$NODE_HOME/lib/node_modules:$PATH

# 生效配置
source ~/.bash_profile
```
