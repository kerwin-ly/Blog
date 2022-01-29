/**
 * @param {number[][]} matrix
 * @return {number[]}
 */
var spiralOrder = function (matrix) {
  let top = 0;
  let bottom = matrix.length - 1;
  let left = 0;
  let right = matrix[0].length - 1;
  let res = [];
  // 循环一圈
  while (left < right && top < bottom) {
    // 从左到右
    for (let i = left; i < right; i++) {
      res.push(matrix[top][i]);
    }
    // 从上到下
    for (let i = top; i < bottom; i++) {
      res.push(matrix[i][right]);
    }
    // 从右到左
    for (let i = right; i > left; i--) {
      res.push(matrix[bottom][i]);
    }
    // 从下到上
    for (let i = bottom; i > top; i--) {
      res.push(matrix[i][left]);
    }

    // 向中间缩进一层
    top++;
    right--;
    bottom--;
    left++;
  }
  // 当只剩下一行
  if (top === bottom) {
    for (let i = left; i <= right; i++) {
      res.push(matrix[top][i]);
    }
  }
  // 当只剩下一列
  else if (left === right) {
    for (let i = top; i <= bottom; i++) {
      res.push(matrix[i][left]);
    }
  }

  return res;
};
