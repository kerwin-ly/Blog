### 剑指 Offer 11. 旋转数组的最小数字(简单)

> LeetCode 地址：https://leetcode-cn.com/problems/xuan-zhuan-shu-zu-de-zui-xiao-shu-zi-lcof/

### 题解

通过读题，我们可以提取以下两条信息

- 1.是对*非递减排序的数组*进行一次*旋转*。那么当我们知道在哪个坐标开始旋转，临近的元素即是最小元素。
- 2.旋转点的左侧或右侧一定是一个*非递减排序的数组*

通过数组的中间值和最右侧值进行比较:

- 如果最右侧值`right`大于中间值`mid`，则表明右侧是一个`非递减序列`，左侧存在旋转点，即最小值存在于左半区

- 如果最右侧值`right`小于中间值`mid`，则表明右侧不是一个`非递减序列`，右侧存在旋转点，即最小值存在于右半区

- 如果最右侧值等于中间值，则无法判断哪侧存在旋转。如：`[1, 2, 2, 2, 2]，[2, 2, 2]`等情况

```js
/**
 * @param {number[]} numbers
 * @return {number}
 */
var minArray = function (numbers) {
  let left = 0;
  let right = numbers.length - 1;
  let mid = null;
  while (left <= right) {
    mid = Math.floor((right - left) / 2) + left;
    if (numbers[mid] > numbers[right]) {
      left = mid + 1; // 当前值大于右指针值时，右边（不包括当前位置）一定存在旋转。所以从当前位置的下一个位置开始查找[mid + 1, right]
    } else if (numbers[mid] < numbers[left]) {
      right = mid; // 当前值小于最左边值时，左边（包括当前位置）可能存在旋转。从[left, mid]区间继续查找
    } else {
      right = right - 1; // 当前值等于目标值时，不确定左侧或右侧存在最小值。但是将右指针位置删除，一定不影响当前最小值的判定。所以右指针左移
    }
  }
  return numbers[left];
};
```

### 类似题目

[33. 搜索旋转排序数组(中等)](https://leetcode.cn/problems/search-in-rotated-sorted-array/submissions/)