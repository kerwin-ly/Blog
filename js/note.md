## javascript
#### 1.数组合并的常用两种方法.
```js
// 1.concat，可以合并多个数组，不会影响原数组，但不能处理嵌套数组
var a = [1, 2, 3], b = [4, 5, 6];
a = a.concat(b);
document.write(a)

// 2.apply，可以处理嵌套数组
arr1 = [1,2,3,[ 'a','b']]; arr2 = [ 'a','b'];
function concat_apply() {
	// return  Array.prototype.push.apply(arr1,arr2);
	return Array.prototype.concat.apply([], arguments)
}
```
#### 2.基本类型和引用类型的区别
##### 基本类型：number, boolean, string, null, undefined
1.基本类型是存在栈内存中，存储了变量的标识符值,赋值只是改变其指向指针。不改变其值。
```js
// 这里返回的值可以看出来subtring方法并没有改变str的值，而是返回了一个新的字符串
var str = 'tea';
str.substring(0, 1); // 返回的值为t
console.log(str); // 返回的值为tea
```

```js
// 这里的name值看起来是改变了。实际上是name只是一个指针，从指向'kerwin'变成了指向'Bob'。这里的基本类型也是'kerwin'和'Bob'，它们是无法改变的。
var name = 'Kerwin';
name = 'Bob';
console.log(name); // 返回Bob
```

2.基本类型的比较是值的比较
```js
var str1 = 'a';
var str2 = 'b';
str1 == str2 // true
```

##### 引用类型：object等
1.引用类型的值是可以改变的，当赋值时，会将其原来的堆内存地址一同赋值。
```js
var a = {};
var b = a;
a.name = "change";
console.log(a.name) // hange;
console.log(b.name) // change
b.age = 29;
console.log(a.age) // 29
console.log(b.age) // 29
```

2.引用类型的比较是其对引用的比较，比较两个对象的堆内存中的地址是否相同
```js
var a = {};
var b = {};
a == b // false
```

#### 3.伪数组转换为数组
```js
function log(){
	var args = Array.prototype.slice.call(arguments);

	//为了使用unshift数组方法，将argument转化为真正的数组
	args.unshift('(app)');
	console.log.apply(console, args);
};
```















