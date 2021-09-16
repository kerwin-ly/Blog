"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
var providers = [];
var instanceMap = new Map();
function Injectable() {
    return function (_constructor) {
        providers.push(_constructor);
        return _constructor;
    };
}
// 鉴权服务
var AuthService = /** @class */ (function () {
    function AuthService() {
    }
    AuthService.prototype.checkPermission = function () {
        console.log('check permission in AuthSerivce');
    };
    AuthService = __decorate([
        Injectable()
    ], AuthService);
    return AuthService;
}());
// 本地存储服务
var LocalStorageService = /** @class */ (function () {
    function LocalStorageService() {
    }
    LocalStorageService.prototype.save = function () {
        console.log('save user in LocalStorageService');
    };
    LocalStorageService = __decorate([
        Injectable()
    ], LocalStorageService);
    return LocalStorageService;
}());
// 存储服务
var StorageService = /** @class */ (function () {
    function StorageService(localStorageService) {
        this.localStorageService = localStorageService;
    }
    StorageService.prototype.save = function () {
        this.localStorageService.save();
    };
    StorageService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [LocalStorageService])
    ], StorageService);
    return StorageService;
}());
// 用户服务
var UserService = /** @class */ (function () {
    function UserService(authService, storageService) {
        this.authService = authService;
        this.storageService = storageService;
        this.authService.checkPermission();
        this.storageService.save();
    }
    UserService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [AuthService,
            StorageService])
    ], UserService);
    return UserService;
}());
// 创建实例
function create(target) {
    var dependencies = Reflect.getMetadata('design:paramtypes', target);
    console.log('dependencies', dependencies);
    console.log('providers', providers);
    var args = (dependencies || []).map(function (dep) {
        if (!hasProvider(dep)) {
            throw new Error(dep.name + " has no provider!");
        }
        var cache = instanceMap.get(dep);
        if (cache) {
            return cache;
        }
        var instance;
        // 如果参数有依赖项，递归创建依赖项实例
        console.log('length', dep.length);
        if (dep.length) {
            instance = create(dep);
            instanceMap.set(dep, instance);
        }
        else {
            // 参数没有依赖项，直接创建实例
            instance = new dep();
            instanceMap.set(dep, instance);
        }
        return instance;
    });
    return new (target.bind.apply(target, __spreadArray([void 0], args, false)))();
}
// 判断需要注入
function hasProvider(dep) {
    return providers.includes(dep);
}
create(UserService);
