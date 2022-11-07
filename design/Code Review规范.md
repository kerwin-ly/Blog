# Code Review 规范

总结一些工作中积累的 Code Review 实践经验，如果高效的完成 Code Review。

## Review 规则

### 注释

一般来说，所有的注释都应该被删掉，用 git 的历史记录就可以追踪了。但如果逻辑还没完成，不注释就会报错。针对这种情况，我们需要在注释的头部添加一个`TODO`标识，对下面注释进行解释。让 Reviewer 能够明白其注释的意义。如下：

```js
// TODO: 功能未完成，暂时保留
// function getUser() {
//  const name = 'kerwin';
//}
```

## 注意事项

1. 在提交 Pull Request 或 Merge Request 后，务必自己**先检查下合并分支，代码变更记录是否正确**。这能防止一些无意义的时间浪费。
