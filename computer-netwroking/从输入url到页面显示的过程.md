# 从输入url到页面显示的过程

面试中，我们常常会被问到：从输入url到页面显示，中间发生了什么？

之前，我对这个问题一直是一知半解的状态，不够深入。于是，我利用闲暇时间，阅读了[《计算机网络自顶向下方法-第七版》](https://github.com/kerwin-ly/books/blob/master/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C-%E8%87%AA%E9%A1%B6%E5%90%91%E4%B8%8B%E6%96%B9%E6%B3%95%E7%AC%AC%E4%B8%83%E7%89%88.pdf)的书籍，结合[中科大郑烇老师的教学视频](https://www.bilibili.com/video/BV1JV411t7ow?from=search&seid=18425226436912830366&spm_id_from=333.337.0.0)，对计算机网络的知识有了更深刻的理解，便有了这篇文章的分享。如果你想快速了解这本书相关的知识点，可以看下我之前写的[读书笔记](https://github.com/kerwin-ly/Blog/blob/master/computer-netwroking/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C%E8%87%AA%E9%A1%B6%E5%90%91%E4%B8%8B%E6%96%B9%E6%B3%95-%E8%AF%BB%E4%B9%A6%E7%AC%94%E8%AE%B0.md)

下面，我们进入正题，来了解 **从输入url到页面显示，中间发生了什么？**

## 1. 域名解析

域名解析是将域名转换为对应的IP的过程。

### 1.1 缓存机制

在域名解析前，首先会从浏览器缓存、系统缓存、路由器缓存、ISP缓存中递归的查找域名对应的IP地址。如果上述缓存中，均没有找到对应的IP地址，则发起域名解析请求。

### 1.2 域名的层级关系

在说域名解析前，我们需要了解DNS服务器的层级关系，其主要分为根DNS服务器、顶级域DNS服务器、权威DNS服务器。

* 根DNS服务器：是互联网域名解析系统（DNS）中最高级别的域名服务器，负责返回顶级域的域名服务器地址

* 顶级域DNS服务器：每个顶级域（如：com、org、net、edu和gov）和国家的顶级域（如：uk、fr、ca和jp），都有TLD服务器（或服务器集群）。提供权威DNS服务器 IP地址

* 权威DNS服务器：在因特网上具有公共可访问主机 (如Web服务器)的组织机构必须提供公共可访问的DNS记录， 这些记录将这些主机名
字映射为IP地址。而一个组织机构`权威DNS服务器`收藏了这些DNS记录。其提供了域名和`IP`地址的映射关系。

### 1.3 域名解析流程

下面，我们通过一个`www.example.com`的来对细节进行阐述：

1. 生成一个DNS查询报文，发送到`本地DNS服务器`，这一般由用户的互联网服务提供商 (ISP) 进行管理，例如有线 Internet 服务提供商、DSL 宽带提供商或公司网络。

2. ISP 的 `本地DNS服务器` 将 含有 www.example.com 主机名的查询报文 发送到 `根DNS服务器`。该`根DNS服务器`注意到`.com`前缀后，将 负责`.com`的`顶级域DNS服务器`的IP地址列表返回。

3. 获取到`顶级域DNS服务器`对应的IP地址列表后，ISP再次向这些`顶级域DNS服务器`之一发送查询报文。该`顶级域DNS服务器`注意到`example.com`前缀后，用`权威DNS服务器`的IP地址进行响应。

4. ISP 的`本地DNS服务器`选择一个`权威DNS服务器`（ Amazon Route 53 名称服务器）继续发送查询报文。

5. `权威服务器`（Amazon Route 53 名称服务器）在 example.com 托管区域中查找 www.example.com 记录并获得对应的IP地址，并将 IP 地址返回至 `本地DNS服务器`。

![域名解析-迭代](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/internet/dns-analyze.png)
