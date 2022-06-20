# 深入理解Angular依赖注入（二）：依赖注入在Angular中的应用

本文通过实际案例，带大家了解`依赖注入`在`Angular`中的应用和部分实现原理，其中包括

- `useFactory`、`useClass`、`useValue` 和 `useExisting` 不同提供商的应用场景

- `ModuleInjector`和`ElementInjector`不同层次注入器的意义

- `@Injectable()`和`@NgModule()`中定义`provider`的区别

- `@Optional()`、`@Self()`、`@SkipSelf()`、`@Host()` 修饰符的使用

- `muti`(多提供商)的应用场景

如果你还不清楚什么是`依赖注入`，可以先看下这篇文章[深入理解Angular依赖注入（一）：什么是依赖注入](https://juejin.cn/post/7012237021607362597/#heading-3)

## 一、useFactory、useClass、useValue 和 useExisting 不同类型`provider`的应用场景

下面，我们通过实际例子，来对几个提供商的使用场景进行说明。

### 1. useFactory 工厂提供商

某天，咱们接到一个需求：实现一个`本地存储`的功能，并将其`注入`到`Angular`应用中，使其可以在系统中全局使用

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

显而易见，我们并没有将`StorageService`添加到 `Angular的依赖注入系统`中。`Angular`无法获取`StorageService`依赖项的`Provider`，也就无法实例化这个类，更没法调用类中的方法。

接下来，我们本着缺撒补撒的理念，手动添加一个`Provider`。修改`storage.service.ts`文件如下

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

ok，我们已经有了`StorageService`的`Provider`和`InjectionToken`。

接下来，我们需要一个配置，让`Angular`的`依赖注入系统`能够对其进行识别，在扫描到`StorageService`(Dependency)的时候，根据`STORAGE_SERVICE_TOKEN`（InjectionToken）去找到对应的`storageServiceProviderFactory`(Provider)，然后创建这个依赖项的实例。如下，我们在`module`中的`@NgModule()`装饰器中进行配置：

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
      deps: [] // 如果StorageService还有其他依赖项，这里添加
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

### 2. useClass 类提供商

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

下面，我们来对上述的这种`简写模式`进行剖析。

在`user.component.ts`，我们舍弃了`@Inject`装饰器，直接添加依赖项`private storageService: StorageService`，这得益于`Angular`对`InjectionToken`的设计。

>`InjectionToken`不一定必须是一个`InjectionToken object`，只要保证它在**运行时环境**中能够识别对应的唯一`依赖项`即可。所以，在这里，你可以用`类名`即运行时中的`构造函数名称`来作为`依赖项`的`InjectionToken`。省略创建`InjectionToken`这一步骤。

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

**注意**：由于`Angular`的`依赖注入系统`是在`运行时环境`中根据`InjectionToken`识别依赖项，进行依赖注入的。所以这里不能使用`interface`名称作为`InjectionToken`，因为其只存在于`Typescript`语言的编译期，并不存在于运行时中。而对于`类名`来说，其在运行时环境中以`构造函数名`体现，可以使用。

接下来，我们可以使用`useClass`替换`useFactory`，其实也能达到创建实例的效果，如下：

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

这也就是我们平常开发中，最常见的一种写法。

### 3. useValue 值提供商

完成`本地存储服务`的实现后，我们又收到了一个新需求，研发老大希望提供一个配置文件，来存储`StorageService`的一些默认行为

 我们先创建一个配置

```ts
const storageConfig = {
  suffix: 'app_' // 添加一个存储key的前缀
  expires: 24 * 3600 * 100 // 过期时间，毫秒戳
}
```

如果希望将这个配置对象注入到`Angular`中，很明显，`useFactory`和`useClass`都不太适用。

而`useValue`则可以 cover 住这种场景。其可以是一个普通变量，也可以是一个对象形式。

配置方法如下：

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

在`user.component.ts`组件中，直接使用`配置对象`：

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

### 4. useExisting 别名提供商

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

## 二、ModuleInjector 和 ElementInjector 层级注入器的意义

在`Angular`中有两个注入器层次结构

- ModuleInjector —— 使用 @NgModule() 或 @Injectable() 的方式在模块中注入

- ElementInjector —— 在 @Directive() 或 @Component() 的 providers 属性中进行配置

我们通过一个实际例子来解释两种注入器的应用场景，比如：设计一个展示用户信息的卡片组件

### 1. ModuleInjector 模块注入器

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

如果你足够细心，会发现上述例子中，我们既可以通过在当前`service`文件中的`@Injectable({ provideIn: xxx })`定义`provider`，也可以在其所属`module`中的`@NgModule({ providers: [xxx] })`定义。那么，他们有什么区别呢？

`@Injectable()`和`@NgModule()`除了使用方式不同外，还有一个很大的区别是：

> 使用 @Injectable() 的 providedIn 属性优于 @NgModule() 的 providers 数组，因为使用 @Injectable() 的 providedIn 时，优化工具可以进行`摇树优化 Tree Shaking`，从而删除你的应用程序中未使用的服务，以减小捆绑包尺寸。

我们通过一个例子来解释上面的概述。随着业务的增长，我们扩展了`UserService1`和`UserService2`两个服务，但由于某些原因，`UserService2`一直未被使用。

如果通过`@NgModule()`的`providers`引入依赖项，我们需要在`user.module.ts`文件中引入对应的`user1.service.ts`和`user2.service.ts`文件，然后在`providers`数组中添加`UserService1`和`UserService2`引用。而由于`UserService2`所在文件在`module`文件中被引用，导致`Angular`中的`tree shaker`错误的认为这个`UserService2`已经被使用了。无法进行`摇树优化`。代码示例如下：

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

那么，如果通过`@Injectable({providedIn: UserModule})`这种方式，我们实际是在`服务类`自身文件中引用了`use.module.ts`，并为其定义了一个`provider`。无需在`UserModule`中在重复定义，也就不需要在引入`user2.service.ts`文件了。所以，当`UserService2`没有被依赖时，即可被优化掉。代码示例如下：

```ts
// user2.service.ts
import UserModule from './user.module.ts';
@Injectable({
  providedIn: UserModule
})
export class UserService2 {
  ...
}
```

#### 2. ElementInjector 组件注入器

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

注意：上述代码将`UserService`被添加到`根模块`中，它仅会被实例化一次。

如果这时候系统中有多个用户，每个`用户卡片组件`里的`UserService`需存取对应用户的信息。如果还是按照上述的方法，`UserService`只会生成一个实例。那么就可能出现，张三存了数据后，李四去取数据，取到的是张三的结果。

那么，我们有办法实例化多个`UserService`，让每个用户的数据存取操作隔离开么？

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

通过上述代码，每个`用户卡片组件`都会实例化一个`UserService`，来存取各自的用户信息。

如果要解释上述的现象，就需要说到`Angular`的`Components and Module Hierarchical Dependency Injection`。

> 在组件中使用依赖项时，`Angular`会优先在该组件的`providers`中寻找，判断该依赖项是否有匹配的`provider`。如果有，则直接实例化。如果没有，则查找父组件的`providers`，如果还是没有，则继续找父级的父级，直到`根组件`(app.component.ts)。如果在`根组件`中找到了匹配的`provider`，会先判断其是否有存在的实例，如果有，则直接返回该实例。如果没有，则执行实例化操作。如果`根组件`仍未找到，则开始从`原组件`所在的`module`开始查找，如果`原组件`所在`module`不存在，则继续查找父级`module`，直到`根模块`（app.module.ts）。最后，仍未找到则报错`No provider for xxx`。

## 三、@Optional()、@Self()、@SkipSelf()、@Host() 修饰符的使用

在`Angular`应用中，当`依赖项`寻找`provider`时，我们可以通过一些修饰符来**对搜索结果进行容错处理**或**限制搜索的范围**。

### 1. @Optional()

> 通过`@Optional()`装饰服务，表明让该服务可选。即如果在程序中，没有找到服务匹配的`provider`，也不会程序崩溃，报错`No provider for xxx`，而是返回`null`。

```ts
export class UserCardComponent {
  constructor(@Optional private userService: UserService) {}
}
```

### 2. @Self()

> 使用`@Self()`让`Angular`仅查看当前组件或指令的`ElementInjector`。

如下，`Angular`只会在当前`UserCardComponent`的`providers`中搜索匹配的`provider`，如果未匹配，则直接报错。`No provider for UserService`。

```ts
// user-card.component.ts
@Component({
  selector: 'user-card.component.ts',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.less'],
  providers: [UserService],
})
export class UserCardComponent {
  constructor(@Self() private userService?: UserService) {}
}
```

### 3. @SkipSelf()

> `@SkipSelf()`与`@Self()`相反。使用`@SkipSelf()`，`Angular`在父`ElementInjector`中而不是当前`ElementInjector`中开始搜索服务.

```ts
// 子组件 user-card.component.ts
@Component({
  selector: 'user-card.component.ts',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.less'],
  providers: [UserService], // not work
})
export class UserCardComponent {
  constructor(@SkipSelf() private userService?: UserService) {}
}

// 父组件 parent-card.component.ts
@Component({
  selector: 'parent-card.component.ts',
  templateUrl: './parent-card.component.html',
  styleUrls: ['./parent-card.component.less'],
  providers: [
    {
      provide: UserService,
      useClass: ParentUserService, // work
    },
  ],
})
export class ParentCardComponent {
  constructor() {}
}
```

### 4. @Host()

> `@Host()`使你可以在搜索`provider`时将当前组件指定为注入器树的最后一站。这和`@Self()`类似，即使树的更上级有一个服务实例，`Angular`也不会继续寻找。

## 四、multi 多服务提供商

某些场景下，我们需要一个`InjectionToken`初始化多个`provider`。比如：在使用拦截器的时候，我们希望在`default.interceptor.ts`之前添加一个  用于 token 校验的`JWTInterceptor`

```ts
...
const NET_PROVIDES = [
  { provide: HTTP_INTERCEPTORS, useClass: DefaultInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: JWTInterceptor, multi: true }
];
...
```

multi: 为`false`时，`provider`的值会被覆盖；设置为`true`，将生成多个`provider`并与唯一`InjectionToken` `HTTP_INTERCEPTORS`关联。最后可以通过`HTTP_INTERCEPTORS`获取所有`provider`的值

## 相关文章

[# 深入理解Angular依赖注入（一）：什么是依赖注入](https://juejin.cn/post/7012237021607362597)

## 参考链接

[Angular Dependency Injection: Complete Guide](https://blog.angular-university.io/angular-dependency-injection/)

[Angular 中的依赖注入](https://angular.cn/guide/dependency-injection)
