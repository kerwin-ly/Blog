## js 惰性载入函数

> 通过逻辑判断，将原来的函数进行重新赋值，在下一次进入函数后，就可以直接调用对应正确的方法，不再做逻辑判断

场景：根据各大浏览器的差异，判断其请求方法

老方法，但是有个问题。**其实在咱们第一次判断了浏览器后，已经知道了其兼容方法了，后续调用实际是不需要在进行判断**

```js
function createXHR() {
  if (typeof XMLHttpRequest != "undefined") {
    return new XMLHttpRequest();
  } else if (typeof ActiveXObject != "undefined") {
    if (typeof arguments.callee.activeXString != "string") {
      var versions = [
          "MSXML2.XMLHttp.6.0",
          "MSXML2.XMLHttp.3.0",
          "MSXML2.XMLHttp"
        ],
        i,
        len;
      for (i = 0, len = versions.length; i < len; i++) {
        try {
          new ActiveXObject(versions[i]);
          arguments.callee.activeXString = versions[i];
          break;
        } catch (ex) {
          //跳过
        }
      }
    }
    return new ActiveXObject(arguments.callee.activeXString);
  } else {
    throw new Error("No XHR object available.");
  }
}
```

惰性加载：在第一次初始化后，将原来的函数重新赋值，在下一次调用该方法时候，调用的是赋值后的新函数。

```js
function createXHR() {
  if (typeof XMLHttpRequest != "undefined") {
    createXHR = function() {
      return new XMLHttpRequest();
    };
  } else if (typeof ActiveObject != "undefined") {
    createXHR = function() {
      if (typeof arguments.callee.activeXString != "string") {
        var versions = [
            "MSXML2.XMLHttp.6.0",
            "MSXML2.XMLHttp.3.0",
            "MSXML2.XMLHttp"
          ],
          i,
          len;
        for (i = 0, len = versions.length; i < len; i++) {
          try {
            new ActiveXObject(versions[i]);
            arguments.callee.activeXString = versions[i];
            break;
          } catch (ex) {
            //skip
          }
        }
      }
      return new ActiveXObject(arguments.callee.activeXString);
    };
  } else {
    createXHR = function() {
      throw new Error("NO XHR object available.");
    };
  }

  return createXHR();
}
```
