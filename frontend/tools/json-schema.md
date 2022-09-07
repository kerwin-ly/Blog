# 使用 typescript-json-schema 校验接口

> 在我们的开发中，常常会出现这种情况。某天，页面突然崩了，发现 js 在报错。打包上去的代码一般来说都是压缩过的，你可能花费很长一段时间，去排查了问题所在。然而发现...是后台没有返回某个关键字段引起的。这会浪费很多不必要的时间。如果想解决类似的问题，推荐使用其`typescript-json-schema`。在开发时候，约束其接口必须返回的字段。如不返回，可以直接抛错并打印其返回值。（也可以用`sentry`之类的，去日志中查看）。本文主要讲述其在`angular7`中的使用

## 安装 && 配置

1.全局安装`typescript-json-schema`

```shell
npm install -g typescript-json-schema
```

2.本地安装`jsonschema`

```shell
npm install jsonschema --save-dev
```

3.根据`./src/app/shared/interfaces/*.d.ts`文件生成`schema.json`，并存放到`./src/app/shared/interfaces/schema.json`位置上

```json
"scripts": {
    "start": "npm run json && npm run color-less && ng serve -o --proxy-config proxy.config.json",
    "json": "typescript-json-schema './src/app/shared/interfaces/*.d.ts' '*' -o ./src/app/shared/interfaces/schema.json --id=api --required --strictNullChecks"
}
```

4.在 angular 项目中，`src/typings.d.ts`文件中添加声明，防止编译不识别，报错

```
...
declare module '*.json';
```

## 使用

1.请求接口，携带额外`schema`参数

```js
getModelList(params): Observable<any> {
    return this.http.post('ml/training/records', params, { schema: 'ModeList' }); // 这里的`ModelList`对应其目标文件'./src/app/shared/interfaces/*.d.ts'中的`interface`接口名称
  }

```

2.http 拦截器中校验接口

```js
    import schema from '../interfaces/schema.json'; // 引入生成的schema.json文件

    import { Validator } from 'jsonschema'; // 引入验证器
    import { tap } from 'rxjs/operators';

    interface Schema {
        schema: string;
    }

    const validator = new Validator();
    validator.addSchema(schema, '/api');

    /**
    * 校验数据结构
    * @param {*} option
    * @returns
    * @memberof RequestService
    */
    checkSchema(option: Schema) {
        return res => {
            if (option && option.schema) {
                const result = validator.validate(res, {
                    $ref: 'api#/definitions/' + option.schema
                });
                // 校验失败，数据不符合预期
                if (!result.valid) {
                    console.debug('data is ', res);
                    console.debug('errors', result.errors.map(item => item.toString()));
                    return throwError({
                        code: 'xxxx',
                        msg: '接口缺少关键字段'
                    })
                }
            }
        };
    }

    post(url: string, data?: any, option?: Schema): any {
        return this.http.post(url, data).pipe(tap(this.checkSchema(option));
    }


```

## 注意

1.在咱们目标文件中(`./src/app/shared/interfaces/*.d.ts`)，不能存在变量路径。

```js
import convertTimeToDate from "@shared/utils"; // 存在变量，报错: @shared无法识别
import convertTimeToDate from "../../shared/utils"; // 改为相对路径即可
```
