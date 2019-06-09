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

[!docker-flow]()

### 1. Docker 三大要素

- 镜像：UnionFS(联合文件系统)是一种分层，清亮级的`文件系统`，它也是 Docker 镜像的基础。镜像可以通过分层来继承基础镜像，通过一层一层叠加，来形成应用镜像。Docker 镜像的最底层是`boottfs`，它包含 boot 加载器和内核。其上层是`rootfs`，包含的就是`linux`系统中的`/dev`, `/binx`等目录和文件
- 容器：镜像实例化生成，一个镜像可以生成一个或多个容器
- 仓库：装镜像的地方

## docker 常用命令

### 1. 命令查询

```bash
docker --help
```

### 1. 操作镜像

````bash
# 查看本地镜像
docker images

# 本地全部镜像
docker images -a

# 只显示镜像id
docker images -q

# 拉取远程镜像
docker pull nginx

# 上传镜像到云端
# 参考链接：https://www.jianshu.com/p/72dda052c820?from=timeline&isappinstalled=0(上传到阿里云)
docker push 镜像id

# 删除镜像
docker rmi -f imageName/imageId
docker image rm -f imageName/imageId
# 条件删除，$()，括号中筛选得到的镜像全部干掉
docker image rm -f $(docker images -aq)

# 查看详情
docker inspect dockerId

### 2. 操作容器

#### 2.1 启动交互式容器

- -i 以交互模式运行容器
- -t 为容器重新分配一个伪输入终端，通常与-i 一起使用
- --name 新容器的别名
- --no-trunc 不截断输出
- -p docker 对外可访问端口:docker 内部服务端口
- -P 随机分配端口

```bash
docker run -it -p 8888:8080 dockerName --newName
````

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

#### 2.7 外部执行

```bash
docker exec 容器id 具体操作
```

#### 2.8 容器生成新的镜像

```bash
docker commit -a="user" -m="description" 容器id newDockerName
# demo
docker commit -a="kerwin" -m="remove docs" e7adb60bb62f liyi/nodocs
```

### 3. 容器卷(dockerFile)

镜像的描述文件，也可以说是镜像的构建文件

#### 3.1 容器和宿主机关联，完成数据持久化

```bash
# 如果容器关了，改了宿主机内容，当重新启动容器后会去同步容器数据
# ...:ro 只读
docker run -it -v /宿主机绝对路径目录:/容器内目录
```

#### 3.2 具有类似功能的保留字

CMD 和 ENTROYPOINT 的区别

```bash
# CMD: 当运行 run 后，配置的 cmd 参数会覆盖 dockerFile 里面的参数
CMD [ "curl", "-s", "http://ip.cn" ]

# ENTROYPOINT: 当运行 run 后，运行的参数会附加上 dockerFile 的参数执行
ENTRYPOINT [ "curl", "-s", "http://ip.cn" ]
```

ADD 和 COPY 的区别

```bash
#ADD: 复制添加并解压文件(.tar.gz)
ADD jdk-8uxxx.tar.gz /url/local/
#COPY: 复制文件
COPY a.txt /usr/local/
```

#### 3.3 使用 Dockerfile 创建镜像并运行

1.编写 dockerFile 生成镜像

[dockerFile 文件-ly/centos](https://github.com/kerwin-ly/Blog/blob/master/docker/centos)

```dockerfile
# 从哪个镜像继承
FROM centos
# 作者
MAINTAINER kerwin<kerwin.leeyi@gmail.com>
# ONBUILD-父镜像在被子镜像继承后，父镜像的onbuild被触发
# ONBUILD echo 'build image father'
# 声明变量
ENV mypath /tmp
# 运行容器后的初始位置
WORKDIR $mypath
# 安装需要的依赖
RUN yum -y install vim
# 生成两个容器卷
VOLUME ["/dataContainer1", "/dataContainer2"]
 # 打印
CMD echo "success finish"
# 暴露端口
EXPOSE 80
# 命令
CMD /bin/bash
# 字符串方式
# CMD [ "curl", "-s", "http:ip.cn" ]
```

2.运行 dockerfile 生成一个镜像

```bash
# 注意最后面的 '.'必须存在，保证其一层一层加载镜像
docker build -f 容器卷地址 -t 新镜像名字:version .

# demo
docker build -f ./dockerFile -t ly/centos .
```

3.运行镜像，生成容器

```bash
docker run -it ly/centos
```

#### 3.3 容器间的共享(--volumns-from)

注意：**容器之间配置信息的传递，数据卷的生命周期一直持续到没有容器使用它为止**

```bash
# doc2与doc1进行共享
docker run -it --name doc2 --volumns-from doc1 ly/centos
```

## Docker Compose

> Docker Compose 负责实现对 Docker 容器集群的快速编排。通过一个配置文件来管理多个 Docker 容器，在配置文件中，所有的容器通过 services 来定义，然后使用 docker-compose 脚本来启动，停止和重启应用，和应用中的服务以及所有依赖服务的容器，非常适合组合使用多个容器进行开发的场景。Docker Compose 的两个重要概念

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

```bash

```
