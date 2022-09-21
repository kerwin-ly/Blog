# JS 编码规范

## 一、命名规范

### 1. 方法名: 驼峰式命名,第一个小写单词必须是动词。

```
eg：getProductList()
```

### 2. 变量:应尽量是一个名词， 驼峰式命名(Boolean 类型在前方根据需求加 is, has, can 等进行标识)

```
<!--正确方式-->
productList, isShowDialog
```

```
<!--错误方式-->
productlist, materialinfo, isproduct, showDialog
```

### 3. 常量使用全大写，中间用下划线隔开。

```
eg: const MAX_COUNT = 10;
```

### 4. 明确每个方法，变量的目的，禁止出现用 getList1, getList2 等进行方法（变量）命名

```
<!--正确方式-->
let pdaList = [];
let appList = [];

getProductList () {
	...
}

getMaterialList () {
	...
}
```

```
<!--错误方式-->
let list1 = [];
let list2 = [];

getList1 () {
	...
}

getList2 () {
	...
}
```

### 5. 方法，变量等禁止出现拼音，不常见的单词缩写。当出现生僻单词时，尽量写全。

```
<!--正确方式-->
getProductDictionary () {}
```

```
<!--错误方式-->
getProductDic () {}
```

### 6. 当需要传递参数时，参数应控制在 3 个以内，再多考虑传递对象。且参数命名应具有可读性。

```
<!--正确方式-->
getProductDictionary (isProdcut, type, format) {}
```

```
<!--错误方式-->
getProductDictionary (val1, val2, val3) {}
```

### 7. 常用方法命名

```
增加: addSomething
编辑: updateSomething
删除: deleteSomething
查看: getSomething
检查: checkSomething
获取列表数据: getSomethingList
提交数据: submitSomething
验证数据: validateSomething
前往页面: goWhere
设置某值: setSomething
```

### 8. 常用变量命名

```
Boolean: isSomething, hasSomething, canDoSomething
列表数据: somethingList
数据详情: somethingDetail
状态: state
```

### 9. 路由，文件命名驼峰式，如果有动词，应该在首位。

```
<!--正确方式-->
addProduct.vue          productInfo.vue
```

```
<!--错误方式-->
productAdd.vue          productinfo.vue
```

## 二、格式规范

### 1. 缩进、空格、换行、声明等严格按照项目中 eslint 规范，并使用`Prettier`自动格式化。

### 2. 方法名之间应换行。

```
<!--正确方式-->
function submitProduct () {
	if (validate()) {
		postData();
	}
}

function validate () {
	...
	return Boolean
}
```

```
<!--错误方式-->
function submitProduct () {
	if (validate()) {
		postData();
	}
}
function validate () {
	...
	return Boolean
}
```

## 3. 声明变量与下方逻辑换行。

```
<!--正确方式-->
let testing = true;

function submitProduct () {
	if (validate()) {
		postData();
	}
}
```

```
<!--错误方式-->
let testing = true;
function submitProduct () {
	if (validate()) {
		postData();
	}
}
```

## 三、编写建议

### 1. 保存小块代码，检查一个方法是否做过多的事。抽象层级保持一致。

如下: 表单提交时，不要让一个方法内，既做了验证，又做数据请求，又做列表刷新类似。
应考虑验证为一个抽象层，数据请求为一抽象层，是否需要列表刷新为一抽象层。

```
<!--正确方式-->
function submitProduct () {
	if (validate()) {
		postData();
	}
}

function validate () {
	...
	return Boolean
}

function postData () {
	axios.$http(...)
}
```

```
<!--错误方式-->
function submitProduct () {
	if (xxx = null && ...) {

	} else {
		this.$http({
			...
		})
	}
}
```

### 2. 当类似的代码重复过多时，一定要想办法将其抽离。禁止多个方法中，出现重复代码。

### 3. 代码自顶向下阅读。有关联的方法应该位置靠近，且自顶向下。

```
<!--正确方式-->
function submitProduct () {
	postData()
}

function postData () {
	...
}
```

```
<!--错误方式1-->
function submitProduct () {
	postData()
}

function getList () {
	...
}

function postData () {
	...
}
```

```
<!--错误方式2-->
function postData () {
	...
}

function submitProduct () {
	postData()
}
```

### 4. 坚持维护注释。如果自己修改了某部分代码逻辑，必须把以前的相关联代码注释同样修改。

### 5. 一行代码应该不超过 120 个字符，注意换行。（）

### 6. 当一个变量或者属性在多个页面使用时，应考虑抽离为全局的变量。

### 7. 禁止直接去判 undefined，应用 typeOf

```
<!--正确方式-->
if (typeof list === 'undefined') { ... }
```

```
<!--错误方式-->
if (list === undefined) { ... }
```

### 8. 如果需要通过路由传参进行判定时，路由参数尽量不使用 Boolean。

vue 页面刷新后，`Boolean`可能变为`String`

### 9. 尽量避免使用 else if

如果条件相同，用 `switch case`

```
<!--正确方式-->

let list = typeof list;
switch case (list) {
    case 'undefined':
        ...
        break;
    case 'Object':
        ...
        break;
    default:
        ...
}
```

```
<!--错误方式-->

if (typeof list === 'undefined') { ... }
else if (typeof list === 'Object') { ... }
else if (typeof list === 'String') { ... }
```

如果条件不同，体现层级先后逻辑

```
<!--正确方式-->
if (value != '') {
    if (!reg.test(value)) {
        alert('正则验证失败');
    } else {
        ...
    }
} else {
    alert('输入的是空值')
}
```

```
<!--错误方式-->
if (value == '') {
    alert('输入的是空值');
} else if (!reg.test(value)) {
    alert('正则验证失败');
} else if (...) {
    ...
}
```

### 10. 拒绝硬编码

```
<!--正确方式-->
function getMinHeight(clientHeight) {
	let headerHeight = 30;

	return clientHeight - headerHeight;
}

```

```
<!--错误方式-->
function getMinHeight(clientHeight) {
	return clientHeight - 30; // 无法知道30具体是什么值
}
```

### 11. 不要过多的直接注释代码，直接删除
