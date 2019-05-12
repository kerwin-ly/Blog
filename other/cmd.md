
## 常用命令

### npm
#### 1.查看npm全局安装的包
```
npm list -g --depth 0
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