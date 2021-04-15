# 在centos上裸机搭建swarm集群
>在这里我们使用了3台云服务器，分别是`aliyun1` `aliyun2` `aliyun3`

## 搭建docker环境
登录各服务器后，在mac上可以按住`command + shift + i`来同步多个终端，仅在一个终端上输入命令，其他终端也会同步输入，方便我们在多台机器上同时安装环境。

![deploy1](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/deploy1.png)

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
```
yum -y install docker-ce-18.03.1.ce
```

设置开机自启动
```
systemctl start docker
systemctl enable docker

```

## 搭建swarm集群

### 初始化集群

获取本机内网地址
```
ip addr
```

![deploy2](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/deploy2.png)

初始化swarm，详细参数可以通过`docker swarm --help` `docker swarm init --help`来获取
```
# 后面的ip地址是我们其中一台机器的内网ip
docker swarm init --advertise-addr 172.30.202.178
```

![deploy3](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/deploy3.png)

### 添加worker节点

初始化swarm成功后，在aliyun2机器上向目标集群添加`worker`节点
```
# aliyun2机器执行
docker swarm join --token SWMTKN-1-0535x5fkd2dmr0gx3gmchqnko6uhmtvopjxafz99caca93sq78-1necjkk0s59hgfzi5b7j0zoxk 172.30.202.178:2377
```

![deploy4](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/deploy4.png)

### 添加manager节点

首先在aliyun1机器上创建一个manger令牌
```
# aliyun1终端
docker swarm join-token manager
```
![deploy6](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/deploy6.png)

获取了token后，在aliyun3机器上添加`manager`节点
```
# aliyun3终端
docker swarm join --token SWMTKN-1-0535x5fkd2dmr0gx3gmchqnko6uhmtvopjxafz99caca93sq78-bbgv1k29j4ms1dqkzr25xotas 172.30.202.178:2377
```

最后在aliyun1机器上查看节点信息
```shell
docker node ls
```
结果如下：
```
ID                            HOSTNAME            STATUS              AVAILABILITY        MANAGER STATUS      ENGINE VERSION
4th9bx8vqhn61j7fovl9hpr12     swarm-test          Down                Active                                  18.03.1-ce
juxpvsoono7dc7zidt9lcx0r2 *   swarm-test          Ready               Active              Leader              18.03.1-ce
uxti8h6b2va7o7xtp5q1rmjkz     swarm-test          Ready               Active              Reachable           18.03.1-ce
xr6dzxrtwgl5dia29utg99w56     swarm-test          Ready               Active                                  18.03.1-ce
```