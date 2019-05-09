# TypeScript学习笔记

## 安装配置
全局安装typescript
```bash
npm install -g typescript
```

编译ts文件
```bash
# 生成hello.js
tsc hello.ts
```

## 笔记

### 1.基础类型

#### 1.1 基本数据类型
```js
// 布尔值
let isNumber: boolean = false;

// 数字
let num: number = 123;

// 字符串
let str: string = 'kerwin';
```

#### 1.2 其他类型
```js
// 数组
let arr: Array<number> = [1, 2, 4]; // 第一种写法，指定值必须是number
let anyArr: any[] = [1, true, 'kerwin']; // 第二种写法，指定值为任意值

// 元组
let x: [string, number, boolean];
x = ['kerwin', 23, true];

```
