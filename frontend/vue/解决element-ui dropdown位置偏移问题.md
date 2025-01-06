# 解决 element-ui dropdown 位置偏移问题

最近在维护一个老系统，发现我们在给`body`设置了`zoom`属性了，所有`element-ui`组件库的下拉框位置都错乱了。比如：`date-picker`, `el-select`等。如下图所示：

![el-wrong-pos1](https://github.com/kerwin-ly/Blog/blob/main/assets/imgs/issue/el-wrong-pos1.png)

下面介绍几种处理办法：

### 方法一：设置`popper-append-to-body=false`

这种办法是最简单直接的，设置为`false`后，下拉框位置将根据父容器的`el-select`框进行定位。而不是在`body`。但有个缺陷就是，可能被父元素的兄弟元素遮挡。尤其是在循环列表中使用 dropdown 时候。如下所示：

![el-wrong-pos2](https://github.com/kerwin-ly/Blog/blob/main/assets/imgs/issue/el-wrong-pos2.png)

### 方法二：修改`popper.js`计算位置的逻辑

在排查了element源码后，发现我们在页面上设置了`zoom`属性后，在计算bounding rect时收到了影响。如整体页面比例为`pageview * scale`。但在[element-ui popper.js](https://github.com/ElemeFE/element/blob/dev/src/utils/popper.js)文件中实际这里计算是以原始位置计算的 left, right 偏移，导致了偏差。

![el-wrong-pos3](https://github.com/kerwin-ly/Blog/blob/main/assets/imgs/issue/el-wrong-pos3.png)

所以在这里我们修改`popper.js`为如下：

```js
    /**
     * Get bounding client rect of given element
     * @function
     * @ignore
     * @param {HTMLElement} element
     * @return {Object} client rect
     */
    function getBoundingClientRect(element) {
        ...
        return {
            left: rect.left / document.body.style.zoom,
            top: rectTop / document.body.style.zoom,
            right: rect.right / document.body.style.zoom,
            bottom: rect.bottom / document.body.style.zoom,
            width: (rect.right - rect.left) / document.body.style.zoom,
            height: (rect.bottom - rectTop) / document.body.style.zoom
        };
    }

    function getOffsetRectRelativeToCustomParent(element, parent, fixed) {
        ...

        if (fixed) {
            var scrollParent = getScrollParent(parent);
            parentRect.top += scrollParent.scrollTop / document.body.style.zoom;
            parentRect.bottom += scrollParent.scrollTop / document.body.style.zoom;
            parentRect.left += scrollParent.scrollLeft / document.body.style.zoom;
            parentRect.right += scrollParent.scrollLeft / document.body.style.zoom;
        }

        ...
        return rect;
    }
```

最后还需要大家将`element-ui`重新打包，可以直接本地使用`patch-package`集成（参考这篇文章：https://juejin.cn/post/7356534347509497919）

或者fork代码仓库，自行修改后通过`npm publish`重新发布包。

如果需要测试，可以fork我的仓库：https://github.com/kerwin-ly/bv-element （ps: 注意node版本是**v11.15.0**）
