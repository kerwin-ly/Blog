# 记录一次基于Docker部署流程
>前段时间帮女朋友做了一个简单的库存系统。在这里记录下自己第一次部署一个前后端服务遇到的问题和解决方法。线上地址：http://42.192.224.202:10001/goods/list

技术栈：

前端：Angular10 + Typescript + Rxjs + NgZorro + Bixi

后端：Python3.7 + Flask + Sqlalchemy + Mysql8.0 + Gunicorn

部署：Docker-swarm

## 构建前端镜像
>前端代码仓库：https://github.com/kerwin-ly/wms_frontend

在前端仓库根目录下执行：
```shell
sh docker/build/local_build.sh # 输出镜像名：kerwinleeyi/wms_html:dev.20210501.225556
```

## 构建后端镜像
>后端代码仓库：https://github.com/kerwin-ly/wms_backend

后端项目根目录执行：
```shell
sh docker/build.sh # 输出镜像名：kerwinleeyi/wms_api:dev.20210507.111729
```


## 服务器部署
>部署代码仓库：https://github.com/kerwin-ly/wms_deploy
本次部署，我使用的是腾讯云的服务器，搭载的centos 7.8的系统

### 安装docker环境并设置开机自启动

安装yum-util 提供yum-config-manager功能
```shell
yum install -y yum-utils
```

设置yum源
```shell
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

查看docker可用版本
```shell
yum list docker-ce --showduplicates | sort -r
```

选择一个版本并安装：yum install docker-ce-版本号
```shell
yum -y install docker-ce-18.03.1.ce
```

设置开机自启动
```shell
systemctl start docker
systemctl enable docker
```

这里如果是单机的话，可以直接通过`docker-compose`启动服务。不过为了模拟公司的环境，我用的是`docker-swarm`进行启动的。关于`docker-swarm`的相关概念可以戳这里 [docker-swawrm基础](https://github.com/kerwin-ly/Blog/blob/master/docker/docker-swarm.md) [在centos上裸机搭建swarm集群](https://github.com/kerwin-ly/Blog/blob/master/docker/deploy.md)

目前只有一台机器，所以我们直接初始化docker-swarm集群
```
docker swarm init # docker swarm init --help查看详细参数
```

### 准备部署文件和相关脚本
这里主要说下`docker-compose.yml`文件几个注意点。其他细节可以在上述[部署代码仓库](https://github.com/kerwin-ly/wms_deploy)中查看.
```dockerfile
version: "3"
services:
  mysql:
    image: mysql:8.0.17
    # container_name: mysql
    environment:
      #- TZ=Asia/Shanghai
      MYSQL_DATABASE: 对应的数据库名称
      MYSQL_ROOT_PASSWORD: 对应的数据库密码
    volumes:
      - ./data/mysql/data:/var/lib/mysql # 挂载数据库数据
      - ./data/mysql/mysql.conf:/etc/mysql/my.cnf # 挂载配置文件
      - ./data/mysql/mysql-files:/var/lib/mysql-files
    ports:
      - 3306:3306
    restart: always
    #networks:
    #  - wms_test
  html:
    image: kerwinleeyi/wms_html:dev.20210501.225556
    # container_name: html
    ports:
      - "0.0.0.0:10001:80"
    depends_on:
      - api
    volumes:
      - ./data/html/nginx.conf:/etc/nginx/conf.d/default.conf
      - ./data/api/media:/web/dist/media
    #networks:
    #  - wms_test
  api:
    image: kerwinleeyi/wms_api:dev.20210507.111729
    # container_name: api
    environment:
      #- TZ=Asia/Shanghai
      MYSQL_HOST: wms_mysql
      MYSQL_PORT: 3306
    ports:
      - 5000:5000
    depends_on:
      - mysql
    volumes:
      - ./wait-for-it.sh:/wait-for-it.sh
      - ./data/api/sql.ini:/project/wms_api/config/sql.ini
      - ./data/api/media:/project/wms_api/media
      - ./data/api/logs:/project/wms_api/logs
      - ./start.sh:/project/wms_api/scripts/start.sh
      - ./data/api/migrations:/project/wms_api/migrations
    #entrypoint: sh /wait-for-it.sh mysql:3306 -- sh /project/wms_api/scripts/start.sh
    entrypoint: sh /wait-for-it.sh mysql:3306 -- sleep infinity
    #networks:
    #  - wms_test
#networks:
#  default:
#    external:
#      name: wms_test
```

### 部署服务踩坑记录

#### 1.mysql8.0中必须挂载文件`mysql-files`到容器中，否则报错如下

![deploy](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/wms-deploy1.png)

#### 2.mysql8.0启动容器报错`ERROR 2059: Authentication plugin ‘caching_sha2_password’ cannot be loaded`
启动mysql容器时候报错`ERROR 2059: Authentication plugin ‘caching_sha2_password’ cannot be loaded`。这是由于mysql8.0.3之后的版本引入了一个新的身份验证插件`caching_sha2_password`，从 MySQL-8.0.4开始，此插件成为MySQL服务器的新默认身份验证插件。但目前我设置的密码并不符合该规则，同时由于是个非商业项目，这里我简单的将该加密规则还原成了`mysql_native_password`。（两个加密规则的区别可以戳[这里](https://cloud.tencent.com/developer/article/1708030)）

/data/mysql/mysql.conf文件如下
```
[mysqld]
user=root
default-storage-engine=INNODB
character-set-server=utf8
default_authentication_plugin=mysql_native_password # 这里将其加密方式进行了修改，并将文件挂载到mysql容器/etc/mysql/my.cnf
[client]
default-character-set=utf8
[mysql]
default-character-set=utf8
```

### 3.mysql服务外网无法访问
部署服务后发现mysql服务启动成功了。但只能在内网环境ping通，使用外网一直无法访问。检查后，发现可能是腾讯云服务器防火墙问题，还有就是对外端口没有暴露出来。

首先检查防火墙状态
```shell
firewall-cmd --state // 输出running
```

关闭防火墙
```shell
systemctl stop firewalld.service
```

如果希望禁止firewall开机启动
```shell
systemctl disable firewalld.service
```

再次查看防火墙状态
```shell
firewall-cmd --state // 输出not running
```

接着打开腾讯云控制台/安全/安全组/入站规则，暴露对外端口。这里我主要设置了暴露了分别访问前端10001，后端10002，数据库3306的三个端口
![deploy](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/wms-deploy2.png)
![deploy](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/wms-deploy3.png)

针对出站规则，我设置的是ALL
![deploy](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/wms-deploy4.png)

### 4.服务启动顺序错误，导致数据库无法连接
在v1的版本中，我使用的是原生pymysql进行数据库连接。由于一启动api服务就开始尝试连接myql，导致一直报错`2003 - Can't connect to MySQL server on ……(61 "Connection refused")`

起初以为自己加了`depends_on`字段就可以控制服务的启动顺序了。但实际却不然。查阅了下[docker的官网](https://docs.docker.com/compose/compose-file/compose-file-v3/)看到了下面的这段描述

```
version: "3.9"
services:
  web:
    build: .
    depends_on:
      - db
      - redis
  redis:
    image: redis
  db:
    image: postgres
```

>There are several things to be aware of when using depends_on:
depends_on does not wait for db and redis to be “ready” before starting web - only until they have been started. If you need to wait for a service to be ready, see Controlling startup order for more on this problem and strategies for solving it.
The depends_on option is ignored when deploying a stack in swarm mode with a version 3 Compose file.

简单概括下就是`depends_on`只会控制各个服务**开始启动**的顺序，它不会等某个服务**启动完毕**后再启动另外一个任务。

如果希望同步的去启动服务，可以使用官方推荐的一个脚本[wait-for-it.sh](https://github.com/vishnubob/wait-for-it)来处理


```dockerfile
version: "3"
services:
  mysql:
    image: mysql:8.0.17
    ...
  html:
    image: kerwinleeyi/wms_html:dev.20210501.225556
    ...
  api:
    image: kerwinleeyi/wms_api:dev.20210507.111729
    ...
    # entrypoint: sh /project/wms_api/scripts/start.sh # 直接执行start.sh脚本启动后端服务
    entrypoint: sh /wait-for-it.sh mysql:3306 -- sh /project/wms_api/scripts/start.sh # 等待mysql服务启动成功后再执行start脚本
```

# 4. 后端代码无法连接数据库问题排查
通过第三步我确定了服务的启动顺序，保证了数据库mysql服务先启动，再启动后端api服务。mysql服务是起来了，但启动api服务依然报错，`xxx connection refused xxx`。仍然连接不上数据库。于是便怀疑是我连接数据库配置有问题。

sql.ini配置如下
```
[DEFAULT]
[database]
host=127.0.0.1
port=3306
user=数据库登录用户
pwd=数据库密码
dbname=数据库名称
charset=utf-8
pool_size=20
pool_timeout=15
pool_recycle=7200
```

于是我想着能否先让`api`容器启动，然后进入`api`容器试试能否`ping`通mysql服务。

如下，当我执行`start.sh`脚本时就会去连接数据库，所以这里我尝试添加sleep方法让一直睡眠。先保证容器正常
```dockerfile
version: "3"
services:
  mysql:
    image: mysql:8.0.17
    ...
  html:
    image: kerwinleeyi/wms_html:dev.20210501.225556
    ...
  api:
    image: kerwinleeyi/wms_api:dev.20210507.111729
    ...
    # entrypoint: sh /project/wms_api/scripts/start.sh # 直接执行start.sh脚本启动后端服务
    # entrypoint: sh /wait-for-it.sh mysql:3306 -- sh /project/wms_api/scripts/start.sh # 等待mysql服务启动成功后再执行start脚本
    entrypoint: sh /wait-for-it.sh mysql:3306 -- sleep infinity
```

修改完后执行`sh remove.sh`和`sh deploy.sh`重新部署，然后查看其service是否都启动成功。
![deploy](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/wms-deploy8.png)

可以看到各个服务都起来了。然后我们查看其已启动的容器
![deploy](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/wms-deploy7.png)

启动并进入api容器
![deploy](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/wms-deploy9.png)

直接ping mysql服务，发现是可以ping通的。于是我把这里的sql.ini的配置替换成了对应的mysql服务名
![deploy](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/wms-deploy10.png)

sql.ini
```
[DEFAULT]
[database]
...
host=wms_mysql
...
```

重新执行部署脚本后，服务便可以启动了。

# 5.防止数据库一段时间未进行操作，自动断开连接
第一天部署完成后发现所有前端请求都是502了，重启整个服务后又可以正确执行。

google了一下发现，得到的结果是**mysql数据库连接有个规则，就是当超过8个小时没有新的数据库请求的时候，数据库连接就会断开。如果我们连接池的配置是用不关闭或者关闭时间超过8小时，这个时候连接池没有回收并且还认为连接池与数据库之间的连接还存在，就会继续连接，但是数据库连接断开了，就会报错数据库连接失败。**修改数据库连接池的配置，数据库连接池都会带有一个参数：回收时间（就是一定时间内不使用就会回收），修改这个参数的值，不要大于wait_timeout的值即可。在flask-SQLAlchemy中有个配置是**SQLALCHEMY_POOL_RECYCLE**（多之后对线程池中的线程进行一次连接的回收），如果这个值是-1代表永不回收，Flask-SQLALchemy 自动设定这个值为2小时，我们可以将这个值设置的小于wait_timeout参数的值也就是8小时即可。

修改sql.ini文件
```
[DEFAULT]
[database]
...
pool_recycle=800
```
