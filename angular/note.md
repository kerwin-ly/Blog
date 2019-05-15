# Angular笔记

## 安装配置启动
### 1. 安装Angular Cli
```bash
npm install -g @angular/cli
```

### 2. 创建app
```bash
ng new my-app
```

### 3. 启动开发环境
```bash
cd my-app
ng server --open
```

## 学习笔记
### 1. 架构
#### 1.1 @NgModule 元数据
`@NgModule`接受一个元数据对象，该对象的属性用来描述这个模块。

* declarations（可声明对象表） —— 那些属于本 NgModule 的组件、指令、管道。
* exports（导出表） —— 那些能在其它模块的组件模板中使用的可声明对象的子集。
* imports（导入表） —— 那些导出了本模块中的组件模板所需的类的其它模块。
* providers —— 本模块向全局服务中贡献的那些服务的创建器。 这些服务能被本应用中的任何部分使用。（你也可以在组件级别指定服务提供商，这通常是首选方式。）
* bootstrap —— 应用的主视图，称为根组件。它是应用中所有其它视图的宿主。只有根模块才应该设置这个 bootstrap 属性。

`src/app/app.module.ts`
```js
import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
@NgModule({
  imports:      [ BrowserModule ],
  providers:    [ Logger ],
  declarations: [ AppComponent ],
  // exports:      [ AppComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
```

#### 1.2 @Component 组件
`@component`指定紧随其后的那个类是个组件类，并为其指定原组件。

* selector：是一个 CSS 选择器，它会告诉 Angular，一旦在模板 HTML 中找到了这个选择器对应的标签，就创建并插入该组件的一个实例。 比如，如果应用的 HTML 中包含 <app-hero-list></app-hero-list>，Angular 就会在这些标签中插入一个 HeroListComponent 实例的视图。
* templateUrl：该组件的 HTML 模板文件相对于这个组件文件的地址。 另外，你还可以用 template 属性的值来提供内联的 HTML 模板。 这个模板定义了该组件的宿主视图。
* providers：当前组件所需的服务提供商的一个数组。在这个例子中，它告诉 Angular 该如何提供一个 HeroService 实例，以获取要显示的英雄列表。
```js
@Component({
  selector:    'app-hero-list',
  templateUrl: './hero-list.component.html',
  providers:  [ HeroService ]
})
export class HeroListComponent implements OnInit {
  // ...
}
```

#### 1.3 @Injectable 注入器
`@Injectable`把一个类定义为服务，装饰器提供元数据，以便让angular把它作为依赖注入到组件中。注意：**依赖不一定是服务，可能也是函数或值**

* 注入器：angular会在启动过程中为创建其全应用级和所需要的注入器，自己不需要创建。
* 提供商：用来告诉注入器

![基本类型分析图](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/injector-injects.png)
`src/app/hero-list.component.ts`  
```js
constructor(private service: HeroService) {}
```

### 2. 模板语法
#### 2.1 *ngFor获取index
注意如何获取当前的index
```html
<ul id="heros">
  <li *ngFor="let item of heros; let i = index">
    {{ item.name }} {{ i }}
  </li>
</ul>
```

#### 2.2 属性绑定两种方式
模板表达式不能引用全局命名空间中的任何东西，比如 window 或 document。它们也不能调用 console.log 或 Math.max。 它们只能引用表达式上下文中的成员。
```html
<img [src]="imgurl" />
<img src="{{ imgurl }}" />
```

#### 2.3 form表单中数据双向绑定
在`app.module.ts`中添加`import`
```js
import { NgModule } frm '@angular/core';
import { FormsModule } from '@angular/forms'; // 必须有这句

@NgModule({
  ...
  imports: [
    FormsModule,
    ...
  ]
})
```

`app.component.html`
```html
<p style="color: red;">{{ inpValue }}</p>
<input type="text" [(ngModel)]='inpValue'>
<!-- 相当于下方的一个编写 -->
<!-- <input [ngModel]="username" (ngModelChange)="username = $event" > -->
```

`app.component.ts`
```js
export class AppComponent {
  public inpValue: string;

  constructor() {
    this.inpValue = '';
  }
}
```

