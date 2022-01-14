var lengthOfLongestSubstring = function (s) {
  // 使用滑动窗口处理
  if (!s.length) {
    return 0;
  }
  // let left = 0;
  let right = -1; // 从-1开始，指针右移
  let max = 0;
  const map = new Map();
  for (let i = 0; i < s.length; i++) {
    // left = i; // 左指针右移
    // if (map.get(s[i])) {
    //   // 如果左指针移动中，发现值重复，则删除该值，继续移动左指针
    //   map.delete(s[i]);
    // }
    if (i !== 0) {
      map.delete(s[i - 1]);
    }
    while (!map.get(s[right + 1]) && right + 1 < s.length) {
      map.set(s[right + 1], (right + 1).toString());
      right++; // 指针右移
    }

    max = Math.max(max, right - i + 1);
  }
  return max;
};
lengthOfLongestSubstring('aab');
