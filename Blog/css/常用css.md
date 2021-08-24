控制文本最多显示多少行，后续省略号表示

```css
overflow: hidden;
text-overflow: ellipsis;
display: -webkit-box;
-webkit-line-clamp: 2; // 2行后添加省略号
/* autoprefixer: ignore next */
-webkit-box-orient: vertical;
```
