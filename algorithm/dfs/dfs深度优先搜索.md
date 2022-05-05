## DFS（深度优先搜索）

## 相关题目

### 岛屿问题

[200. 岛屿数量(中等)](https://github.com/kerwin-ly/Blog/blob/master/algorithm/dfs/200.%20%E5%B2%9B%E5%B1%BF%E6%95%B0%E9%87%8F(%E4%B8%AD%E7%AD%89).md)

[695. 岛屿的最大面积(中等)](https://github.com/kerwin-ly/Blog/blob/master/algorithm/dfs/695.%20%E5%B2%9B%E5%B1%BF%E7%9A%84%E6%9C%80%E5%A4%A7%E9%9D%A2%E7%A7%AF(%E4%B8%AD%E7%AD%89).md)

[463. 岛屿的周长(中等)](https://github.com/kerwin-ly/Blog/blob/master/algorithm/dfs/463.%20%E5%B2%9B%E5%B1%BF%E7%9A%84%E5%91%A8%E9%95%BF(%E4%B8%AD%E7%AD%89).md)

### 其他

[22. 括号生成(中等)](https://github.com/kerwin-ly/Blog/blob/master/algorithm/backtracking/22.%20%E6%8B%AC%E5%8F%B7%E7%94%9F%E6%88%90(%E4%B8%AD%E7%AD%89).md)

## 总结

### 岛屿问题

网格结构要比二叉树结构稍微复杂一些，它其实是一种简化版的图结构。要写好网格上的 DFS 遍历，我们首先要理解二叉树上的 DFS 遍历方法，再类比写出网格结构上的 DFS 遍历。我们写的二叉树 DFS 遍历一般是这样的：

```js
function traverse(TreeNode root) {
    // 判断 base case
    if (root == null) {
        return;
    }
    // 访问两个相邻结点：左子结点、右子结点
    traverse(root.left);
    traverse(root.right);
}
```

第一个要素是访问相邻结点。二叉树的相邻结点非常简单，只有左子结点和右子结点两个。二叉树本身就是一个递归定义的结构：一棵二叉树，它的左子树和右子树也是一棵二叉树。那么我们的 DFS 遍历只需要递归调用左子树和右子树即可。

第二个要素是 判断 base case。一般来说，二叉树遍历的 base case 是 root == null。这样一个条件判断其实有两个含义：一方面，这表示 root 指向的子树为空，不需要再往下遍历了。另一方面，在 root == null 的时候及时返回，可以让后面的 root.left 和 root.right 操作不会出现空指针异常。

对于网格上的 DFS，我们完全可以参考二叉树的 DFS，写出网格 DFS 的两个要素：

首先，网格结构中的格子有多少相邻结点？答案是上下左右四个。对于格子 (row, col) 来说（row 和 col 分别代表行坐标和列坐标），四个相邻的格子分别是 (row-1, col)、(row+1, col)、(row, col-1)、(row, col+1)。换句话说，网格结构是「四叉」的。

![dfs1](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/algorithm/dfs1.jpeg)

其次，网格 DFS 中的 base case 是什么？从二叉树的 base case 对应过来，应该是网格中不需要继续遍历、grid[row][col] 会出现数组下标越界异常的格子，也就是那些超出网格范围的格子。

![dfs2](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/algorithm/dfs2.jpeg)

所以一个针对“岛屿网格”的 dfs 的代码可以简单总结如下（视题目情况而定）：

```js
let dfs = function (grid, row, col) {
  // 如果当前格子，超出四条边的范围，退出
  if (row >= grid.length || row < 0 || col >= grid[0].length || col < 0) {
    return;
  }
  // 如果当前格子是海水或者已走过，退出
  if (grid[row][col] !== "1") {
    return;
  }
  grid[row][col] = "0"; // 已走过的格子标记为”海洋“
  dfs(grid, row - 1, col); // 向上走（行数减1）
  dfs(grid, row + 1, col); // 向下走
  dfs(grid, row, col - 1); // 向左走
  dfs(grid, row, col + 1); // 向右走
};
```

参考地址：https://leetcode-cn.com/problems/number-of-islands/solution/dao-yu-lei-wen-ti-de-tong-yong-jie-fa-dfs-bian-li-/