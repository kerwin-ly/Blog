## node笔记

>学习链接:[Koa2进阶学习笔记](https://chenshenhai.github.io/koa2-note/)

#### 1.node在vscode中调试
>参考连接：[Visual Studio Code之调试](https://segmentfault.com/a/1190000004136202)

#### 2.node调试方式
* 第一种：使用浏览器调试
1.启动脚本
```
node --inspect app.js
```
2.显示内容如下
```
Debugger listening on ws://127.0.0.1:9229/e6e6dfbe-52c8-41c8-8e28-451c241cef11
For help see https://nodejs.org/en/docs/inspector
```
3.输入网址`chrome://inspect`点击下面的`inspect`进入调试页面

* 第二种：使用vscode调试
1.使用vscode点击图标，![vscode-debug](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/vscode-debug.png)

2.debug配置，选择`launch`![vscode-debug](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/vscode-debug-setting.png)
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
      "runtimeArgs": [
          "--nolazy"
      ],
      "env": {
          "NODE_ENV": "development"
      },
      // "externalConsole": false,
      "sourceMaps": true, // 开启源码关联
      // "outDir": null
    }
  ]
}
```