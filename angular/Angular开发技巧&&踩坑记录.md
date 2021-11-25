# Angular开发技巧 && 踩坑记录

### 1. 通过 ViewChild 获取 dom 节点/调用子组件方法

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

### 2. 报错 Error: If ngModel is used within a form tag, either the name attribute must be set or the form...

解决：input 框的`name`必须书写或者设置`[ngModelOptions]="{standalone: true}"`

### 3.:host && ::ng-deep 改变第三方组件样式

> 在 @Component 的元数据中指定的样式只会**对该组件的模板生效**，它们**既不会作用于模板中嵌入的任何组件**，也不会作用于投影进来的组件。把伪类 ::ng-deep 应用到如何一条 CSS 规则上就会完全禁止对那条规则的视图包装。任何带有 ::ng-deep 的样式都会变成全局样式。为了把指定的样式限定在当前组件及其下级组件中，请确保在 ::ng-deep 之前带上 :host 选择器。如果 ::ng-deep 组合器在 :host 伪类之外使用，该样式就会污染其它组件。

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

### 4. 动态表单赋值(setValue && patchValue)

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

### 5. 修改数组无法触发列表重新渲染

> 官方解释：当需要对 nzData 中的数据进行增删时需要使用以下操作，使用`push`或者`splice`修改 nzData 的数据**不会生效**

正确方式：

```js
// 增加数据
this.dataSet = [
  ...this.dataSet,
  {
    key: `${this.i}`,
    name: `Edward King ${this.i}`,
    age: '32',
    address: `London, Park Lane no. ${this.i}`
  }
];

// 删除数据
this.dataSet = this.dataSet.filter(d => d.key !== i);
```

### 6. lodash 在 angular 中的应用

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
import * as _ from 'lodash';

_.remove(scores, 2); // 正常使用即可
```

### 7. 在 nz-modal 中添加的 class 样式不起效

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

### 8. 保证 form 表单中 name 是唯一的

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

### 9. angular 中的 proxy.config.json 配置详情

> 参考链接:[官方链接](https://github.com/angular/angular-cli/blob/master/docs/documentation/stories/proxy.md)

### 10. 如何在 typescript 中向 window 对象挂载属性对象等

在使用框架时，我们常常有这样的场景。如：你在开发中，使用的是 vue 框架，想用一个`原生js`的插件，这是个引入后自动执行的函数。如果需要在`vue`中使用。则需要把其挂载在`window对象`上，全局去使用。`javascript`中能轻易拿到。但是在`typescript`中则由于`window对象`的类型限制(`window: Window`)而无法挂载。解决办法，将`window`对象声明为`any`

```js
// 插件中将对象暴露给window
window.PJF = PJF;
```

```ts
// 在angular中获取使用
const PJF = (<any>window).PJF;
```

### 11. angular7 将 sourcemap 打开后报错

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

### 12. angular 中的常用事件

```html
<button (dblclick)="onClick()"></button>
```

### 13. cdk-拖拽使用

> 参考：[官方链接](https://v7.material.angular.io/cdk/drag-drop/overview)

安装依赖（这里我的版本是 ng7，最新的 cdk 已经是 8.x，安装后会报警告，所以这里指定版本为 v7 的最后一个版本 v7.3.7）

```bash
npm install @angular/material@7.3.7 @angular/cdk@7.3.7 --save
```

在`shared`或`app`模块里面引入 cdk 模块

```
import { DragDropModule } from '@angular/cdk/drag-drop';
```

使用：列表拖拽具体：

typescript

```ts
items = [
  {
    name: "1"
  },
  {
    name: "2"
  },
  {
    name: "3"
  },
  {
    name: "4"
  }
];
drop(event: CdkDragDrop<string[]>) {
  // 组件默认保存修改后的状态，如果希望保存拖拽后的状态，使用该方法
  moveItemInArray(this.items, event.previousIndex, event.currentIndex);
}
```

html

```html
<div cdkDropList (cdkDropListDropped)="drop($event)">
  <div
    *ngFor="let item of items;let i = index;"
    cdkDrag
    style="background-color: red;margin-top: 20px"
  >
    {{ item.name }}
  </div>
</div>
```

### 14. angular 中触发事件

eg: 自动获取焦点

```html
<input nz-input #inputRef />
```

```js
@ViewChild('inputRef') inputRef;

ngAfterViewInit(): void {
  if (this.inputRef) {
    this.inputRef.nativeElement.focus();
  }
}
```

### 15. Error: Illegal state: Could not load the summary for directive ObserveContent

解决：`angular/cdk`版本为`v7.3.7`，降级到`v7.2.2`

### 16. angular 中解决代码压缩，无法查看错误详情问题

修改`angular.json`文件为

```json
"aot": true,
...
"optimization": false,
...
"buildOptimizer": false
```

### 17. Error: No provider for Overlay! StaticInjectorError(AppModule)

> 参考链接：https://github.com/NG-ZORRO/ng-zorro-antd/issues/759

解决：注意`ng-zorro-antd`和`angular-cdk`的版本匹配。如果确保版本没问题。清空依赖，重新 install

```bash
rm -rf node_modules && rm package-lock.json && npm install
```

### 18. 轮询接口处理

使用到`rxjs`的` interval``switchMap``takeWhile `装饰器

```ts
  startPolling(time = 3000): void {
    this.startProgress();
    this.pollingState = 'start';

    interval(time)
      .pipe(
        takeWhile(() => this.pollingState !== 'stop'),
        switchMap(() => this.getPollingService()),
        map(res => (this.previewResult = res.data)),
        tap(() => this.stopPolling())
      )
      .subscribe(() => {
        this.percent = 100;
      });
  }

  cancelPolling(): void {
    this.percent = 0;
    this.stopPolling();
  }

  stopPolling(): void {
    this.pollingState = 'stop';
    clearInterval(this.timer);
    this.spinService.emit(false);
  }

  getPollingService(): Observable<any> {
    const params = { pollingId: this.previewId };
    if (this.type === 'load') {
      return this.sqlTableService.preview(params);
    } else if (this.type === 'transfer') {
      return this.sqlTableService.getTransferPreviewId(params);
    }
  }

  startProgress(): void {
    // 初始化进度条，前端控制进度
    this.percent = 0;
    let percent = 0;
    // 假进度条最多到99%
    this.timer = setInterval(() => {
      percent = Math.floor(Math.random() * 5);
      if (this.percent < 99) {
        this.percent = this.percent + percent;
      } else {
        this.percent = 99;
      }
    }, 500);
  }
```

### 19. 设置 input 框中光标位置

场景：通过点击事件，往 input 框中填入一个函数后，需要自动将光标位置移动到`？`位置。通过点击事件，添加的内容自动在光标位置填充

```html
<input nz-input #inputRef />
```

```ts
@ViewChild('inputRef') inputRef;

// 输入方法
setFunc(func: string): void {
  const expression = this.expressionForm.get('expression').value || '';
  this.expressionForm.get('expression').setValue(expression + func);
  this.changeInputPos();
}

// 修改光标位置
changeInputPos(): void {
  const expression = this.expressionForm.get('expression').value || '';
  const index = expression.indexOf('?');
  const position = index + 1;

  this.expressionRef.nativeElement.setSelectionRange(position, position); // 设置光标位置
  this.expressionRef.nativeElement.focus();
}

// 在光标处填充内容
updateExpression(value: string): void {
  const insertIndex = this.inputRef.nativeElement.selectionStart;
  const expression = this.expressionForm.get('expression').value || '';
  const updatedExpression = expression.substr(0, insertIndex) + value + expression.substr(insertIndex);

  this.expressionForm.get('expression').setValue(updatedExpression);
}
```

### 20. 使用装饰器来自动取消订阅

参考链接：https://juejin.im/post/5b27a9c0f265da595b48d0f3
https://github.com/NetanelBasal/ngx-auto-unsubscribe

### 21. 解析 Subject BehaviorSubject ReplaySubject AsyncSubject

https://segmentfault.com/a/1190000012669794

### 22. 秒/分钟/天数之间的换算

> 最近有个需求。图谱项目中，后端边返回的是`秒`,用户可以拖动时间轴来过滤图谱的边和节点。时间轴的单位是`天`。直接用`scond / 3600 / 24`可能出现除不尽的情况，无法得到准确的天数。时间轴在拖动过程中又需要转换为`秒`去图谱数据中比较。于是使用`dayjs`的 api 来进行处理。(`diff isSameOrBefore isSameOrAfter`)[dayjs github 仓库](https://github.com/iamkun/dayjs)

安装依赖

```shell
npm install dayjs --save
```

换算和比较

```ts
import * as dayjs from 'dayjs';

// 换算从1970-01-01到指定日期的天数
convertTimeToDays(timestamp: number): number {
  const startDate = dayjs('1970-01-01');
  const endDate = dayjs(dateFormat(new Date(timestamp), 'yyyy-MM-dd'));

  return endDate.diff(startDate, 'day');
}

// 判断时间大小
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
dayjs.extend(isSameOrAfter) // 注意必须依赖
dayjs('2010-10-20').isSameOrAfter('2010-10-19', 'year')
```

### 23. 监听路由变化

> NavigationStart：导航开始 NavigationEnd：导航结束 NavigationCancel：取消导航 NavigationError：导航出错 RoutesRecoginzed：路由已认证

监听单一事件

```ts
this.router.events
  .filter(event => event instanceof NavigationEnd)
  .subscribe((event: NavigationEnd) => {
    //do something
  });
```

监听多个事件

```ts
import { Router, NavigationStart } from '@angular/router';
constructor(router:Router) {
  router.events.subscribe(event:Event => {
    if(event instanceof NavigationStart) {
      //
    } else if(event instanceof NavigationEnd) {
      //
    } else if(event instanceof NavigationCancel) {
      //
    } else if(event instanceof NavigationError) {
      //
    } else if(event instanceof RoutesRecognized) {
      //
    }
  });

```

### 24. 在 html 中遍历对象

> 其核心是用到了 angular6 之后提供的[KeyValuePipe](https://github.com/angular/angular/blob/9.0.5/packages/common/src/pipes/keyvalue_pipe.ts#L25-L88)。用法可以参考[stackoverflow上面的相关讨论](https://stackoverflow.com/questions/52793944/angular-keyvalue-pipe-sort-properties-iterate-in-order) 

基础用法
```html
<div *ngFor="let item of object | keyvalue">
  {{item.key}}:{{item.value}}
</div>
```

有时候，咱们可能需要对对象的循环顺序做控制。则需要一个添加一个`compareFunction`

```html
<div *ngFor="let item of object | keyvalue: orderKey">
  {{item.key}}:{{item.value}}
</div>
```

```ts
export class DemoComponent extends OnInit {
  orderKey = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
    return Number(a.key) - Number(b.key);
  };
}
```

### 25. ng-zorro 使用 upload 组件提示 message: '上传错误'

如果使用`beforeUpload`方法，在往数组变量添加数据时，需要用`push`。如果使用`list = [item]`则会报错。

```html
<nz-upload
  class="upload-padding"
  [nzShowUploadList]="false"
  nzType="drag"
  [(nzFileList)]="fileList"
  [nzBeforeUpload]="beforeUpload"
  nzAccept="application/pdf"
>
  <p>
    <i nz-icon nzType="file-add" nzTheme="outline"></i>
  </p>
</nz-upload>
```

```ts
beforeUpload = (file: UploadFile): boolean => {
  this.fileList.push(file); // success
  return false;
};
```

![success-upload](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/success-load.png)

```ts
beforeUpload = (file: UploadFile): boolean => {
  this.fileList = [file]; // success
  return false;
};

![error-upload](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/error-upload.png)
```

### 26. 页面初始阶段，在钩子函数中重复赋值，报错：ERROR Error: ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked. Previous value: 'ngIf: false'. Current value: 'ngIf: true'.

[stackoverflow解决](https://stackoverflow.com/questions/54611631/expressionchangedafterithasbeencheckederror-on-angular-6-while-using-mat-tab/54616248#54616248))

[产生原因：Everything you need to know about the `ExpressionChangedAfterItHasBeenCheckedError`](https://indepth.dev/everything-you-need-to-know-about-the-expressionchangedafterithasbeencheckederror-error/)

### 27. FormGroup表单无法在html中使用[disabled]属性禁用输入框

当时用FormBuilder创建表单后，无法在html实现动态禁用。如下：动态禁用`username`输入框

```ts
...
this.form = this.fb.group({
  username: [null, [Validators.required]]
});
```

not work：在input输入框中直接使用[disabled]属性无法禁用
```html
<form nz-form [formGroup]="form" (ngSubmit)="submitForm()">
  <nz-form-item>
    <nz-form-label [nzSm]="6" [nzXs]="24" nzRequired nzFor="username">用户名称</nz-form-label>
    <nz-form-control [nzSm]="17" [nzXs]="24" nzErrorTip="用户名称不能为空!">
      <input nz-input formControlName="username" id="username" [disabled]="isEdit" />
    </nz-form-control>
  </nz-form-item>
</form>
```

work：在ts代码中控制form-control实现
```ts
this.form = this.fb.group({
  username: [{ value: null }, [Validators.required]]
});

// or

if (!this.isCreate) {
  this.form.controls.username.disable();
}
```

