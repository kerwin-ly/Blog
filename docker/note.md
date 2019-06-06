# Docker

> 学习链接：[阮一峰 Docker 入门教程](http://www.ruanyifeng.com/blog/2018/02/docker-tutorial.html) > [Docker 快速上手学习入门教程](https://segmentfault.com/a/1190000016307534) > [Docker 三剑客之 Docker Compose](https://www.cnblogs.com/xishuai/p/docker-compose.html) > [Docker 三剑客之 Docker Swarm](https://www.cnblogs.com/xishuai/p/docker-swarm.html)

## 安装及配置

### 安装 docker

通过`homebrew`进行安装，安装完成后双击`.dmg`进行正常安装

```bash
brew cask install docker
```

安装成功后可以查看版本

```bash
docker info

docker --version

docker-compose --version

docker-machine --version
```

尝试自己跑一个 nginx 服务

```bash
docker run -d -p 80:80 --name webserver nginx
```

停止并删除 nginx 服务

```bash
docker stop webserver
docker rm webserver
```

### 国内镜像配置

> 对于使用 macOS 的用户，在任务栏点击 Docker Desktop 应用图标 -> Perferences... -> Daemon -> Registry mirrors。在列表中填写加速器地址 https://dockerhub.azk8s.cn。修改完成之后，点击 Apply & Restart 按钮，Docker 就会重启并应用配置的镜像地址了。

运行`docker info`，看到 docker 信息

```bash
...
Registry Mirrors:
https://dockerhub.azk8s.cn/
```

## 常用命令

### 1. 命令查询

```bash
docker --help
```

### 1. 操作镜像

```bash
# 查看本地镜像
docker images

# 本地全部镜像
docker images -a

# 拉取远程镜像
docker pull nginx

# 删除镜像
docker rmi -f name
```

### 2. 操作容器
