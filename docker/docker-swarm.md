# Docker Swarm

[Swarm 搭建 Docker 集群](https://blog.csdn.net/u011781521/article/details/80468985)

[docker swarm 学习](https://yeasy.gitbooks.io/docker_practice/swarm_mode/)

## 基本概念

### 1. 什么是 docker swarm

> `Docker Swarm` 和 `Docker Compose` 一样，都是 `Docker` 官方容器编排项目，但不同的是，`Docker Compose` 是一个在单个服务器或主机上创建多个容器的工具，而 `Docker Swarm` 则可以在多个服务器或主机上创建容器集群服务，对于微服务的部署，显然 `Docker Swarm` 会更加适合。

### 2. 节点(node)

[!service](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/swarm-diagram.png)

运行 `Docker` 的主机可以主动初始化一个 `Swarm` 集群或者加入一个已存在的 `Swarm` 集群，这样这个运行 `Docker` 的主机就成为一个 `Swarm` 集群的节点 `(node)` 。

- 管理节点（manager node）：管理节点用于 Swarm 集群的管理，`docker swarm` 命令基本只能在管理节点执行（节点退出集群命令 `docker swarm leave` 可以在工作节点执行）。一个 Swarm 集群可以有多个管理节点，但只有一个管理节点可以成为 leader，leader 通过 raft 协议实现。
- 工作节点（work node）：管理节点将服务 (service) 下发至工作节点执行。管理节点默认也作为工作节点。你也可以通过配置让服务只运行在管理节点

### 3. 服务(service)和任务(task)

[!service](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/services-diagram.png)

- 任务 （Task）是 Swarm 中的最小的调度单位，目前来说就是一个单一的容器。

- 服务 （Services） 是指一组任务的集合，服务定义了任务的属性。服务有两种模式：

`replicated services` 按照一定规则在各个工作节点上运行指定个数的任务

`global services` 每个工作节点上运行一个任务.

两种模式通过 `docker service create` 的 `--mode` 参数指定。

## 基本操作

### 1. 创建集群

[docker-machine 基础镜像下载过漫问题解决](https://segmentfault.com/a/1190000017001848)

```bash
# 创建节点
docker-machine create -d virtualbox manager
# 登录
docker-machine ssh manager
# 初始化swarm集群
docker swarm init --advertise-addr 192.168.99.100
# 查看集群
docker-machine ls
```

### 2. 部署服务

#### 2.1 新建服务

在创建的 Swarm 集群中运行一个名为 nginx 服务。

```bash
docker service create --replicas 3 -p 80:80 --name nginx nginx:1.13.7-alpine
```

#### 2.2 查看服务

查看当前 Swarm 集群运行的服务。

```
docker service ls
```

查看服务详情

```
docker service ps
```

查看某个服务的日志。

```
docker service nginx logs
```

#### 2.3 服务伸缩

当业务处于高峰期时，我们需要扩展服务运行的容器数量。

```
docker service scale nginx=5
```

当业务平稳时，我们需要减少服务运行的容器数量。

```
docker service scale nginx=2
```

#### 2.4 删除服务

```
docker service rm nginx
```

### 3. 配置文件 && 服务相关

`docker-compose.yml`一次启动多个服务，以`wordPress`为例

```bash
version: "3"

services:
  wordpress:
    image: wordpress
    ports:
      - 80:80
    networks:
      - overlay
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: wordpress
    deploy:
      mode: replicated
      replicas: 3

  db:
    image: mysql
    networks:
       - overlay
    volumes:
      - db-data:/var/lib/mysql
    environment:
      MYSQL_ROOT_PASSWORD: somewordpress
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: wordpress
    deploy:
      placement:
        constraints: [node.role == manager]

  visualizer:
    image: dockersamples/visualizer:stable
    ports:
      - "8080:8080"
    stop_grace_period: 1m30s
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock"
    deploy:
      placement:
        constraints: [node.role == manager]

volumes:
  db-data:
networks:
  overlay:
```

部署服务使用`docker stack deploy`，其中`-c`参数指定 compose 文件名。

```bash
docker stack deploy -c docker-compose.yml wordpress
```

查看服务

```
docker stack ls
``
移出服务
```

docker stack down wordpress

```

```
