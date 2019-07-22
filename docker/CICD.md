# gitlab的持续集成
>参考链接：[gitlab-ci + docker配置](https://docs.gitlab.com/ee/ci/variables/)
[基于Gitlab-CI/CD Docker 持续集成 node 项目](https://juejin.im/post/5c49d9c6e51d45522e62dbec)

## 介绍
>CI/CD(Continus Integration/Continues Delivery)持续集成
`GitLab`提供了一种通过`Docker`和`Shared Runners`处理`CI/CD Pipeline`的简单方法。每次运行`Pipeline`时，`GitLab`都会创建一个独立的虚拟机并构建一个`Docker`镜像。Pipeline可以使用`YAML`配置文件进行配置。

## 目的
* 代码提交gitlab，自动触发构建
* gitlab发起Merge Request, 进行自动化测试（至少是单元测试），通过后才可以merge，实现代码review和质量管控
* gitlab开发分支merge后自动发布到test环境
* gitlab master分支merge后自动发布到prod环境

## 启动GitLab runner服务
[基于Gitlab-CI/CD Docker 持续集成 node 项目](https://juejin.im/post/5c49d9c6e51d45522e62dbec)

## 配置
项目中新建`.gitlab.ci.yml`文件（[gitlab-ci.yml配置参数参照](https://segmentfault.com/a/1190000010442764) ），构建阶段为`build -> test -> deply`
```bash
stages:
  - build
  - test
  - deploy

variables:
  # 内置环境变量 https://docs.gitlab.com/ee/ci/variables/
  # $DOCKER_USERNAME $DOCKER_PWD 在settings CI/CD中的Secret variables配置，如果是protected表示保护分支有效
  DEV_TAG: dev_$CI_COMMIT_SHA
  PROD_TAG: prod_$CI_COMMIT_SHA
  REPO: dockerhub.datagrand.com/datagrand/jianxin-client

before_script:
  - docker login -u $DOCKER_USERNAME -p $DOCKER_PWD http://dockerhub.datagrand.com
  - echo 'commit id full:' $CI_COMMIT_SHA
  - echo 'commit user:' $GITLAB_USER_NAME

# develop
build:
  stage: build
  script:
    - sh build/build.sh $REPO $DEV_TAG
  allow_failure: false

# test
test:
  stage: test
  script:
    - sh build/test.sh $REPO:$DEV_TAG
  allow_failure: false
  dependencies:
    - build

# production
deploy:
  stage: deploy
  when: manual
  only:
    - master
  script:
    - sh build/deploy.sh $REPO:$PROD_TAG
  allow_failure: false
  dependencies:
    - test
```

build.sh
```bash
#!/bin/bash

echo '开发环境打包 >>>' $1:$2

# 构建镜像
docker build -t $1:$2 -f build/Dockerfile .

# 推送镜像
docker push $1:$2
```

deploy.sh
```bash
echo '开始发布到生产环境 >>>' $1
docker pull $1
```

Dockerfile
```docker
FROM dockerhub.datagrand.com/datagrand/node:8.12-alpine as builder

WORKDIR /app
ADD package.json /app/package.json
RUN npm install
ADD . /app
RUN npm run build

# +++++++++++++++++++++++++++++++++++++++++++++++++++
FROM nginx:stable
RUN mkdir -p web/logs

COPY --from=builder /app/dist/ /web/dist/
ADD build/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

```

nginx.conf
```
server {
    listen 80;
    server_name  localhost;
    root /web/dist/;
    index  index.html;
    location ~ .*\.(html)$ {
        add_header Cache-Control no-store;
        add_header Pragma no-cache;
    }
    access_log  /web/logs/access.log main;
    location ^~ /api/ {
        # proxy_pass http:xxxx;
        proxy_redirect     off;
        proxy_set_header   Host                 $host;
        proxy_set_header   X-Real-IP            $remote_addr;
        proxy_set_header   X-Forwarded-For      $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto    $scheme;
    }
    # 开启 gzip
    gzip on;
    gzip_min_length 1k;
    gzip_buffers 4 16k;
    gzip_comp_level 5;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript application/vnd.ms-fontobject application/x-font-ttf font/opentype image/svg+xml image/x-icon;
}

```

test.sh
```bash
echo '开始发布到测试环境 >>>' $1

docker pull $1
```