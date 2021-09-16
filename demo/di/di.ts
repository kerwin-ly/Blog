import 'reflect-metadata';

const providers: any[] = [];
const instanceMap = new Map();

function Injectable() {
  return function (_constructor: any) {
    providers.push(_constructor);
    return _constructor;
  };
}

// 鉴权服务
@Injectable()
class AuthService {
  checkPermission(): void {
    console.log('check permission in AuthSerivce');
  }
}

// 本地存储服务
@Injectable()
class LocalStorageService {
  save(): void {
    console.log('save user in LocalStorageService');
  }
}

// 存储服务
@Injectable()
class StorageService {
  constructor(private localStorageService: LocalStorageService) {}

  save(): void {
    this.localStorageService.save();
  }
}

// 用户服务
@Injectable()
class UserService {
  constructor(
    private authService: AuthService,
    private storageService: StorageService
  ) {
    this.authService.checkPermission();
    this.storageService.save();
  }
}

// 创建实例
function create(target: any) {
  const dependencies = Reflect.getMetadata('design:paramtypes', target);
  const args = (dependencies || []).map((dep: any) => {
    if (!hasProvider(dep)) {
      throw new Error(`${dep.name} has no provider!`);
    }

    const cache = instanceMap.get(dep);
    if (cache) {
      return cache;
    }

    let instance;
    // 如果参数有依赖项，递归创建依赖项实例
    if (dep.length) {
      instance = create(dep);
      instanceMap.set(dep, instance);
    } else {
      // 参数没有依赖项，直接创建实例
      instance = new dep();
      instanceMap.set(dep, instance);
    }
    return instance;
  }) as any;
  return new target(...args);
}

// 判断需要注入
function hasProvider(dep: any): boolean {
  return providers.includes(dep);
}

create(UserService);
