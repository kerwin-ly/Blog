### 剑指 Offer 05.替换空格(简单)

> LeetCode 地址：https://leetcode-cn.com/problems/ti-huan-kong-ge-lcof/

### 题解

该题有两种解法：

- 新建数组求解：遍历字符串，如果匹配到空字符串则向新数组中 push`%20`，否则 push 原值。时间复杂度 O(n)，空间复杂度 O(n)。

- 原地修改：左指针从`s.length - 1`开始，往左移动。右指针从`s.length - 1 + 2 * 空格数量`位置开始，往左移动。如果左指针位置匹配到空格，则将右指针位置开始的，前 3 个位置修改为`%20`；如果左指针未匹配到空格，则将左指针的值添加到右指针位置上。

图解参考地址：https://leetcode-cn.com/problems/ti-huan-kong-ge-lcof/solution/mian-shi-ti-05-ti-huan-kong-ge-ji-jian-qing-xi-tu-/

```js
/**
 * @param {string} s
 * @return {string}
 */
var replaceSpace = function (s) {
  const arr = Array.from(s);
  let count = 0; // 空格数量
  // 获取空格数量，修改数组长度
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === ' ') {
      count++;
    }
  }
  let left = arr.length - 1;
  let right = arr.length - 1 + count * 2; //  将空格换成%20后的数组长度
  while (left >= 0) {
    // 左指针匹配到空格时，从右指针位置开始往前三个位置进行替换
    if (arr[left] === ' ') {
      arr[right--] = '0';
      arr[right--] = '2';
      arr[right--] = '%';
      left--;
    } else {
      //  未匹配到空格，则将左指针的值赋值给右指针
      arr[right] = arr[left];
      right--;
      left--;
    }
  }
  return arr.join('');
};
```
