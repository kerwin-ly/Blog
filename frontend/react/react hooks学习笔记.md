# React18 Hooks 学习笔记

React的组件有`class`和`function`两种写法。在没有`Hook`之前，我们如果使用`函数组件`来实现功能，往往无法在组件内部保存状态。所以，`React16.8`之后推出了`Hook`的概念，来解决这个问题。注意：`Hook` 在 `class` 内部是不起作用的。

## React Hooks

### useState

在 class 中，我们通过在构造函数中设置 `this.state = { count: 0 }` 来初始化 count state 为 0：

而函数组件中，一般来说，在函数退出后变量就会”消失”，**而 state 中的变量会被 React 保留**。我们可以通过`useState`来完成。这是一种在函数调用时保存变量的新方法，它与 class 里面的 this.state 提供的功能完全相同。

**场景1：**点击一个按钮，实现累加


```ts
import * as React from 'react';
import { useState } from 'react'

export default function App() {
  const [num, setNum] = useState(0); // 页面首次渲染时，会执行一次该方法。其数值是默认值0

  return (
    <div>
      <button onClick={() => setNum(num + 1)}>{num}</button>
    </div>
  );
}
```

注意：`useState`只能出现在函数组件中。不能在内部函数或class中使用。

错误示例：

```ts
export default function App() {
  function test() {
    const [num, setNum] = useState(0); // not work
  }
}
```

**场景2：**初始值无法确定

在某些时候，state中的初始值不能直接确定。而是需要一定的逻辑运算。这是，`useState`的参数就必须是一个回调函数

```js
const [num, setNum] = useState(() => {
  // 一系列的逻辑处理
  return '逻辑处理后的结果';
})
```

### useEffect

`useEffect`可以帮助我们在函数中执行副作用操作。（副作用：不满足纯函数定义的一些操作逻辑，如：请求api、直接操作dom等）下面我们介绍三种使用场景：

**场景1：**根据state中的值，实时修改title。

```js
import * as React from 'react';
import { useState, useEffect } from 'react';

export default function App() {
  const [num, setNum] = useState(0);

  useEffect(() => {
    document.title = num.toString();
    console.log(document.title);
  });

  return (
    <div>
      <button onClick={() => setNum(num + 1)}>{num}</button>
    </div>
  );
}

```

在上述代码中，state每修改一次。就会重新加载函数组件中的方法，所以`useEffect`都会被执行。

**场景2：**当有多个state时，我们如果只需要监听某个特殊值变化。就需要添加`useEffect`的第二个参数 - 依赖项。

```ts
// 当state: num发生改变时，才执行
useEffect(() => {
  document.title = num.toString();
  console.log(document.title);
}, [num]);
```

**场景3：**仅在页面初始化时执行一次。需要将依赖项设为空数组。

```ts
useEffect(() => {
  document.title = num.toString();
  console.log(document.title);
}, []);
```

**场景4：需要清除useEffect里面的一些操作**

```ts
useEffect(() => {
  const timer = window.setInterval(() => {
    console.log(1);
  }, 1000);

  // 额外添加一个return function() {}用于清除一些副作用
  return () => {
    window.clearInterval(timer);
  }
}, []);
```

### useRef

`useRef`用于访问DOM使用，其返回一个可变的ref对象。该对象在组件的整个生命周期内持续存在。

```js
import * as React from 'react';
import { useEffect, useRef } from 'react';

export default function App() {
  const inputEl = useRef(null);

  useEffect(() => {
    console.log(inputEl.current);
    inputEl.current.focus();
  }, []);

  return (
    <input ref={inputEl} type="text" />
  );
}
```

### useContext

Context 提供了一个无需为每层组件手动添加 props，就能在组件树间进行数据传递的方法。

```js
const themes = {
  light: {
    foreground: "#000000",
    background: "#eeeeee"
  },
  dark: {
    foreground: "#ffffff",
    background: "#222222"
  }
};

const ThemeContext = React.createContext(themes.light); // 1. 在上层组件创建一个context

function App() {
  return (
    // 2. 使用 <ThemeContext.Provider>包裹组件
    <ThemeContext.Provider value={themes.dark}>
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function Toolbar(props) {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

function ThemedButton() {
  const theme = useContext(ThemeContext); // 3. 在需使用的地方添加useContext
  return (
    <button style={{ background: theme.background, color: theme.foreground }}>
      I am styled by theme context!
    </button>
  );
}
```

