# Vue2 使用Docker Volume挂载JSON文件不生效

### 问题描述

使用Docker挂载`config.json`到vue项目中时，发现容器中的`config.json`成功替换了。但代码中一直读取的是项目本地的配置内容，并不是宿主机的。

（错误）引入方式如下：
```js
// demo.vue
import config from '/config.json'; // config.json位于public文件夹下

console.log(config);
```

### 原因
经排查后，发现项目中如果使用`import`导入的配置文件，Webpack 会将其视为模块进行打包处理。这意味着 **JSON 文件的内容会被直接嵌入到最终的 JavaScript 文件**中，而不会作为一个独立的文件保存在输出目录中。这就导致了在挂载该文件时，即使Docker Container中的配置文件已经是最新的了。代码仍不会对其进行再次读取。

### 解决

使用 HTTP 请求本地JSON文件，在运行时动态加载。而不是用import直接引入。如下：

在项目根目录**public**文件夹下创建`config.json`

```
/public
  config.json
```

然后在`main.js`中请求`config.json`文件

```js
// main.js
async function loadAppConfig() {
  const config = await axios.get('/config.json');
  Vue.prototype.$appConfig = config; // 挂载到Vue上
}

loadAppConfig();
```

vue文件中使用：
```js
// Demo.vue
export default {
  mounted() {
    console.log(this.$appConfig);
  }
}
```

最后将宿主机的`config.json`替换项目中的`config.json`文件

```shell
docker run --net host -d -v dist:/usr/share/nginx/html -v config.json:/usr/share/nginx/html/config.json -v nginx_default.conf:/etc/nginx/conf.d/default.conf --name=frontend nginx:latest
```

容器启动后，也可以执行以下命令确认是否成功挂载

```shell
docker exec -it frontend bash

cat /usr/share/nginx/html/config.json # 路径取决于运行容器时设置的路径地址
```