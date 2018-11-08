git

### 配置

#### 1.淘宝镜像

```
npm install -g cnpm --registry=https://registry.npm.taobao.org
cnpm install [name]
```

安装完成后，在开始菜单里找到“Git”->“Git Bash”，蹦出一个类似命令行窗口的东西，就说明Git安装成功！


---




#### 2.创建用户名个邮箱

```
git config --global user.name "Your Name"
git config --global user.email "email@example.com"
```


---

#### 3.创建版本库repository

```
git init
```

---

### 常用命令

#### 1.基本操作
```
git add demo.txt  保存修改文件到暂存区
git commit -m '提交说明'
git status  查看仓库的状态
git diff  查看修改内容
alt + f8  清除窗口
git log  查看历史记录 git log --pretty=oneline整理的
cat filename  查看文件内容

```

#### 2.版本回退
```
git log  查看当前版本库及其之前的所有commit
git reflog  查看从本地仓库创建之日起，本地所进行的与项目更改有关的操作！比如说commit，clone等操作。
git reset --hard id  回滚到某个commid版本下
git reset --hard Head^  回滚到上一个版本
```

#### 3.本地分支
```
git branch  查看分支，当前分支前面会标一个*号
git branch -a 查看所有分支，包括本地和远程的
git checkout -b branchName  创建并切换到新分支
git checkout branchName  切换分支
git branch -d branchName  删除某本地分支
git branch -D branchName  强制删除某本地分支
git merge branchName  合并某分支到当前分支
```

#### 4.远程分支

##### 1.基本操作：
```
git remote -v  查看远程库的信息
git pull origin master  拉取代码到本地
git push origin master  提交修改到远程库
```
##### 2.创建远程分支：
```
git branch -a (查看有几个分支)
git checkout -b 'aa'    创建并切换分支
git branch(查看当前正在哪个分支)
git push origin aa(将代码提交到该分支上)
git add .
git commit -m '创建分支'
git pull origin name(拉去分支最新信息)
git push origin name(提交分支信息)
git checkout master(切回主分支)
```
##### 3.删除远程分支
```
git push origin --delete <branchName>
```
##### 4.重新命名远程分支

```
git push origin --delete originBranch

git branch -m oldName newName

git push origin newName
```
##### 5.远程分支的合并
###### eg:将远程的chy分支合并到ly分支
###### 1.获取并检出此合并请求的分支
```
git fetch origin
git checkout -b chy origin/chy
```
###### 2.本地审查变更
###### 3.合并分支并修复出现的任何冲突

```
git fetch origin
git checkout -b chy origin/chy
```
###### 4.推送合并的结果到 GitLab

```
git fetch origin
git checkout -b chy origin/chy
```

###### 5.合并本地分支

```
合并分支时添加注释信息（只适用于non-fast-forward方式， 该方式会生成新的commit。 fast-forward不会生成新的commit ）

--no-ff -m" 本次合并添加的注释信息"

--no-ff ：非快速合并 non-fast-forward
```

###### 6. 远程分支合并
eg:合并child分支到parent分支
```
git fetch origin
git checkout -b child origin/child
```
```
本地检查代码，处理冲突
```
```
git checkout parent
git merge --no-ff child
```
```
git push origin parent
```


#### 5.bug分支
##### 1.功能未开发完，不能提交代码
首先，不要git add,commit。直接隐藏当前的修改
```
git stash
```

2.修改完成后，查看隐藏的列表
```
git stash list
```

3.如果需要恢复到之前的修改

```
git stash pop
```
##### 2.功能开发完成，需要提交自己代码
1.先将自己的代码提交到远程

```
git add .
git commit -m 'xx'
git pull
git push
```
2.根据标签，切换到某个commit下

```
git reset --hard <id>
```

3.修复bug....

4.提交修复结果

```
git add .
git commit -m 'xx'
git pull (这里一定要拉最新的代码)
git push 
```
参考链接：
[http://www.liaoxuefeng.com/wiki/0013739516305929606dd18361248578c67b8067c8c017b000/00137602359178794d966923e5c4134bc8bf98dfb03aea3000](http://www.liaoxuefeng.com/wiki/0013739516305929606dd18361248578c67b8067c8c017b000/00137602359178794d966923e5c4134bc8bf98dfb03aea3000)

#### 6.标签管理
##### 6.1基本操作
```
git tag v1.0  默认标签是打在最新提交的commit上的
git tag v0.9 6224937  在指定commit下打标签
git show v0.9  查看标签信息
git push origin tag <tagName>  提交标签到远程
git push origin --delete <tag tagName>  删除远程tag
```
参考链接：
[https://www.liaoxuefeng.com/wiki/0013739516305929606dd18361248578c67b8067c8c017b000/001376951758572072ce1dc172b4178b910d31bc7521ee4000](http://https://www.liaoxuefeng.com/wiki/0013739516305929606dd18361248578c67b8067c8c017b000/001376951758572072ce1dc172b4178b910d31bc7521ee4000)

##### 2.修改远程tag（非特殊情况，不要修改）
将名为 old 的 tag 改为 new，可以通过执行以下命令来修改远程 tag 名称:
```
git tag new old

git tag -d old

git push origin :refs/tags/old

git push --tags
```


#### 7. 历史操作
##### 1.删除某次历史提交

（”commit id”替换为想要删除的提交的”commit id”，需要注意最后的^号，意思是commit id的前一次提交）：

```
git rebase -i "commit id"^
```
执行该条命令之后会打开一个编辑框，内容如下，列出了包含该次提交在内之后的所有提交。

然后在编辑框中删除你想要删除的提交所在行，然后保存退出就好啦，如果有冲突的需要解决冲突。接下来，执行以下命令，将本地仓库提交到远程库就完成了：

```
git push origin master -f
```

##### 2.修改历史某次提交


```
git add .
git commit --amend
git rebase --continue
```

