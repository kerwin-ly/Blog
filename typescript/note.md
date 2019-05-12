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

// null && undefined：默认情况下null和undefined是所有类型的子类型

```

#### 1.2 其他类型
```js
// 数组
let arr: Array<number> = [1, 2, 4];
let anyArr: any[] = [1, true, 'kerwin'];

// 元组
let x: [string, number, boolean];
x = ['kerwin', 23, true];

// object
let x: f

// 枚举
enum Color { Primary = 'blue', Danger = 'red', Warning = 'yellow' };
let colorName: Color = Color.Primary;

// any
let x: any = 'kerwin';
x = 123;

// void:当一个函数值没有返回值时，返回void类型
function logName(): void {
  console.log('kerwin');
}

// never:表示那些永不存在的值（类似抛出异常或根本）
function error(message: string): never {
  throw new Error(message);
}

// object
function create(o: object | null): void {
  console.log(o);
}
create({
  name: 'kerwin'
})
```

#### 1.3类型断言
第一种：as写法（jsx中语法只支持这种）
```js
let value: any = 'maybe string';
let num: number = (value as string).length
```

第二种：尖括号
```js
let value: any = 'maybe string';
let num: number = (<string>value).length
```

#### 1.4联合类型：该值是多个类型中的任意一种
```js
let value: string | number;
value = '123';
value = 123;
```
