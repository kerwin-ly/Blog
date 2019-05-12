
## 常用命令

### node
#### 1.查看npm全局安装的包
```bash
npm list -g --depth 0
```

#### 2.控制多个node版本
>参考连接：[如何利用n轻松切换nodejs的版本](https://newsn.net/say/node-n.html)

1.查看当前版本
```bash
node -v
```
2.清除node.js的cache
```bash
sudo npm cache clean -f
```
3.安装`n`工具，用来管理`node.js`版本的
```bash
sudo npm install -g n
```
4.安装最新版本的node.js
```bash
# 最新稳定版本
sudo n stable

# 指定版本v8.15.0
sudo n 8.15.0
```
5.选择node版本,通过上下键选择，enter确定
```
sudo n
```
6.查看本机的node.js版本
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

### redis
#### 1.启动redis服务
```bash
# 启动默认配置，/usr/local/etc/redis.conf
redis-server
```

#### 2.关闭redis服务
```bash
redis-cli
shutdown save | nosave
```