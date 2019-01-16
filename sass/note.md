## Sass
#### 1.安装配置
首先安装依赖：
```
npm install sass-loader --save-dev
```
```
npm install node-sass --save-dev
```
在vue-loader.conf.js中配置：
```
module.exports = {
  loaders: utils.cssLoaders({
    sourceMap: sourceMapEnabled,
    extract: isProduction,
    usePostCss: true, //使用
    scss: 'vue-style-loader!css-loader!sass-loader', // <style lang="scss">
    sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax' // <style lang="sass">
  }),
  cssSourceMap: sourceMapEnabled,
  cacheBusting: config.dev.cacheBusting,
  transformToRequire: {
    video: ['src', 'poster'],
    source: 'src',
    img: 'src',
    image: 'xlink:href'
  }
}
```
参考链接：https://bingzhe.github.io/2017/06/22/vue-cli-中使用sass/
全局引入sass:
找到build目录下的utils.js
```
scss: generateLoaders('sass')
```
替换为
```
scss: generateLoaders('sass').concat({
	loader: 'sass-resources-loader',
	options: {
		resources: path.resolve(__dirname, '../src/assets/your.scss')
	}
})
```
#### 2.常用方法
##### 1.mixin
sass中可用mixin定义一些代码片段，且可传参数，方便日后根据需求调用。从此处理css3的前缀兼容轻松便捷。sass中可用mixin定义一些代码片段，且可传参数，方便日后根据需求调用。从此处理css3的前缀兼容轻松便捷。

```
@mixin box-sizing ($sizing) {
    -webkit-box-sizing:$sizing;     
       -moz-box-sizing:$sizing;
            box-sizing:$sizing;
}
.box-border{
    border:1px solid #ccc;
    @include box-sizing(border-box);
}
```
##### 2.扩展、继承
sass可通过@extend实现代码组合，使代码更加简明

```
.message {
  border: 1px solid #ccc;
  padding: 10px;
  color: #333;
}

.success {
  @extend .message;
  border-color: green;
}

.error {
  @extend .message;
  border-color: red;
}

.warning {
  @extend .message;
  border-color: yellow;
}
```
##### 3.自定义函数
编写自己用的函数，如转换rem等

```
@function double($n) {
　　　　@return $n * 2;
　　}
　　#sidebar {
　　　　width: double(5px);
　　}
```
##### 4.计算属性
直接在scss中进行计算
```
height: 30vh + 30vh;
```
其他请参考链接：[http://www.ruanyifeng.com/blog/2012/06/sass.html](http://www.ruanyifeng.com/blog/2012/06/sass.html)



