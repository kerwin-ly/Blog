# Rxjs

## 安装配置

```bash
npm install rxjs
```

## 学习笔记

> 详细文档请参考：[学习](https://rxjs-cn.github.io/learn-rxjs-operators/)

### 1. 基本用法

在 service 中通过`new Obervable`来观察属性，对应的页面中通过`subscribe`进行订阅。

`rx.service.js`

```js
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RxService {
  constructor() {}
  getRxData() {
    return Observable.create((observer) => {
      setTimeout(() => {
        observer.next({
          // 可以执行多次next方法
          name: 'kerwin',
        });
      }, 2000);
    });
  }
}
```

`app.component.ts`

```js
import { RxService } from './service/rxService';
export class AppComponent {
  constructor (public rxService: RxService) {}
  getRxData() {
    const rxData = this.rxService.getRxData();
    // 第一种：
    const sub = rxData.subscribe({
      next: x => console.log('Observer got a next value: ' + x),
      error: err => console.error('Observer got an error: ' + err),
      complete: () => console.log('Observer got a complete notification'),
    })

    // 第二种：
    const sub = rxData.subscribe((data) => {
      console.log(data);
    });
    sub.unsubscribe(); // 取消订阅
  }
}
```

### 2. 创建方式

#### 2.1 Observable.create

```js
getRxData() {
  return Observable.create((observer) => {
    const data: IPerson[] = [{
      name: 'kerwin',
      sex: true,
      age: 20
    }, {
      name: 'july',
      sex: false,
      age: 8
    }, {
      name: 'bob',
      sex: true
    }];

    setTimeout(() => {
      observer.next(data);
    }, 1000);
  });
}
```

#### 2.2 of && from

- of(...items) —— 返回一个 Observable 实例，它用同步的方式把参数中提供的这些值一起发出来。

- from(iterable) —— 把它的参数转换成一个 Observable 实例。 该方法通常用于把一个数组转换成一个（发送多个值的）可观察对象。（挨个发出来）

```js
const myObservar = {
  next: (x) => console.log('Observer got a next value: ' + x),
  error: (err) => console.error('Observer got an error: ' + err),
  complete: () => console.log('Observer got a complete notification'),
};
/* from: 打印了4次如下
Observer got a next value: kerwin
Observer got a next value: bob
Observer got a next value: tim
Observer got a complete notification
*/

/* of: 打印了1次如下
Observer got a next value: kerwin,bob,tim
*/
const obData = from(this.users);
obData.subscribe(myObservar);
```

#### 2.3 fromEvent 基于事件创建

```js
import { fromEvent } from 'rxjs';

const el = document.getElementById('my-element');
const mouseMoves = fromEvent(el, 'mousemove');

// Subscribe to start listening for mouse-move events
const subscription = mouseMoves.subscribe((evt: MouseEvent) => {
  console.log(`Coords: ${evt.clientX} X ${evt.clientY}`);

  // unsubscribe to stop listening for mouse movements
  if (evt.clientX < 40 && evt.clientY < 40) {
    subscription.unsubscribe();
  }
});
```

### 3. 管道符 operators

#### 3.1 filter

过滤基本类型

```js
const rxData = of[(1, 2, 3)];

const sub = rxData.pipe(filter((data) => data > 1)).subscribe((data) => {
  console.log(data);
});
```

过滤对象类型

```js
const t1 = from([
  {
    name: 'kerwin',
    age: 30,
  },
  {
    name: 'bob',
    age: 26,
  },
]);

t1.pipe(filter((person: any) => person.age > 27)).subscribe((val) => {
  console.log(val); // {name: 'kerwin', age: 30}
});
```

#### 3.2 first：发出第一个值或第一个通过给定表达式的值

```js
const data = from[(1, 2, 3, 5, 1)];

data
  .pipe(first((item) => item === 2, 'nothing')) // 如果匹配到了值为2，则返回当前值2.如果匹配不到，则返回'nothing'
  .subscribe((data) => {
    console.log(data);
  });
```

#### 3.3 debounceTime && throttleTime

- debounceTime：舍弃掉在两次输出之间小于指定时间的发出值
- throttleTime：指定的持续时间经过后发出最新值

debounceTime

```js
import { fromEvent, timer } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

const input = document.getElementById('example');

// 对于每次键盘敲击，都将映射成当前输入值
const example = fromEvent(input, 'keyup').pipe(
  map((i) => i.currentTarget.value)
);

// 在两次键盘敲击之间等待0.5秒方才发出当前值，
// 并丢弃这0.5秒内的所有其他值
const debouncedInput = example.pipe(debounceTime(500));

// 输出值
const subscribe = debouncedInput.subscribe((val) => {
  console.log(`Debounced Input: ${val}`);
});
```

throttleTime

```js
import { interval } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

// 每1秒发出值
const source = interval(1000);
/*
  节流5秒
  节流结束前发出的最后一个值将从源 observable 中发出
*/
const example = source.pipe(throttleTime(5000));
// 输出: 0...6...12
const subscribe = example.subscribe((val) => console.log(val));
```

#### 3.4 map && mapTo

- **mapTo**: 将发出来的值映射成一个常数值
- **map**: 对源 observable 的每个值进行加工

mapTo 举例：点击一次按钮，对应按钮次数+1

```ts
const setHtml = (id) => (val) => (document.getElementById(id).innerHTML = val);

const addOneClick$ = (id) =>
  fromEvent(document.getElementById(id), 'click').pipe(
    // 将每次点击映射成1
    mapTo(1),
    // startWith(0),
    // 追踪运行中的总数
    scan((acc, curr) => acc + curr),
    // 为适当的元素设置 HTML
    tap(setHtml(`${id}Total`))
  );

const combineTotal$ = combineLatest(addOneClick$('red'), addOneClick$('black'))
  .pipe(map(([val1, val2]) => val1 + val2))
  .subscribe(setHtml('total'));
```

map 举例

```ts
interval(5000)
  .pipe(
    startWith(0),
    map((data) => 'hello' + data)
  )
  .subscribe((extra) => {
    console.log(extra); // hello0, hello1, hello2
  });
```

### 4. 组合

#### 4.1 concat

按照顺序，前一个`observable`完成了再订阅下一个`observable`(有先后顺序)

```js
import { concat } from 'rxjs/operators';
import { of } from 'rxjs';

// 发出 1,2,3
const sourceOne = of(1, 2, 3);
// 发出 4,5,6
const sourceTwo = of(4, 5, 6);
// 先发出 sourceOne 的值，当完成时订阅 sourceTwo
const example = sourceOne.pipe(concat(sourceTwo));
// 输出: 1,2,3,4,5,6
const subscribe = example.subscribe((val) =>
  console.log('Example: Basic concat:', val)
);
```

#### 4.2 concatMap && mergeMap && switchMap

- concatMap：当希望合并多个 observables 时，并且要求上一个完成后发出结果才能订阅下一个。**是按照自己的书写 observable 顺序进行执行**
- mergeMap：和 concatMap 类似。不同点在于**哪个 observable 先完成，就先返回结果，适用于不会被取消的请求（如数据库操作）**
- switchMap：同上，区别在于**它有取消操作，每次发出时，会取消前一个内部 observable 订阅。保证了同一时间只有一个内部订阅。适用于可以取消请求的场景（如计时器操作等）**

concatMap

```js
const a = of(2000, 1000);
const example = a
  .pipe(concatMap((val) => of(`${val}ms`).pipe(delay(val))))
  .subscribe((val) => console.log(val)); // 2000ms后先打印2000ms，再过1000ms打印1000ms
```

mergeMap

```js
const a = of(2000, 500, 1000);
const example = a
  .pipe(mergeMap((val) => of(`${val}ms`).pipe(delay(val))))
  .subscribe((val) => console.log(val)); // 500ms后先打印500ms，再过1000ms打印1000ms，再过2000ms打印2000ms
```

switchMap

```js
import { timer, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// 立即发出值， 然后每5秒发出值
const source = timer(0, 5000);
// 当 source 发出值时切换到新的内部 observable，发出新的内部 observable 所发出的值
const example = source.pipe(switchMap(() => interval(500)));
// 输出: 0,1,2,3,4,5,6,7,8,9...0,1,2,3,4,5,6,7,8
const subscribe = example.subscribe((val) => console.log(val));
```

应用场景：**mergeMap 解决咱们接口依赖问题**。如：咱们需要调用 b 接口获取数据，b 接口的参数需要 a 接口返回。

```js
const user = of('kerwin'); // a接口
const project = of('big project'); // b接口

user
  .pipe(
    mergeMap((u) => {
      if (u === 'kerwin') {
        return project;
      }
    })
  )
  .subscribe((p) => {
    console.log(p);
  });
```

#### 4.3 forkJoin

当所有 observables 完成时，发出每个 observable 的最新值。类似咱们`Promise.all()`的方法。**注意**：如果一个 observable 发出多个值时，不应该用它。考虑使用`combineLatest`或`zip`的操作符。

注意：**如果内部 observable 不完成的话，forkJoin 永远不会发出值！**

```js
const all = forkJoin(of('hello'), of('world').pipe(delay(1000)));
const sub = all.subscribe((val) => console.log(val)); // 返回一个数组["hello", "world"]
```

#### 4.4 combinLatest

当任意 observable 发出值时，取出对应的最新值。（这个适用于一个 observable 可能发出多个值的情况，比如：有一个算式，总价=单价\*数量，每次单价和数量改变了，都是用最新的值去算总价）

```js
import { timer, combineLatest } from 'rxjs';

// timerOne 在1秒时发出第一个值，然后每4秒发送一次
const timerOne = timer(1000, 4000);
// timerTwo 在2秒时发出第一个值，然后每4秒发送一次
const timerTwo = timer(2000, 4000);
// timerThree 在3秒时发出第一个值，然后每4秒发送一次
const timerThree = timer(3000, 4000);

// 当一个 timer 发出值时，将每个 timer 的最新值作为一个数组发出
const combined = combineLatest(timerOne, timerTwo, timerThree);

const subscribe = combined.subscribe((latestValues) => {
  // 从 timerValOne、timerValTwo 和 timerValThree 中获取最新发出的值
  const [timerValOne, timerValTwo, timerValThree] = latestValues;
  /*
      示例:
    timerOne first tick: 'Timer One Latest: 1, Timer Two Latest:0, Timer Three Latest: 0
    timerTwo first tick: 'Timer One Latest: 1, Timer Two Latest:1, Timer Three Latest: 0
    timerThree first tick: 'Timer One Latest: 1, Timer Two Latest:1, Timer Three Latest: 1
  */
  console.log(
    `Timer One Latest: ${timerValOne},
     Timer Two Latest: ${timerValTwo},
     Timer Three Latest: ${timerValThree}`
  );
});
```

#### 4.5 zip

当所有的 observables 发出后，将它们的值作为数组发出。**如果一个 observable 发出了多个值，那么在发出第一个值后，便不会再次发出值了。**

```js
import { delay } from 'rxjs/operators';
import { of, zip, interval } from 'rxjs';

const sourceOne = of('Hello');
const sourceTwo = of('World!');
const sourceThree = of('Goodbye');
const sourceFour = interval(10);
// 一直等到所有 observables 都发出一个值，才将所有值作为数组发出
const example = zip(
  sourceOne,
  sourceTwo.pipe(delay(1000)),
  sourceThree.pipe(delay(2000)),
  sourceFour.pipe(delay(3000))
);
// 输出: ["Hello", "World!", "Goodbye", 0]
const subscribe = example.subscribe((val) => console.log(val));
```

### 5. 错误处理

#### 5.1 catchError && timeout

```js
import { throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
// 发出错误
const source = throwError('This is an error!');
// 优雅地处理错误，并返回带有错误信息的 observable
const example = source.pipe(catchError((val) => of(`I caught: ${val}`)));
// 输出: 'I caught: This is an error'
const subscribe = example.subscribe((val) => console.log(val));
```

`timeout`在指定时间间隔内不发出值就报错

```js
const a = of(1, 2);
a.pipe(
  delay(1000),
  timeout(500),
  catchError((error) => of('error occured' + error))
).subscribe((val) => {
  console.log(val);
});
```

### 6. 监听数据变动,动态渲染页面

service

```js
import { Observable, Subject } from 'rxjs';

private subject = new Subject<any>();

setMessage(message: object) {
  this.subject.next(message);
}

getMessage(): Observable<any> {
  return this.subject.asObservable();
}
```

调用

```js
this.messageService.setMessage({
  name: 'kerwin',
  age: 23
})

// 这里可以在ngOnInit时候对值进行订阅，再根据需求赋值动态渲染页面
ngOnInit() {
  this.subscription = this.messageService.getMessage().subscribe(user => {
    this.user = user;
  })
}
```

### 7. 如何取消 rxjs 的订阅

https://zju.date/do-not-forget-to-unsubscribe-in-angular/

### 8. 解析四种主题 Subject

#### Subject

必须在数据源发射一个数据之前，进行订阅`subscribe`，否者收到的值很有可能是`undefined`

```

```

#### BehaviorSubject

不管在数据源发射数据前后，只要订阅了。接受到的值就是**最新或初始化的一条值**

```ts
let subject2: BehaviorSubject<number> = new BehaviorSubject<number>(0);
subject2.next(100);
subject2.subscribe((res: number) => console.info('behavior-subjectA ', res));
subject2.next(200);
subject2.subscribe((res: number) => console.info('behavior-subjectB ', res));
subject2.next(300);
```

output

```
behavior-subjectA 100
behavior-subjectA 200
behavior-subjectB 200
behavior-subjectA 300
behavior-subjectB 300
```

#### ReplaySubject

和`BehaviorSubject`类似，不管在数据源发射数据前后，只要订阅了。接收到的值就是**之前的值加上目前最新的值**。参数可以最近的几次输出

```
// number控制最近的几次输出
let subject3: ReplaySubject<number> = new ReplaySubject<number>(2);
subject3.next(100);
subject3.next(200);
subject3.next(300);
subject3.subscribe((res: number) => console.info("replay-subjectA ", res));
```

output

```
replay-subjectA 200
replay-subjectA 300
```

#### AsyncSubject

AsyncSubject 和 BehaviorSubject`ReplaySubject`有些类似，但不同的是 AsyncSubject 只会存储数据流里的最后一条数据， 而且**只有在数据流 complete 时才会将值发布出去**。

```ts
let subject4: AsyncSubject<number> = new AsyncSubject<number>();
subject4.next(100);
subject4.next(100);
subject4.subscribe((res: number) => console.info('async-subjectA ', res));
subject4.next(300);
subject4.subscribe((res: number) => console.info('async-subjectB ', res));
subject4.next(400);
subject4.subscribe((res: number) => console.info('async-subjectC ', res));
subject4.complete();
subject4.subscribe((res: number) => console.info('async-subjectD ', res));
subject4.next(500);
```

output

```ts
async-subjectA 400
async-subjectB 400
async-subjectC 400
async-subjectD 400
```

### 9. 最佳实践

#### 9.1 模糊搜索 autocomplete + 节流

```html
<form nz-form [nzLayout]="'inline'" [formGroup]="validateForm">
  <nz-form-item>
    <nz-form-control nzErrorTip="Please input your username!">
      <nz-input-group nzPrefixIcon="user">
        <input formControlName="userName" nz-input placeholder="Username" />
      </nz-input-group>
    </nz-form-control>
  </nz-form-item>
</form>
```

```ts
constructor(private http: _HttpClient, private fb: FormBuilder) {}

ngOnInit() {
  this.validateForm = this.fb.group({
    userName: [null, []]
  });
  this.validateForm.get('userName').valueChanges
    .pipe(
      throttleTime(500),
      switchMap(data => this.http.post('api/autocomplete'))
    )
    .subscribe(() => {})
}
```

#### 9.2 input 搜索 debounce

```html
<input [(ngModel)]="word" (ngModelChange)="this.searchValue$.next($event)" />
```

```ts
import { Component, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import {
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  map,
} from 'rxjs/operators';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnDestroy {
  word: string;
  searchValue$ = new Subject<string>();
  destroy$ = new Subject<void>();

  constructor() {
    this.searchValue$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe((value) => {
        // 请求列表的接口..
        // this.getList(value);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```
