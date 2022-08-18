# Docker Compose

[Docker 三剑客之 Docker Compose](https://www.cnblogs.com/xishuai/p/docker-compose.html)

> Docker Compose 负责实现对 Docker 容器集群的快速编排。通过一个配置文件来管理多个 Docker 容器，在配置文件中，所有的容器通过 services 来定义，然后使用 docker-compose 脚本来启动，停止和重启应用，和应用中的服务以及所有依赖服务的容器，非常适合组合使用多个容器进行开发的场景。一句话来说，**Docker Compose 可以通过一个 docker-compose.yml 文件来管理项目（项目由多个容器组成），而以前，我们必须通过编写脚本来完成这个操作**就是 Docker Compose 的两个重要概念

- **服务 (service)**：一个应用容器，实际上可以运行多个相同镜像的实例。
- **项目 (project)**：由一组关联的应用容器组成的一个完整业务单元。

### 1. 使用

- 1.`Dockerfile` 定义运用的环境
- 2.`docker-compose.yml` 定义组成应用的各服务
- 3.`docker-compose up` 启动整个应用

### 2. YAML 配置命令

- build 指定 Dockerfile 所在的目录地址，用于构建镜像，并使用此镜像创建容器，比如上面配置的 build: .
- command 容器的执行命令
- dns 自定义 dns 服务器
- expose 暴露端口配置，但不映射到宿主机，只被连接的服务访问
- extends 对 docker-compose.yml 的扩展，配置在服务中
- image 使用的镜像名称或镜像 ID
- links 链接到其它服务中的容器（一般桥接网络模式使用）
- net 设置容器的网络模式（四种：bridge, none, container:[name or id]和 host）
- ports 暴露端口信息，主机和容器的端口映射
- volumes 数据卷所挂载路径设置

`docker-compoes.yml` demo

```bash
version: '3'
services:
  web:
    build: .
    ports:
      - "5000:5000"
    volumes:
      - .:/code
    environment:
      FLASK_ENV: development
  redis:
    image: "redis:alpine"
```

### 3. 常用命令

#### 3.0 构建项目中的镜像

```bash
# --force-rm：删除构建过程中的临时容器；--no-cache：不使用缓存构建；--pull：获取最新版本的镜像
docker-compose build
```

#### 3.1 启动应用

```bash
# 启动应用
docker-compose up
# 后台启动应用
docker-compose up -d
```

#### 3.2 指定服务上运行一个命令

```bash
# -d 表示后台运行
docker-compose run ubuntu ls -d
```

#### 3.3 日志

```bash
# 查看所有容器日志
docker-compose logs

# 查看指定容器的日志
docker-compose logs [containerName]

# 查看日志的最新10条 --tail
docker-compose logs --tail 10 [service-name]

# 查看实时日志 -f
docker-compose logs -f --tail 10 [service-name]

# 日志带上时间戳 -t
docker-compose logs -f -t --tail 10 [service-name]
```

#### 3.4 项目中的所有容器

```bash
docker-compose ps
```

#### 3.5 暂停/恢复一个服务容器

```bash
# 暂停服务
docker-compose pause service_name
# 恢复服务
docker-compose unpause service_name
```

#### 3.6 项目启动相关

```bash
# 停止运行项目中的所有服务容器（也可以指定具体的服务）
docker-compose stop
# 重启项目中的所有服务容器（也可以指定具体的服务）
docker-compose restart
# 启动已经停止项目中的所有服务容器（也可以指定具体的服务）
docker-compose start
```

#### 3.7 删除

```bash
# 删除项目中的所有服务容器（也可以指定具体的服务），-f：强制删除（包含运行的）
docker-compose rm
#	强制停止项目中的所有服务容器（也可以指定具体的服务）
docker-compose kill
```
