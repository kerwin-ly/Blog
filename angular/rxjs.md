# Rxjs
## 安装配置
```bash
npm install rxjs
```

## 学习笔记
### 1. 异步处理
在service中通过`new Obervable`来观察属性，对应的页面中通过`subscribe`进行订阅。

`rx.service.js`
```js
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RxService {
  constructor() { }
  getRxData() {
    return new Observable((observer) => {
      setTimeout(() => {
        observer.next({ // 可以执行多次next方法
          name: 'kerwin'
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
    const sub = rxData.subscribe((data) => {
      console.log(data);
    });
    sub.unsubscribe(); // 取消订阅
  }
}
```

### 2. of和from
* of(...items) —— 返回一个 Observable 实例，它用同步的方式把参数中提供的这些值一起发出来。

* from(iterable) —— 把它的参数转换成一个 Observable 实例。 该方法通常用于把一个数组转换成一个（发送多个值的）可观察对象。（挨个发出来）
```js
const myObservar = {
  next: x => console.log('Observer got a next value: ' + x),
  error: err => console.error('Observer got an error: ' + err),
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
