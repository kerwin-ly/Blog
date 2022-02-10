### 剑指 Offer 58 - II. 左旋转字符串(简单)

> LeetCode 地址：https://leetcode-cn.com/problems/zuo-xuan-zhuan-zi-fu-chuan-lcof/

### 题解

**解法 1**：申请额外空间，空间复杂度为 O(n)

1. 将字符串转换为数组，修改数组长度，多申明 n 个空间

2. 左指针从下标 0 开始往右移，右指针从`strArr.length - n`位置开始往右移。左右指针同时移动，每移动一步，将左指针的值赋值给右指针

3. 从 左指针结束位置 到 数组结尾拼接一个新的字符串

```js
/**
 * @param {string} s
 * @param {number} n
 * @return {string}
 */
var reverseLeftWords = function (s, n) {
  let strArr = Array.from(s);
  strArr.length = s.length + n; // 扩充数组长度
  let left = 0; // 左指针
  let right = strArr.length - n; // 右指针从倒数第n个位置开始
  while (left < n) {
    strArr[right] = strArr[left]; // 将左指针的值赋值给右指针的值
    left++;
    right++;
  }
  // 拼接字符串
  let word = '';
  for (let i = left; i < strArr.length; i++) {
    word += strArr[i];
  }
  return word;
};
```

**解法 2**：原地修改，空间复杂度为 O(1)。步骤如下，举例输入`s = abcdefg, n = 2`

1. 反转前 n 个字符，得到`bacdefg`

2. 反转从 n 到末尾的字符，得到`bagfedc`

3. 将整个字符串进行分反转，得到`cdefgab`

```js
/**
 * @param {string} s
 * @param {number} n
 * @return {string}
 */
var reverseLeftWords = function (s, n) {
  let strArr = Array.from(s);
  reverseStr(strArr, 0, n - 1); // 旋转前n个字符串
  reverseStr(strArr, n, strArr.length - 1); // 旋转第n个到数组结尾的字符串
  reverseStr(strArr, 0, strArr.length - 1); // 旋转所有字符串
  return strArr.join('');
};

var reverseStr = function (strArr, start, end) {
  let left = start; // 左指针
  let right = end; // 右指针
  while (left < right) {
    [strArr[left], strArr[right]] = [strArr[right], strArr[left]]; // 交换左右指针的值
    left++;
    right--;
  }
};
reverseLeftWords('abcdefg', 2);
```
