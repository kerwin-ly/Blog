## vue1.0 升级到 vue2.0

#### 1.beforeCompile 移除

使用 created 钩子函数替代。在 dom 加载之前就进行处理。

#### 2.compiled 替换

使用 mounted 钩子函数替代。其实相当于 1.0 的 ready

#### 3.ready 替换

使用新的 mounted 钩子函数替代。应该注意的是，使用 mounted 并不能保证钩子函数中的 this.$el 在 document 中。为此还应该引入 Vue.nextTick/vm.$nextTick。

```
mounted: function () {
  this.$nextTick(function () {
    // 代码保证 this.$el 在 document 中
  })
}
```

#### 4.v-for 遍历数组时的参数顺序 变更

当包含 index 时，之前遍历数组时的参数顺序是 (index, value)。现在是 **(value, index)** ，来和 JavaScript 的原生数组方法（例如 forEach 和 map）保持一致。

#### 5.v-for 遍历对象时的参数顺序 变更

当包含 key 时，之前遍历对象的参数顺序是 (key, value)。现在是 (value, key)，来和常见的对象迭代器（例如 lodash）保持一致。

#### 6.v-for 范围值 变更

之前，v-for="number in 10" 的 number 从 0 开始到 9 结束，现在从 1 开始，到 10 结束。

#### 7.twoWay Prop 的参数 移除

Props 现在只能单项传递。为了对父组件产生反向影响，子组件需要显式地传递一个事件而不是依赖于隐式地双向绑定

#### 8.v-bind 的 .once 和.sync 修饰符 移除

Props 现在只能单向传递。为了对父组件产生反向影响，子组件需要显式地传递一个事件而不是依赖于隐式地双向绑定。

#### 9.v-bind 真/假值 变更

在 2.0 中使用 v-bind 时，只有 **null**, **undefined** , 和 **false** 被看作是假。这意味着，0 和空字符串将被作为真值渲染。比如 v-bind:draggable="''" 将被渲染为 draggable="true"

#### 10.用 v-on 监听原生事件 变更

现在在组件上使用 v-on 只会监听自定义事件（组件用 \$emit 触发的事件）。如果要监听根元素的原生事件，可以使用 .native 修饰符

```
<my-component v-on:click.native="doSomething"></my-component>
```

#### 11.使用 lazy 或者 number 参数的 v-model 。 替换

lazy 和 number 参数现在以修饰符的形式使用，以前是

```
<input v-model="name" lazy>
<input v-model="age" type="number" number>
```

现在是

```
<input v-model.lazy="name">
<input v-model.number="age" type="number">
```

#### 12.使用内联 value 的 v-model 移除

v-model 不再以内联 value 方式初始化的初值了，显然他将以实例的 data 相应的属性作为真正的初值。这意味着以下元素：

```
<input v-model="text" value="foo">
```

在 data 选项中有下面写法的：

```
data: {
  text: 'bar'
}
```

将渲染 model 为 ‘bar’ 而不是 ‘foo’

#### 13.v-el 和 v-ref 替换

简单起见， v-el 和 v-ref 合并为一个 ref 属性了，可以在组件实例中通过 \$refs 来调用。这意味着 v-el:my-element 将写成这样： ref="myElement"， v-ref:my-component 变成了这样： ref="myComponent"。绑定在一般元素上时，ref 指 DOM 元素，绑定在组件上时，ref 为一组件实例。
因为 v-ref 不再是一个指令了而是一个特殊的属性，它也可以被动态定义了。这样在和 v-for 结合的时候是很有用的：

```
<p v-for="item in items" v-bind:ref="'item' + item.id"></p>
```

#### 14.transition 参数 替换

Vue 的过渡系统有了彻底的改变，现在通过使用 <transition> 和 <transition-group> （在 v-for 中使用）来包裹元素实现过渡效果，而不再使用 transition 属性

```
<div id="list-demo" class="demo">
  <button v-on:click="add">Add</button>
  <button v-on:click="remove">Remove</button>
  <transition-group name="list" tag="p">
    <span v-for="item in items" v-bind:key="item" class="list-item">
      {{ item }}
    </span>
  </transition-group>
</div>
```

#### 15.Html 中过滤器的替换，用 computed 处理

```
<p v-for="user in filteredUsers">{{ user.name }}</p>

==>
computed: {
  filteredUsers: function () {
    var self = this
    return self.users.filter(function (user) {
      return user.name.indexOf(self.searchQuery) !== -1
    })
  }
}
```

#### 16.过滤器参数符号 变更

现在过滤器参数形式可以更好地与 js 函数调用方式一致，因此不用再用空格分隔参数：

```
<p>{{ date | formatDate 'YY-MM-DD' timeZone }}</p>
```

现在用圆括号括起来并用逗号分隔：

```
<p>{{ date | formatDate('YY-MM-DD', timeZone) }}</p>
```

#### 17.keep-alive 属性 替换

keep-alive 不再是一个特殊属性而是一个包裹组件，类似于 <transition>比如：

```
<keep-alive>
  <component v-bind:is="view"></component>
</keep-alive>

<transition>
  <keep-alive>
    <component v-bind:is="view"></component>
  </keep-alive>
</transition>
```

#### 18.vm.\$watch changed

通过 vm.$watch创建的观察器现在将在组件渲染时被激活。这样可以让你在组件渲染前更新状态，不用做不必要的更新。比如可以通过观察组件的prop变化来更新组件本身的值。
如果以前通过 vm.$watch 在组件更新后与 DOM 交互，现在就可以通过 updated 生命周期钩子来做这些。
