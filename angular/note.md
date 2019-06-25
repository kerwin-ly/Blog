# Angular 笔记

## 安装配置启动

### 1. 安装 Angular Cli

```bash
npm install -g @angular/cli
```

### 2. 创建 app

```bash
ng new my-app
```

### 3. 启动开发环境

```bash
cd my-app
ng server --open
```

## 常用命令

- `--spec=false` 不创建测试文件
- `--skip-import` 是否忽略在模块添加组件声明，默认为 false

### 1. 新建组件

```bash
# 在components目录下创建news组件
ng g component components/xxx
```

### 2.创建服务

```bash
ng g service services/xxx
```

### 3. 创建指令

```bash
# 创建指令highlight
ng g directive directive/xxx
```

#### 4. 创建自定义模块

```bash
ng g module modules/xxx
ng g module modules/xxx --routing # 创建模块和对应路由
```

#### 5. 创建 interface

```bash
ng g interface interfaces/xxx
```

## Angular

### 1. 架构

#### 1.1 @NgModule 元数据

`@NgModule`接受一个元数据对象，该对象的属性用来描述这个模块。

- declarations（可声明对象表） —— 那些属于本 NgModule 的组件、指令、管道。
- exports（导出表） —— 那些能在其它模块的组件模板中使用的可声明对象的子集。
- imports（导入表） —— 那些导出了本模块中的组件模板所需的类的其它模块。
- providers —— 本模块向全局服务中贡献的那些服务的创建器。 这些服务能被本应用中的任何部分使用。（你也可以在组件级别指定服务提供商，这通常是首选方式。）
- bootstrap —— 应用的主视图，称为根组件。它是应用中所有其它视图的宿主。只有根模块才应该设置这个 bootstrap 属性。

`src/app/app.module.ts`

```js
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
@NgModule({
  imports: [BrowserModule],
  providers: [Logger],
  declarations: [AppComponent],
  // exports:      [ AppComponent ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

#### 1.2 @Component 组件

`@component`指定紧随其后的那个类是个组件类，并为其指定原组件。

- selector：是一个 CSS 选择器，它会告诉 Angular，一旦在模板 HTML 中找到了这个选择器对应的标签，就创建并插入该组件的一个实例。 比如，如果应用的 HTML 中包含 <app-hero-list></app-hero-list>，Angular 就会在这些标签中插入一个 HeroListComponent 实例的视图。
- templateUrl：该组件的 HTML 模板文件相对于这个组件文件的地址。 另外，你还可以用 template 属性的值来提供内联的 HTML 模板。 这个模板定义了该组件的宿主视图。
- providers：当前组件所需的服务提供商的一个数组。在这个例子中，它告诉 Angular 该如何提供一个 HeroService 实例，以获取要显示的英雄列表。

```js
@Component({
  selector: "app-hero-list",
  templateUrl: "./hero-list.component.html",
  providers: [HeroService]
})
export class HeroListComponent implements OnInit {
  // ...
}
```

#### 1.3 @Injectable 注入器

`@Injectable`把一个类定义为服务，装饰器提供元数据，以便让 angular 把它作为依赖注入到组件中。注意：**依赖不一定是服务，可能也是函数或值**

- 注入器：angular 会在启动过程中为创建其全应用级和所需要的注入器，自己不需要创建。
- 提供商：用来告诉注入器

![基本类型分析图](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/injector-injects.png)
`src/app/hero-list.component.ts`

```js
constructor(private service: HeroService) {}
```

### 2. 模板语法

#### 2.1 \*ngFor 获取 index

注意如何获取当前的 index,trackBy 的应用

> ngFor 指令有时候会性能较差，特别是在大型列表中。 对一个条目的一丁点改动、移除或添加，都会导致级联的 DOM 操作。添加了`trackBy`后会根据数据变动找到指定的 dom 进行元素替换。

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
<img [src]="imgurl" /> <img src="{{ imgurl }}" />
```

#### 2.3 form 表单中数据双向绑定

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
<input type="text" [(ngModel)]="inpValue" />
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
<app-child
  [newsTitle]="newsTitle"
  (requestChangeTitle)="updateTitle(info)"
></app-child>
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
  我是子组件 {{ newsTitle }}
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

#### 2.5 父组件直接获取子组件方法，值(ViewChild)

```html
<app-footer #footer></app-footer>
```

```js
@ViewChild('footerChild') footer;

this.footer.xxx
```

#### 2.6 没有 property 时候，动态修改 attribute

![attribute分析](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/ng-attribute.png)

```html
<table>
  <tr>
    <td [attr.colspan]="1 + 1">One-Two</td>
  </tr>
  <tr>
    <td>Five</td>
    <td>Six</td>
  </tr>
</table>
```

#### 2.7 管道符

> 对数据进行一定的转换修饰

自定义管道符

```bash
# 1. 生成pipe文件
ng g pipe extraData

# 2. extra-data.pipe.ts文件
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dataExtraPipe'
})
export class ExtraDataPipe implements PipeTransform {

  transform(value: string, args?: any): string {
    return value + 'extraData';
  }
}

# 3. 使用
<p> {{ data | dataExtraPipe }} </p>
```

### 3. 生命周期及父子组件渲染顺序

#### 3.1 生命周期

- ngOnChanges() 当 Angular（重新）设置数据绑定输入属性时响应。 该方法接受当前和上一属性值的 SimpleChanges 对象。在 ngOnInit() 之前以及所绑定的一个或多个输入属性的值发生变化时都会调用。**用来监听数据变化**

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

- ngOnInit() 在 Angular 第一次显示数据绑定和设置指令/组件的输入属性之后，初始化指令/组件。在第一轮 ngOnChanges() 完成之后调用，只调用一次。**这是获取初始数据的好地方**

- ngDoCheck() 检测，并在发生 Angular 无法或不愿意自己检测的变化时作出反应。在每个变更检测周期中，紧跟在 ngOnChanges() 和 ngOnInit() 后面调用。**开销巨大！**

- ngAfterContentInit() 当 Angular 把外部内容投影进组件/指令的视图之后调用。第一次 ngDoCheck() 之后调用，只调用一次。

- ngAfterContentChecked() 每当 Angular 完成被投影组件内容的变更检测之后调用。

- ngAfterContentInit() 和每次 ngDoCheck() 之后调用

- ngAfterViewInit() 当 Angular 初始化完组件视图及其子视图之后调用。第一次 ngAfterContentChecked() 之后调用，只调用一次。**这个时候可以拿到具体 dom 元素和绑定的值了**

- ngAfterViewChecked() 每当 Angular 做完组件视图和子视图的变更检测之后调用。**频繁调用，简化逻辑，注意开销**

- ngOnDestroy() 每当 Angular 每次销毁指令/组件之前调用。 **这里处理一些内存泄漏问题，如：清除计时器，取消订阅对象等**

#### 3.2 父子组件渲染顺序问题

常见的钩子加载顺序

```
父组件constructor
子组件constructor
父组件OnInit
子组件Onchanges
子组件OnInit
子组件AfterViewInit
父组件AfterViewInit
```

踩坑场景：当页面初始化时候，去拿子组件的变量命名

```html
<div>
  父组件
  <app-child #child></app-child>
  <button [disabled]="isDisabled()"></button>
</div>
```

```js
class Parent implements OnInit {
  constructor() {}

  isDisabled(): void {
    // return child.disabled; 报错：child 为undefined,这里由于子组件先渲染完，父组件还没挂载变量child
    if (child) {
      return child.disabled; // 解决：加一层判定
    }
  }
}
```

### 5. 通过 ViewChild 获取 dom 节点/调用子组件方法

`app.component.html`设置变量 box

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

### 7. 报错 Error: If ngModel is used within a form tag, either the name attribute must be set or the form...

解决：input 框的`name`必须书写或者设置`[ngModelOptions]="{standalone: true}"`

### 8.:host && ::ng-deep 改变第三方组件样式

- `:host`：表示选择器，选择当前的组件
- `::ng-deep`：表示忽略中间的 className 嵌套层级关系，直接找到你要修改的 clasName

```less
:host {
  ::ng-deep {
    .xx {
      ...;
    }
  }
}
```

### 9. 动态表单赋值(setValue && patchValue)

- `setValue`为单个控件赋值
- `patchValue`为整个表单模型赋值

```js
constructor(
  private fb: FormBuilder
) {
  this.userForm = this.fb.group({
    name: ['', [Validators.required]],
    age: [null, [Validators.required]],
  });
}

setForm() {
  // 第一种：setValue设置单个值
  this.userForm.get('name').setValue('kerwin');
  this.userForm.get('age').setValue(22);

  // 第二种：patchValue设置表单值
  this.userForm.patchValue({
    name: 'kerwin',
    age: 22
  })
}
```

### 10. 修改数组无法触发列表重新渲染

> 官方解释：当需要对 nzData 中的数据进行增删时需要使用以下操作，使用`push`或者`splice`修改 nzData 的数据**不会生效**

正确方式：

```js
// 增加数据
this.dataSet = [
  ...this.dataSet,
  {
    key: `${this.i}`,
    name: `Edward King ${this.i}`,
    age: "32",
    address: `London, Park Lane no. ${this.i}`
  }
];

// 删除数据
this.dataSet = this.dataSet.filter(d => d.key !== i);
```

### 11. lodash 在 angular 中的应用

1.安装依赖

```bash
npm install lodash --save

npm install @types/lodash --save-dev
```

2.在`tsconfig.json`添加`lodash`类型`"types" : ["lodash"])`

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "outDir": "./dist/out-tsc",
    "sourceMap": true,
    "declaration": false,
    "moduleResolution": "node",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "target": "es5",
    "typeRoots": ["node_modules/@types"],
    "types": ["lodash"],
    "lib": ["es2017", "dom"]
  }
}
```

3.使用

```js
import * as _ from "lodash";

_.remove(scores, 2); // 正常使用即可
```

### 12. 在 nz-modal 中添加的 class 样式不起效

```html
<div class="wrapper">
  <nz-modal
    nzTitle="{{'重新比对' | translate }}"
    [nzWidth]="620"
    (nzOnOk)="reDiff()"
    *ngIf="showAdvancedFeatures"
    [(nzVisible)]="reDiffModalVisible"
    (nzOnCancel)="resetStatus()"
  >
    <div nz-row nzType="flex" class="inner-title" [nzGutter]="16"></div>
  </nz-modal>
</div>
```

```less
/* 注意：这里由于:host表示组件本身，而.inner-title的组件本身是modal。所以不能写在:host里面 */
::ng-deep {
  .inner-title {
    color: red;
  }
}

:host {
  ::ng-deep {
    .wrapper {
      ...;
    }
  }
}
```

### 13. 保证 form 表单中 name 是唯一的

如果表单中有`name`字段，青务必保证其是唯一的。**否则渲染时，前面的数据会被后面的替换，即时绑定的是不同的字段**

如下，`name`属性均为 group，前面的`用户组`数据将被替换成`角色`数据

```html
<nz-form-item>
  <nz-form-label>用户组</nz-form-label>
  <nz-form-control>
    <nz-checkbox-group
      [(ngModel)]="userGroupcheckOptions"
      name="group"
    ></nz-checkbox-group>
  </nz-form-control>
</nz-form-item>

<nz-form-item>
  <nz-form-label>角色</nz-form-label>
  <nz-form-control>
    <nz-checkbox-group
      [(ngModel)]="roleCheckOptions"
      name="group"
    ></nz-checkbox-group>
  </nz-form-control>
</nz-form-item>
```

### 14. angular中的proxy.config.json配置详情
>参考链接:[官方链接](https://github.com/angular/angular-cli/blob/master/docs/documentation/stories/proxy.md)

### 15. 如何在typescript中向window对象挂载属性对象等
在使用框架时，我们常常有这样的场景。如：你在开发中，使用的是vue框架，想用一个`原生js`的插件，这是个引入后自动执行的函数。如果需要在`vue`中使用。则需要把其挂载在`window对象`上，全局去使用。`javascript`中能轻易拿到。但是在`typescript`中则由于`window对象`的类型限制(`window: Window`)而无法挂载。解决办法，将`window`对象声明为`any`

```js
// 插件中将对象暴露给window
window.PJF = PJF;
```

```ts
// 在angular中获取使用
const PJF = (<any>window).PJF;
```

### 16. angular7将sourcemap打开后报错
报错如下：
```bash
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
```

解决：设置最大内存大小
```bash
node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng build --prod

# package.json
"build-sourcemap": "npm run color-less && node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng build --prod --source-map=true"

```
