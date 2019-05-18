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