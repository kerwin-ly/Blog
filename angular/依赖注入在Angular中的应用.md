# 依赖注入在Angular中的应用

本文主要讲述`依赖注入`在`Angular`中的应用，其中包括

* `ModuleInjector`和`ElementInjector`不同层次注入器的意义

* @Optional()、@Self()、@SkipSelf()、@Host() 修饰符的使用

* useFactory、useClass、useValue和useExisting不同类型`provider`的应用场景

* muti(多提供商)的应用场景

如果你还不清楚什么是`依赖注入`，可以先看下这篇文章[如何实现一个依赖注入功能]()

### ModuleInjector和ElementInjector层级注入器的意义

在`Angular`中有两个注入器层次结构

* ModuleInjector —— 使用 @NgModule() 或 @Injectable() 的方式在模块中注入

* ElementInjector —— 在 @Directive() 或 @Component() 的 providers 属性中进行配置

我们通过一个实际例子来解释两种注入器的应用场景，比如：设计一个展示用户信息的卡片组件

#### ModuleInjector

我们使用`user-card.component.ts`来显示组件，用`UserService`来存取该用户的信息

```ts
// user-card.component.ts
@Component({
  selector: 'user-card.component.ts',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.less']
})
export class UserCardComponent {
  ...
}

// user.service.ts
@Injectable({
  providedIn: "root"
})
export class UserService {
  ...
}
```

上述代码是通过`@Injectable`添加到`根模块`中，`root`即根模块的别名。其等价于下面的代码
```ts
// user.service.ts
export class UserService {
  ...
}

// app.module.ts
@NgModule({
  ...
  providers: [UserService], // 通过providers添加
})
export class AppModule {}
```

当然，如果你觉得`UserService`只会在`UserModule`模块下使用的话，你大可不必将其添加到`根模块`中，添加到所在模块即可

```ts
// user.service.ts
@Injectable({
  providedIn: UserModule
})
export class UserService {
  ...
}
```

`@Injectable()`和`@NgModule()`除了使用方式不同外，还有一个很大的区别是：

>使用 @Injectable() 的 providedIn 属性优于 @NgModule() 的 providers 数组，因为使用 @Injectable() 的 providedIn 时，优化工具可以进行`摇树优化 Tree Shaking`，从而删除你的应用程序中未使用的服务，以减小捆绑包尺寸。

我们通过一个例子来解释上面的概述。随着业务的增长，我们扩展了`UserService1`和`UserService2`，但由于某些原因，`UserService2`一直未被使用。

如果通过`@NgModule()`的`providers`引入依赖项，我们需要在`user.module.ts`文件中引入对应的`UserService1`和`UserService2`文件资源，然后在`providers`数组中添加`UserService1`和`UserService2`。这就导致`tree shaker`错误的认为这个`UserService2`已经被引用了。无法进行`摇树优化`。代码示例如下：

```ts
// user.module.ts
import UserService1 from './user1.service.ts';
import UserService2 from './user2.service.ts';
@NgModule({
  ...
  providers: [UserService1, UserService2], // 通过providers添加
})
export class UserModule {}
```

那么，如果通过`@Injectable({providedIn: UserModule})`这种方式，我们实际是在`UserService1`和`UserService2`服务类定义了一个`provider`，在服务类所在文件引用了`UserModule`。而在`user.module.ts`并没有任何文件引用，所以，当`UserService2`所在文件没有被作为依赖项引用时，即可被优化掉。代码示例如下：

```ts
// user1.service.ts
import UserModule from './user.module.ts';
@Injectable({
  providedIn: UserModule
})
export class UserService1 {
  ...
}
```

#### ElementInjector

在了解完`ModuleInjector`后，我们继续通过刚才的例子讲述`ElementInjector`。

最初，我们系统中的用户只有一个，我们也只需要一个组件和一个`UserService`来存取这个用户的信息即可

```ts
// user-card.component.ts
@Component({
  selector: 'user-card.component.ts',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.less']
})
export class UserCardComponent {
  ...
}

// user.service.ts
@Injectable({
  providedIn: "root"
})
export class UserService {
  ...
}
```

所以，我们通过上述代码，将`UserService`定义到`根模块`中，它仅会实例化一次。

如果这时候系统中有多个用户，每个`用户卡片组件`里的`UserService`应存取该用户的信息即可。如果还是按照上述的方法，`UserService`只会生成一个实例。那么就可能出现，张三存了数据后，李四去取数据，取到的是张三的结果。

那么，我们有办法实例化多个`UserService`，来让每个用户的数据存取操作各自独立么？

答案是有的。我们需要在`user.component.ts`文件中使用`ElementInjector`，将`UserService`的`provider`添加即可。如下：

```ts
// user-card.component.ts
@Component({
  selector: 'user-card.component.ts',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.less'],
  providers: [UserService]
})
export class UserCardComponent {
  ...
}
```

如果要解释上述的现象，就需要说到`Angular`的`Components and Module Hierarchical Dependency Injection`。

>在组件中使用依赖项时，`Angular`会优先在该组件的`providers`中寻找，判断该依赖项是否有匹配的`provider`。如果有，则直接使用并实例化。如果没有，则查找父组件的`providers`，如果还是没有，则继续找父级的父级，直到`根组件`(app.component.ts)。如果在`根组件`中找到了匹配的`provider`，且已实例化，则直接返回该实例。未实例化，则进行创建。如果`根组件`仍未找到，则开始从`原组件`所在的`module`开始查找，如果`原组件`所在`module`不存在，则继续查找父级`module`，直到`根模块`（app.module.ts）。最后，仍未找到则报错`No provider for xxx`。

### @Optional()、@Self()、@SkipSelf()、@Host() 修饰符的使用

TODO





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

这就引出来了下一个知识点`InjectionToken`

在一个服务类中，我们常常需要添加多个依赖项，来保证服务的可用。而`InjectionToken`是各个依赖项的唯一标识，它让`Angular`的依赖注入系统能准确的找到各个依赖项的`Provider`。

接下来，我们手动添加一个`InjectionToken`
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

// 添加StorageServiced的InjectionToken
export const STORAGE_SERVICE_TOKEN = new InjectionToken<StorageService>('AUTH_STORE_TOKEN');
```

ok，我们已经有了`StorageService`的`Provider`，也有了`StorageService`的`InjectionToken`。接下来，我们需要一个配置，让`Angular`的`依赖注入系统`能够对其进行识别，在扫描到`StorageService`(Dependency)的时候，根据`STORAGE_SERVICE_TOKEN`（InjectionToken）去找到对应的`storageServiceProviderFactory`(Provider)，然后实例化

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

emm...你是否觉得上述的写法过于复杂了，而在实际开发中，我们大多数场景是无需手动创建`Provider`和`InjectionToken`的。如下：

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

在`user.component.ts`，我们舍弃了`@Inject`装饰器，直接添加依赖项`private storageService: StorageService`，这得益于`Angular`对`InjectionToken`的设计。

`InjectionToken`不一定必须是一个`InjectionToken object`，只要保证它在运行时环境中能够识别对应的唯一`依赖项`即可。换句话说，你可以用`类名`即运行时中的`构造函数名称`来作为`依赖项`的`InjectionToken`。所以，我们可以省略创建`InjectionToken`这一步，直接使用`类名`作为`InjectionToken`

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
    provide: StorageService, // 使用构造函数名作为InjectionToken
    useFactory: storageServiceProviderFactory,
    deps: []
  }]
})
export class UserModule { }
```

注意：**由于`Angular`的依赖注入系统是在`运行时环境`中能根据`InjectionToken`识别依赖项，在进行依赖注入的。所以这里不能使用`interface`名称作为`InjectionToken`，因为其只存在于`Typescript`语言的编译期，并不存在于运行时中。而在运行时中，`类名`编译成了`构造函数名`，可以使用**

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

`useClass`还有一个特性是，`Angular`会根据`依赖项`在`Typescript`中的类型定义，作为其`运行时`的`InjectionToken`去自动查找`Provider`。所以，我们也无需使用`@Inject`装饰器来告诉`Angular`在哪里注入了

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

### useExisting

如果我们需要基于一个已存在的`provider`来创建一个新的`provider`，或需要重命名一个已存在的`provider`时，可以用`useExisting`属性来处理。比如：创建一个`angular`的表单控件，其在一个表单中会存在多个，每个表单控件存储不同的值。我们可以基于已有的表单控件`provider`来创建

```ts
// new-input.component.ts
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'new-input',
  exportAs: 'newInput',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NewInputComponent), // 这里的NewInputComponent已经声明了，但还没有被定义。无法直接使用，使用forwardRef可以创建一个间接引用，Angular在后续在解析该引用
      multi: true
    }
  ]
})
export class NewInputComponent implements ControlValueAccessor {
  ...
}
```

### multi多服务提供商

某些场景下，我们需要一个`InjectionToken`初始化多个`provider`。比如：在使用拦截器的时候，我们希望在`default.interceptor.ts`之前添加一个用于token校验的`JWTInterceptor`

```ts
...
const NET_PROVIDES = [
  { provide: HTTP_INTERCEPTORS, useClass: DefaultInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: JWTInterceptor, multi: true }
];
...
```

multi: 为`false`时，`provider`的值会被覆盖；设置为`true`，将生成多个`provider`并与唯一`InjectionToken` `HTTP_INTERCEPTORS`关联。最后可以通过`NG_VALUE_ACCESSOR`获取所有`provider`的值

### @Optional()、@Self()、@SkipSelf()、@Host()


### 参考链接

[Angular Dependency Injection: Complete Guide](https://blog.angular-university.io/angular-dependency-injection/)

[Angular 中的依赖注入](https://angular.cn/guide/dependency-injection)
