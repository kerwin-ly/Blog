
## 环境配置
#### 1.安装mongodb

1.1 使用brew安装mongodb
```
sudo brew install mongodb
```

1.2 创建一个数据库存储目录 /data/db
```
sudo mkdir -p /data/db
```

1.3 启动 mongodb
```
sudo mongod

# 如果没有创建全局路径 PATH，需要进入以下目录
cd /usr/local/bin
sudo ./mongod
```
1.4 连接数据库
```
sudo mongo
```

#### 2. 常用命令

2.1 查看当前数据库
```
show dbs
```
2.2 查看当前操作的数据库
```
db
```
2.3 创建数据库
```
use xxx
```

