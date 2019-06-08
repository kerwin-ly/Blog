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

## 基本原理

### 1. docker 三大要素

- 镜像：UnionFS(联合文件系统)是一种分层，清亮级的`文件系统`，它也是 Docker 镜像的基础。镜像可以通过分层来继承基础镜像，通过一层一层叠加，来形成应用镜像。Docker 镜像的最底层是`boottfs`，它包含 boot 加载器和内核。其上层是`rootfs`，包含的就是`linux`系统中的`/dev`, `/binx`等目录和文件
- 容器：镜像实例化生成，一个镜像可以生成一个或多个容器
- 仓库：装镜像的地方

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

# 只显示镜像id
docker images -q

# 拉取远程镜像
docker pull nginx

# 删除镜像
docker rmi -f imageName/imageId
docker image rm -f imageName/imageId
```

### 2. 操作容器

#### 2.1 启动交互式容器

- -i 以交互模式运行容器
- -t 为容器重新分配一个伪输入终端，通常与-i 一起使用
- --name 新容器的别名
- --no-trunc 不截断输出

```bash
docker run -it dockerName --newName
```

#### 2.2 启动守护式容器

启动完成后，容器将自动退出

```bash
docker run -d dockerName
```

#### 2.3 列出所有启动的容器

- -a 当前运行的容器 + 历史运行的容器
- -q 只显示容器编号

```bash
docker ps

# 前3次运行的进程
docker ps -n 3
```

#### 2.4 退出容器

- 第一种：exit 退出，容器停止并退出
- 第二种：ctrl + P + Q 容器不停止，只是退出（后台运行）

```bash
  # 重新进入，进入成功后，再执行操作方法
  docker attack dockerID
  ls -l tmp/
  # 进入并执行
  docker exec -t dockerID ls -l tmp/
```

- 第三种：`docker stop id`
- 第四种：`docker kill id`，强制退出

#### 2.5 删除容器

```bash
docker rm -f dockerName/dockerId

# 删除多个容器,$(筛选出来的docker容器)
docker rm -f $(docker ps -a -q)
# 删除多个容器（将|管道符前面的结果赋值给xargs，然后执行删除）
docker ps -a -q | xargs docker rm
```

#### 2.6 查看容器日志

```bash
# -t 加入时间；-f 持续完后添加；--tail 限制条数；
docker log -t -f --tail 限制条数 dockerID
```
