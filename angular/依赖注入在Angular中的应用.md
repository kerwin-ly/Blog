# 依赖注入在Angular中的应用

本文主要讲述`依赖注入`在`Angular`中的应用，其中包括

* useFactory、useClass和useValue不同类型`provider`的应用场景

* useExisting(别名类提供者)和muti(多提供商)

* @Optional()、@Self()、@SkipSelf()、@Host() 修饰符

* 不同层级`Dependency Injection`的意义

如果你还不清楚什么是`依赖注入`，可以先看下这篇文章[如何实现一个依赖注入功能]()

### useFactory

某天，咱们接到一个需求，需要实现一个`本地存储`的功能，并将其`注入`到`Angular`应用中，使其可以在系统中随意调用

首先编写服务类`storage.service.ts`，实现其存储功能
```ts
// storage.service.ts
export class StorageService {
  get(key: string) {
    return JSON.parse(localStorage.getItem(key) || '{}') || {};
  }

  set(key: string, value: ITokenModel | null): boolean {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  }

  remove(key: string) {
    localStorage.removeItem(key);
  }
}
```

如果你马上在`user.component.ts`中尝试使用
```ts
// user.component.ts
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class CourseCardComponent  {
  constructor(private storageService: StorageService) {
    ...
  }
  ...
}
```

你应该会看到这样的一个错误：

```shell
NullInjectorError: No provider for StorageService!
```

显而易见，我们并没有将`StorageService`添加到 `Angular的依赖注入系统`中。`Angular`无法获取`StorageService`依赖项的`Provider`，也就无法实例化创建这个类

那么，接下来，我们便手动添加一个`Provider`。修改`storage.service.ts`文件如下

```ts
// storage.service.ts
export class StorageService {
  get(key: string) {
    return JSON.parse(localStorage.getItem(key) || '{}') || {};
  }

  set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  remove(key: string) {
    localStorage.removeItem(key);
  }
}

// 添加工厂函数，实例化StorageService
export storageServiceProviderFactory(): StorageService {
  return new StorageService();
}
```

通过上述代码，我们已经有了`Provider`。那么接下来的问题，就是如果让`Angular`每次扫描到`StorageService`这个依赖项的时候，让其去执行`storageServiceProviderFactory`方法，来创建实例

这就引出来了下一个知识点`Injection Token`

在一个服务类中，我们常常需要添加多个依赖项，来保证服务的可用。而`Injection Token`是各个依赖项的唯一标识，它让`Angular`的依赖注入系统能准确的找到各个依赖项的`Provider`。

接下来，我们手动添加一个`Injection Token`
```ts
// storage.service.ts
import { InjectionToken } from '@angular/core';

export class StorageService {
  get(key: string) {
    return JSON.parse(localStorage.getItem(key) || '{}') || {};
  }

  set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  remove(key: string) {
    localStorage.removeItem(key);
  }
}

export storageServiceProviderFactory(): StorageService {
  return new StorageService();
}

// 添加StorageServiced的Injection Token
export const STORAGE_SERVICE_TOKEN = new InjectionToken<StorageService>('AUTH_STORE_TOKEN');
```

ok，我们已经有了`StorageService`的`Provider`，也有了`StorageService`的`Injection Token`。接下来，我们需要一个配置，让`Angular`的`依赖注入系统`能够对其进行识别，在扫描到`StorageService`(Dependency)的时候，根据`STORAGE_SERVICE_TOKEN`（Injection Token）去找到对应的`storageServiceProviderFactory`(Provider)，然后实例化

```ts
// user.module.ts
@NgModule({
  imports: [
    ...
  ],
  declarations: [
    ...
  ],
  providers: [
    {
      provide: STORAGE_SERVICE_TOKEN, // 与依赖项关联的InjectionToken，用于控制工厂函数的调用
      useFactory: storageServiceProviderFactory, // 当需要创建并注入依赖项时，调用该工厂函数
      deps: [] // 如果StorageService还有依赖项，这里添加
    }
  ]
})
export class UserModule { }
```

到这里，我们完成了`依赖`的实现。最后，还需要让`Angular`知道在哪里`注入`。`Angular`提供了 `@Inject`装饰器来识别

```ts
// user.component.ts
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class CourseCardComponent  {
  constructor(@Inject(STORAGE_SERVICE_TOKEN) private storageService: StorageService) {
    ...
  }
  ...
}
```

到此，我们便可以在`user.component.ts`调用`StorageService`里面的方法了

### useClass

emm...你是否觉得上述的写法过于复杂了，而在实际开发中，我们大多数场景是无需手动创建`Provider`和`Injection Token`的。如下：

```ts
// user.component.ts
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class CourseCardComponent  {
  constructor(private storageService: StorageService) {
    ...
  }
  ...
}

// storage.service.ts
@Injectable({ providedIn: 'root' })
export class StorageService {}

// user.module.ts
@NgModule({
  imports: [
    ...
  ],
  declarations: [
    ...
  ],
  providers: [StorageService]
})
export class UserModule { }
```

在`user.component.ts`，我们舍弃了`@Inject`装饰器，直接添加依赖项`private storageService: StorageService`，这得益于`Angular`对`Injection Token`的设计。

`Injection Token`不一定必须是一个`injection token object`，只要保证它在运行时环境中能够识别对应的唯一`依赖项`即可。换句话说，你可以用`类名`即运行时中的`构造函数名称`来作为`依赖项`的`injection token`。所以，我们可以省略创建`Injection Token`这一步，直接使用`类名`作为`Injection Token`

```ts
// user.module.ts
@NgModule({
  imports: [
    ...
  ],
  declarations: [
    ...
  ],
  providers: [{
    provide: StorageService, // 使用构造函数名作为Injection Token
    useFactory: storageServiceProviderFactory,
    deps: []
  }]
})
export class UserModule { }
```

注意：**由于`Angular`的依赖注入系统是在`运行时环境`中能根据`Injection Token`识别依赖项，在进行依赖注入的。所以这里不能使用`interface`名称作为`Injection Token`，因为其只存在于`Typescript`语言的编译期，并不存在于运行时中。而在运行时中，`类名`编译成了`构造函数名`，可以使用**

接下来，我们可以使用`useClass`替换`useFactory`，如下：

```ts
...
providers: [{
  provide: StorageService,
  useClass: StorageService,
  deps: []
}]
...
```

当使用`useClass`时，`Angular`会将后面的值当作一个`构造函数`，在运行时环境中，直接执行`new`指令进行实例化，这也无需我们再手动创建 `Provider`了

当然，基于`Angular`的`依赖注入设计`，我们可以写得更简单
```ts
...
providers: [StorageService]
...
```

直接写入`类名`到`providers`数组中，`Angular`会识别其是一个`构造函数`，然后检查函数内部，创建一个工厂函数去查找其`构造函数`中的`依赖项`，最后再实例化

`useClass`还有一个特性是，`Angular`会根据`依赖项`在`Typescript`中的类型定义，作为其`运行时`的`Injection Token`去自动查找`Provider`。所以，我们也无需使用`@Inject`装饰器来告诉`Angular`在哪里注入了

你可以简写如下
```ts
  ...
  // 无需手动注入 ：constructor(@Inject(StorageService) private storageService: StorageService)
  constructor(private storageService: StorageService) {
    ...
  }
  ...

```

### useValue

完成`本地存储服务`的实现后，我们又收到了一个新需求，研发老大希望提供一个配置文件，来存储`StorageService`的一些默认行为

我们先创建一个配置
```ts
const storageConfig = {
  suffix: 'app_' // 添加一个存储key的前缀
  expires: 24 * 3600 * 100 // 过期时间，毫秒戳
}
```

如果希望将这个配置对象注入到`Angular`中，很明显，`useFactory`和`useClass`都不太适用。

而`useValue`则可以cover住这种场景。其可以是一个普通变量，也可以是一个对象形式。

```ts
// config.ts
export interface STORAGE_CONFIG = {
  suffix: string;
  expires: number;
}

export const STORAGE_CONFIG_TOKEN = new InjectionToken<STORAGE_CONFIG>('storage-config');
export const storageConfig = {
  suffix: 'app_' // 添加一个存储key的前缀
  expires: 24 * 3600 * 100 // 过期时间，毫秒戳
}

// user.module.ts
@NgModule({
  ...
  providers: [
    StorageService,
    {
      provide: STORAGE_CONFIG_TOKEN,
      useValue: storageConfig
    }
  ],
  ...
})
export class UserModule {}
```

在`user.component.ts`组件中，通过配置，获取存储的值
```ts
// user.component.ts
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class CourseCardComponent  {
  constructor(private storageService: StorageService, @Inject(STORAGE_CONFIG_TOKEN) private storageConfig: StorageConfig) {
    ...
  }
  
  getKey(): void {
    const { suffix } = this.storageConfig;
    console.log(this.storageService.get(suffix + 'demo'));
  }
}
```

### multi和useExisting

某些场景下，我们需要一个`依赖项`有多个不同的值。比如：开发一个表单控件，它在表单中可能存在多个，每个控件存储有不同的值

```ts
@Component({
  selector: 'new-input',
  templateUrl: "new-input.component.html",
  styleUrls: ["new-input.component.less"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR, // Angular内置接受多个值的injection token
      multi: true, // 设置为true，否则injection token中存储的值会被替换
      useExisting: NewInputComponent
    }
  ]
})
export class NewInputComponent implements ControlValueAccessor {

}
```

### 参考链接

[Angular Dependency Injection: Complete Guide](https://blog.angular-university.io/angular-dependency-injection/)

[Angular 中的依赖注入](https://angular.cn/guide/dependency-injection)
