# 部署踩坑

1.在新服务器上安装docker后，拉取镜像失败。报错：`Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?`

```
# 执行以下命令解决
systemctl daemon-reload # 不关闭 unit 的情况下，重新载入配置文件，让设置生效。
sudo service docker restart # 重启docker服务
sudo service docker status
docker pull xxx
```