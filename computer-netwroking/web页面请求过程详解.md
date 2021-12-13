# 从浏览器输入URL到显示的过程详解

用户通过浏览器输入www.example.com网址，到页面显示的过程详解

### 1. 域名解析，获取 www.example.com 的IP地址
>域名解析分为 迭代解析 和 递归解析，下面讲述迭代解析流程

#### 前置概念

* 根DNS服务器：是互联网域名解析系统（DNS）中最高级别的域名服务器，负责返回顶级域的域名服务器地址

* 顶级域DNS服务器：每个顶级域（如：com、org、net、edu和gov）和国家的顶级域（如：uk、fr、ca和jp），都有TLD服务器（或服务器集群）。提供权威DNS服务器 IP地址

* 权威DNS服务器：在因特网上具有公共可访问主机 (如Web服务器)的组织机构必须提供公共可访问的DNS记录， 这些记录将这些主机名
字映射为IP地址。而一个组织机构`权威DNS服务器`收藏了这些DNS记录。其提供了域名和`IP`地址的映射关系。

#### 流程详解

1. 生成一个DNS查询报文，发送到`本地DNS服务器`，这一般由用户的互联网服务提供商 (ISP) 进行管理，例如有线 Internet 服务提供商、DSL 宽带提供商或公司网络。

2. ISP 的 `本地DNS服务器` 将 含有 www.example.com 主机名的查询报文 发送到 `根DNS服务器`。该`根DNS服务器`注意到`.com`前缀后，将 负责`.com`的`顶级域DNS服务器`的IP地址列表返回。

3. 获取到`顶级域DNS服务器`对应的IP地址列表后，ISP再次向这些`顶级域DNS服务器`之一发送查询报文。该`顶级域DNS服务器`注意到`example.com`前缀后，用`权威DNS服务器`的IP地址进行响应。

4. ISP 的`本地DNS服务器`选择一个`权威DNS服务器`（ Amazon Route 53 名称服务器）继续发送查询报文。

5. `权威服务器`（Amazon Route 53 名称服务器）在 example.com 托管区域中查找 www.example.com 记录（注意：共同实现DNS分布式数据库的所有DNS服务器存储了资源记录-Resource Record），获得相关值，例如，Web 服务器的 IP 地址 (192.0.2.44)，并将 IP 地址返回至 `本地DNS服务器`。

![域名解析-迭代](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/internet/dns-analyze.png)

### 2. 应用层：发送HTTP请求

#### 前置概念

* TCP socket：它是四元组（源IP + 源端口 + 目标IP + 目标端口）的一个具有本地意义的标识，代表两个进程的会话关系。其为了减少层间接口的字段传输和压力。

#### 流程详解

在应用层生成用于数据请求的`TCP Socket`，并通过层间接口`Socket Api`将HTTP请求报文发送到`传输层`