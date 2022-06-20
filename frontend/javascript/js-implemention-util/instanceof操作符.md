# 实现instanceof

instanceof的左侧是一个变量，右侧是一个构造函数

判断在变量的原型链上是否存在对应的构造函数

如果存在则返回true

如果直到null时仍没有匹配到构造函数，则返回false

```js
function _instanceof(proto, constructor) {
  let _proto = Object.getPrototypeOf(proto); // 获取变量的原型
  const _prototype = constructor.prototype; // 获取构造函数的原型
  while (_proto) {
    if (_proto === _prototype) {
      return true;
    }
    _proto = Object.getPrototypeOf(_proto);
  }
  return false;
}
``