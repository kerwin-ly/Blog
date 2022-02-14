/**
 * @param {string} s
 * @return {boolean}
 */
var repeatedSubstringPattern = function (s) {
  var getNext = function (s) {
    let j = 0; // 最长相等前后缀长度
    let next = [0]; // 初始化，当子串长度为1时，最长相等前后缀长度为0
    for (let i = 1; i < s.length; i++) {
      // 如果下标i和下标j的值不相等
      while (j > 0 && s[i] !== s[j]) {
        j = next[j - 1]; // j设置为前一个下标的值。即前一个子串的最长相等前后缀长度
      }
      // 如果下标i和下标j的值相等，i,j指针后移，继续匹配下一位
      if (s[i] === s[j]) {
        j++;
      }
      next.push(j); // 更新前缀表
    }
    return next;
  };

  let next = getNext(s);
  // 同时满足下面两个条件：则表示字符串s可以由子串重复多次构成
  // 1.前缀表中最长相等前后缀长度不为0
  // 2.
  if (
    next[next.length - 1] &&
    s.length % (s.length - next[next.length - 1]) === 0
  ) {
    return true;
  }
  return false;
};
repeatedSubstringPattern('abab');