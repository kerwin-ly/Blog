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

## 常用命令
### 1. 新建组件
```bash
# 在components文件夹下面新建news组件
ng g component components/news
```

### 2.创建服务
```bash
ng g service services/store
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
注意如何获取当前的index,trackBy的应用

>ngFor 指令有时候会性能较差，特别是在大型列表中。 对一个条目的一丁点改动、移除或添加，都会导致级联的 DOM 操作。添加了`trackBy`后会根据数据变动找到指定的dom进行元素替换。

```html
<ul id="heros">
  <li *ngFor="let item of heros; let i = index; trackBy: trackByHeroes">
    {{ item.name }} {{ i }}
  </li>
</ul>
```
```js
trackByHeroes(index: number, hero: Hero): number { return hero.id; }
```

#### 2.2 属性绑定两种方式
模板表达式不能引用全局命名空间中的任何东西，比如 window 或 document。它们也不能调用 console.log 或 Math.max。 它们只能引用表达式上下文中的成员。
```html
<img [src]="imgurl" />
<img src="{{ imgurl }}" />
```

#### 2.3 form表单中数据双向绑定
注意：**使用 ngModel 时需要 FormsModule**

在`app.module.ts`中添加`import`，
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

#### 2.4 父子组件传值
父组件
```html
<app-child [newsTitle]="newsTitle" (requestChangeTitle)="updateTitle(info)"></app-child>
```
```js
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.less']
})
export class NewsComponent implements OnInit {
  public newsTitle: string;
  constructor() {
    this.newsTitle = '这是父组件的消息头';
  }

  ngOnInit() {}

  updateTitle(info: string) {
    this.newsTitle = info;
  }
}
```

子组件
```html
<div class="child">
  我是子组件
  {{ newsTitle }}
  <button (click)="doUpdate()">修改父组件值</button>
</div>
```
```js
import { Component, OnInit, Input, Output } from '@angular/core';

@Component({
  selector: 'app-child',
  templateUrl: './child.component.html',
  styleUrls: ['./child.component.less']
})
export class ChildComponent implements OnInit {
  @Input() newsTitle: string; // 注意这里的@Input装饰器是关键
  @Output() requestChangeTitle = new EventEmitter<string>();

  constructor() {}

  ngOnInit() {}

  doUpdate() {
    this.requestChangeTitle.emit('消息被子组件修改了');
  }
}
```

#### 2.5 没有property时候，动态修改attribute
![attribute分析](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/ng-attribute.png)
```html
<table>
  <tr><td [attr.colspan]="1 + 1">One-Two</td></tr>
  <tr><td>Five</td><td>Six</td></tr>
</table>
```

#### 2.6 管道符
对数据进行一定的转换修饰

```html
<div>
  <p>{{ data | json }}</p>
</div>
```

### 3. 生命周期
* ngOnChanges() 当 Angular（重新）设置数据绑定输入属性时响应。 该方法接受当前和上一属性值的 SimpleChanges 对象。在 ngOnInit() 之前以及所绑定的一个或多个输入属性的值发生变化时都会调用。**用来监听数据变化**
```js
ngOnChanges(changes: SimpleChanges) {
  for (let propName in changes) {
    let chng = changes[propName];
    let cur  = JSON.stringify(chng.currentValue);
    let prev = JSON.stringify(chng.previousValue);
    this.changeLog.push(`${propName}: currentValue = ${cur}, previousValue = ${prev}`);
  }
}
```

* ngOnInit() 在 Angular 第一次显示数据绑定和设置指令/组件的输入属性之后，初始化指令/组件。在第一轮 ngOnChanges() 完成之后调用，只调用一次。**这是获取初始数据的好地方**

* ngDoCheck() 检测，并在发生 Angular 无法或不愿意自己检测的变化时作出反应。在每个变更检测周期中，紧跟在 ngOnChanges() 和 ngOnInit() 后面调用。**开销巨大！**

* ngAfterContentInit() 当 Angular 把外部内容投影进组件/指令的视图之后调用。第一次 ngDoCheck() 之后调用，只调用一次。

* ngAfterContentChecked() 每当 Angular 完成被投影组件内容的变更检测之后调用。

* ngAfterContentInit() 和每次 ngDoCheck() 之后调用

* ngAfterViewInit() 当 Angular 初始化完组件视图及其子视图之后调用。第一次 ngAfterContentChecked() 之后调用，只调用一次。**这个时候可以拿到具体dom元素和绑定的值了**

* ngAfterViewChecked() 每当 Angular 做完组件视图和子视图的变更检测之后调用。**频繁调用，简化逻辑，注意开销**

* ngOnDestroy() 每当 Angular 每次销毁指令/组件之前调用。 **这里处理一些内存泄漏问题，如：清除计时器，取消订阅对象等**

### 4. 服务service
1.创建服务(在当前目录的services文件夹下面创建news服务)
```bash
ng g service services/news
```

2.引入服务
`app.module.ts`
```js
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NewsComponent } from './components/news/news.component';
import { ChildComponent } from './components/child/child.component';

import { StoreService } from './services/store.service'; // 引入服务

@NgModule({
  declarations: [
    AppComponent,
    NewsComponent,
    ChildComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    AppRoutingModule
  ],
  providers: [StoreService], // 这里将服务进行注入
  bootstrap: [AppComponent]
})
export class AppModule { }
```

3.使用服务
`newsService`
```js
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  constructor() { }
  getName(): string {
    return 'this is kerwin';
  }
}

```
`news.component.ts`
```js
import { NewsService } from './services/store.service';

export class NewsComponent {
  constructor(public store: NewsService) {

  }
  getServiceName(): void {
    console.log(this.store.getName()) // 调用服务的方法
  }
} 
```

#### 5. 通过ViewChild获取dom节点/调用子组件方法
`app.component.html`设置变量box
```html
<app-child #box></app-child>
```

`app.component.ts`
```js
import { ViewChild } from '@angular/core';

export class NewsComponent implements OnInit {
  public newsTitle: string;

  @ViewChild('box') tempBox: ElementRef; // 将html页面中的#mybox变量赋值给tempBox
  constructor() {}

  ngOnInit() {}

  ngAfterViewInit(): void {
    console.log(this.tempBox);
    this.tempBox.childFn(); // 这里可以直接调用子组件的方法
  }
}
```
