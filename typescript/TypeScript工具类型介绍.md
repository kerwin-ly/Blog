# TypeScript 工具类型

本文主要介绍 TypeScript 中常用的工具类型的用法和实现方式

## 工具类型介绍

### Partial<Type>

构造类型 T，并将它所有的属性设置为可选的。它的返回类型表示输入类型的所有子类型。

#### Partial 用法

当一个对象的属性需要和该对象合并时，可使用该工具函数

```js
interface User {
  name: string;
  age: number;
}

function merge(user: User, attr: Partial<User>) {
  return Object.assign(user, attr);
}
```

#### Partial 实现

在实现`Partial`前，需要先掌握`keyof`的使用。

`keyof`用于获取指定类型的key，并以联合类型返回。如下所示：

```js
interface User {
  name: string;
  age: number;
}

keyof User; // 输出：'name' | 'age'
```

了解了`keyof`，`Partial`的实现就简单了。如下：
```js
// 遍历类型T，将每个属性的key设置为可选
type Partial<T> = {
  [P in keyof T]?: T[P];
}
```

### Required<Type>

将类型 T 的所有属性设置为必选（如果之前类型 T 中有可选属性，也会被设置为必选）

#### Required 用法

```js
interface User {
  name: string;
  age?: number;
}

let data: Required<User> = {
  name: "kerwin",
  age: 23, // 必须添加age属性，否则类型校验失败
};
```

#### Required 实现

```js
type Required<T> = {
  // "-?"用于来标注属性为必填的属性，会将原有可选的属性也修改为必选。
  [P in keyof T]-?: T[P];
};
```

### Readonly<Type>

将类型 T 中包含的属性设置为 readonly，并返回一个新类型。

#### Readonly 用法

如下，设置用户的私有信息不可修改

```js
interface PrivateInfo {
  height: number;
}

interface User {
  name: string;
  age?: number;
  privateInfo: Readonly<PrivateInfo>;
}

let data: User = {
  name: "kerwin",
  age: 23,
  privateInfo: {
    height: 10,
  },
};

data.privateInfo.height = 199; // 报错，Cannot assign to 'height' because it is a read-only property.
```

#### Readonly 实现

```js
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
}
```

### Record<Key,Type>

构造一个类型，其属性名的类型为 K，属性值的类型为 T。这个工具可用来将某个类型的属性映射到另一个类型上。

#### Record 用法

将用户列表转换为字典结构。其中`key`为用户 id，`value`为用户信息。

```js
interface User {
  id: string;
  name: string;
  age: number;
}

const data: Record<string, User> = {
  '1': {
    id: '1',
    name: "kerwin",
    age: 27,
  },
  '2': {
    id: '2',
    name: "bob",
    age: 28,
  },
};
```

key 也可以是一个联合类型

```js
interface User {
  id: string;
  name: string;
  age: number;
}

type Keys = 1 | 2;

const data: _Record<Keys, User> = {
  1: {
    id: '1',
    name: 'kerwin',
    age: 27,
  },
  2: {
    id: '2',
    name: 'bob',
    age: 28,
  },
};

```

#### Record 实现

```js
// 这里的keyof any 等于 string | number | symbol
// K extends C 表示 类型K一定包含于类型C
type Record<K extends keyof any, T> = {
  [P in K]: T
}
```

### Pick<Type,Key>

从类型 T 中挑选部分属性 K 来构造类型。

#### Pick 用法

筛选出用户的`name`和`age`作为新的类型

```js
interface User {
  id: string;
  name: string;
  age: number;
}

const data: Pick<User, "name" | "age"> = {
  name: "kerwin",
  age: 27,
};
```

#### Pick 实现

```js
// K extends keyof T：表明K必须是T中的子集
type IPick<T, K extends keyof T> = {
  [P in K]: T[P] // 如果遍历P在K中存在，则在该属性上定义T[P]
}
```

### Omit<Type,Key>

从类型 T 中获取所有属性，然后从中剔除 K 属性后构造一个类型。

#### Omit 使用

筛选出用户的 id 并生成新的类型

```js
interface User {
  id: string;
  name: string;
  age: number;
}

type Keys =  "id" | "name";
const data: Omit<User, Keys> = {
  age: 27
};
```

#### Omit 实现

`Omit`的实现使用的`Pick`和`Exclude`工具类型。其对应的实现方式在各自工具函数的介绍中有讲。

```js
// 先通过Exclude将联合类型中不需要的属性排除 ，得到过滤后的联合类型keys
// 然后遍历过滤后的联合类型keys，获取value
type Omit<T, K extends keyof any> = {
  [P in Exclude<keyof T, K>]: T[P];
}
```

### Exclude<Type,Union>

从类型 T 中剔除所有可以赋值给 U 的属性，然后构造一个类型

#### Exclude 用法

```js
type T0 = Exclude<"a" | "b" | "c", "a">; // "b" | "c"
type T1 = Exclude<"a" | "b" | "c", "a" | "b">; // "c"
type T2 = Exclude<string | number | (() => void), Function>; // string | number
```

#### Exclude 实现

```js
type Exclude<T, U> = T extends U ? never : T
```

下面，我们主要了解`extends`在联合类型中的实现

当`extends`左侧是联合类型时，会自动分配，即

```js
type T0 = Exclude<"a" | "b" | "c", "a">  // "b" | "c"

// 等价于

type T0 = "a" extends "a" ? never : "a"

  | "b" extends "a" ? never : "b"

  | "c" extends "a" ? never : "c"

// 等价于

type T0 = never | "b" | "c"

// 等价于

type T0 = "b" | "c"
```

### Extract<Type,Union>

从类型 T 中提取所有可以赋值给 U 的类型，然后构造一个类型。

#### Extract 用法

```js
type T0 = Extract<"a" | "b" | "c", "a" | "f">; // "a"
type T1 = Extract<string | number | (() => void), Function>; // () => void
```

#### Extract 实现

```js
type Extract<T, U> = T extends U ? T : never;
```

## 参考

[实用工具类型](https://tslang.baiqian.ltd/handbook/utility-types.html#recordkt)
