# 如何根据 commit 自动生成 CHANGELOG

> 参考文章[规范你的 commit message 并且根据 commit 自动生成 CHANGELOG.md](https://juejin.im/post/5bd2debfe51d457abc710b57) [官方文档](https://github.com/conventional-changelog/commitlint)

commitlint 规范 git 提交并配置，[文档链接](https://github.com/conventional-changelog/commitlint#config)

## 安装 && 配置

### 1.全局安装`conventional-changelog-cli`

```shell
npm install -g conventional-changelog-cli
```

### 2.本地安装 commitlint 并配置

```shell
npm install --save-dev @commitlint/{config-conventional,cli}

# 本地生成config配置文件
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js
```

commitlint.config.js

```js
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "body-leading-blank": [1, "always"],
    "footer-leading-blank": [1, "always"],
    "header-max-length": [2, "always", 72],
    "scope-case": [2, "always", "lower-case"],
    "subject-case": [
      2,
      "never",
      ["sentence-case", "start-case", "pascal-case", "upper-case"]
    ],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],
    "type-enum": [
      2,
      "always",
      [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "improvement",
        "perf",
        "refactor",
        "revert",
        "style",
        "test"
      ]
    ]
  }
};
```

### 3.添加到git hooks中，在每次提交commit之前进行校验

安装依赖
```shell
npm install --save-dev husky
```

package.json修改
```json
// package.json
{
  "husky": {
    "hooks": {
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }  
  }
}
```

4.全局安装conventional-changelog-cli
```shell
npm install -g conventional-changelog-cli
```

## 使用

```shell
# 不会覆盖以前的 Change log，只会在 CHANGELOG.md 的头部加上自从上次发布以来的变动
conventional-changelog -p angular -i CHANGELOG.md -s -p

# 生成所有发布的 Change log
conventional-changelog -p angular -i CHANGELOG.md -w -r 0
```
