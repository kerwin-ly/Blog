## react踩坑

#### 1.react中的函数事件写法
>参考连接：[官网-事件处理](https://react.docschina.org/docs/handling-events.html)

写法一：使用属性初始化器来正确的绑定回调函数（推荐）
```js
class LoggingButton extends React.Component {
  handleClick = () => {
    console.log('this is:', this);
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        Click me
      </button>
    );
  }
}
```

写法二：在这个元素初始渲染的时候提供一个监听器（太麻烦）
```js
class Toggle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isToggleOn: true};

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(prevState => ({
      isToggleOn: !prevState.isToggleOn
    }));
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        {this.state.isToggleOn ? 'ON' : 'OFF'}
      </button>
    );
  }
}

ReactDOM.render(
  <Toggle />,
  document.getElementById('root')
);
```

写法三：回调函数中使用 箭头函数（可能造成重复渲染组件）
>使用这个语法有个问题就是每次 LoggingButton 渲染的时候都会创建一个不同的回调函数。在大多数情况下，这没有问题。然而**如果这个回调函数作为一个属性值传入低阶组件，这些组件可能会进行额外的重新渲染**。我们通常建议在构造函数中绑定或使用属性初始化器语法来避免这类性能问题。

```js
class LoggingButton extends React.Component {
  handleClick = () => {
    console.log('this is:', this);
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        Click me
      </button>
    );
  }
}
```

#### 2.事件中的参数传递

第一种：通过箭头函数的方式，事件对象必须显式的进行传递
```js
<button onClick={(e) => this.deleteRow(id, e)}>Delete Row</button>
```

第二种：通过 bind 的方式，事件对象以及更多的参数将会被隐式的进行传递。同时在对应的监听函数里面
需要把e参数放在最后
```js
deleteRow(id, e) { // 这里的e是隐式传递的，需要放在最后
  e.preventDefault();
  alert(id)
}

<button onClick={this.deleteRow.bind(this, id)}>Delete Row</button>
```