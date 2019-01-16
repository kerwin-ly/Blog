
## 环境配置
#### 1.npm全局安装

设置目标路径（.npm文件夹如果不存在就新建）
```
npm config set prefix '~/.npm'
```

编辑.zshrc文件，加入环境变量
```
export PATH=~/.npm/bin:$PATH
```

使配置生效
```
source ~/.zshrc
```

