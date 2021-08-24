# Mock.js 的使用

## 安装

```shell
npm install mockjs --save-dev
```

## 使用

### Mock.mock()数据生成

> 数据模板中每个属性由 3 部分构成：`'name|rule': value`

#### 1.生成一个自增的数字

```js
Mock.mock({
  "num|+1": 1
});
```

#### 2.生成一个 1-10 范围的数字

```js
Mock.mock({
  "num|1-10": 1
});
```

#### 3.通过正则生成一串数字

```js
Mock.mock({
  regexp3: /\d{5,10}/
});
// => "regexp3": "561659409"
```

#### 4.生成一个随机booean值
```js
Mock.mock({
    'isBool|boolean': false
})
```

### Mock.Random生成随机数据

#### 1.Basic
```js
Mock.mock({
    email: '@email',
    color: '@color',
    integer: '@integer', // 生成一个随机整数
    natural: '@natural', // 生成一个自然数
    id: '@id' // 生成一个随机id
})
```

#### 2.Name
```js
Mock.mock({
    cname: '@cname', // 生成一个随机中文名
    word: '@cword' // 生成一个随机中文名称
})
```

#### 3.Date
```js
Mock.mock({
  date: '@date("yyyy-MM-dd")', // 生成一个yyyy-MM-dd格式日期
  time: '@time("HH:mm:ss")', // 生成一个HH:mm:ss时间格式
  datetime: '@datetime()', // 生成一个 yyyy-MM-dd H:mm:ss 日期
  now: '@now()' // 当前时间 yyyy-MM-dd H:mm:ss
})
```

#### 4.Address
```js
Mock.mock({
  region: '@region', // 随机生成一个地区名，如华南，华北等
  province: '@province', // 随机生成一个省份名称
  city: '@city', // 随机生成一个城市名称
  country: '@country', // 随机生成一个国家名称
})
```
