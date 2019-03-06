## typescript学习笔记

### 数据类型
#### 1.原始数据类型
布尔值，数值，字符串，null，undefined，空值，任意值
```js
// 字符串
var str: string = 'kerwin';

// boolean
var isNum: boolean = true;

// number
var count: number = 12;

// undefined
let u: undefined = undefined;

// null
let n: null = null;

// 空值,在 TypeScript 中，可以用 void 表示没有任何返回值的函数：
function alertName(): void {
  alert('kerwin');
}

let tt;
tt = 123;
```

#### 2.任意值
```js
// any,变量如果在声明的时候，未指定其类型，那么它会被识别为任意值类型：
let ss: any = 'ddd';
```

#### 3.类型推论：
```js
let str = 'kerwin';
str = 123; // 报错，因为类型推论会编译为let str: string = 'kerwin'
```

#### 4.联合类型
```js
let ob: string | number;
ob = 'kerwin'
```

#### 5.对象的类型--接口
>在 TypeScript 中，我们使用接口（Interfaces）来定义对象的类型

确定属性：定义的接口和变量必须对等，不能多也不能少
```js
interface Person {
  name: string,
  age: number
}

let tom: Person = {
  name: 'Tom',
  age: 25
}
```

可选属性
```js
interface Person {
  name: string,
  age?: number
}

let tom: Person = {
  name: 'Tom'
}
```