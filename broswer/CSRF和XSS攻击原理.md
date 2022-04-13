# CSRF 和 XSS 攻击原理

本文主要讲述 CSRF 和 XSS 是如何攻击的，有哪些防范措施？

## CSRF

### 什么是 CSRF

CSRF（Cross-site request forgery）跨站请求伪造：攻击者诱导受害者进入第三方网站，在第三方网站中，向被攻击网站发送跨站请求。利用受害者在被攻击网站已经获取的注册凭证，绕过后台的用户验证，达到冒充用户对被攻击的网站执行某项操作的目的。

一个典型的 CSRF 攻击流程如下：

- 用户首先登录自己的邮箱网址www.gmail.com，并保留了登录凭证cookie

- 用户发现邮箱中有一封“惊喜邮件”，里面有一个第三方网站链接地址www.hacker.com，用于对其进行了访问

- 在www.hacker.com中向www.gmail.com发起了一个请求。**由于用户刚登录了www.gmail.com，发送请求时浏览器会默认携带gmail.com的Cookie**

- gmail.com 的后台收到请求后，对其进行用户验证，并确认是“用户”自己发送的请求，然后对数据进行处理和返回

- 攻击完成，www.hacker.com在受害者不知情的情况下，冒充受害者，让gmail.com的后台执行了自己的一些自定义操作

### 常见的 CSRF 的攻击类型

- GET 类型的 CSRF

GET 类型的 CSRF 利用非常简单，只需要一个 HTTP 请求，一般会这样利用：

```html
<img src="http://bank.example/withdraw?amount=10000&for=hacker" />
```

复制代码在受害者访问含有这个 img 的页面后，浏览器会自动向http://bank.example/withdraw?account=xiaoming&amount=10000&for=hacker发出一次HTTP请求。bank.example就会收到包含受害者登录信息的一次跨域请求。

- POST 类型的 CSRF

这种类型的 CSRF 利用起来通常使用的是一个自动提交的表单，如：

```html
<form action="http://bank.example/withdraw" method="POST">
  <input type="hidden" name="account" value="xiaoming" />
  <input type="hidden" name="amount" value="10000" />
  <input type="hidden" name="for" value="hacker" />
</form>
<script>
  document.forms[0].submit();
</script>
```

访问该页面后，表单会自动提交，相当于模拟用户完成了一次 POST 操作。

* 链接类型的CSRF

比起前面两种用户打开第三方网页就中招的情况，这种需要用户再手动点击一次链接才会触发。比如在论坛中发布一些图片或广告，诱骗用户点击。例如：

```html
 <a href="http://test.com/csrf/withdraw.php?amount=1000&for=hacker" taget="_blank">
  重磅消息！！
  </a>
```

### CSRF的特点

1. CSRF的攻击一般发生在第三方网站，而不是当前网站

2. 攻击利用受害者在被攻击网站的登录凭证，冒充用户提交操作，从而对数据进行获取/修改

3. 整个过程中攻击者无需获取到受害者的登陆凭证，而是通过浏览器自带的cookie策略

4. 跨站请求可以通过各种方式：图片URL、超链接、CORS、Form提交等等。部分请求方式可以直接嵌入在第三方论坛、文章中，难以进行追踪

### CSRF的防范

**CSRF通常从第三方网站发起**，被攻击的网站无法防止攻击发生，只能通过增强自己网站针对CSRF的防护能力来提升安全性。

针对上述特点，可以有以下的防护策略：

#### 1. 阻止其他未知域的访问

在HTTP协议中，每一次请求都会携带 `Origin Header` 或 `Referer Header`来判断是否是信任域发来的请求。

![csrf-header](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/browser/csrf-header.png)

注意，有两种情况HTTP请求头中不会携带`Origin Header`。

* **IE11同源策略**：IE 11 不会在跨站CORS请求上添加Origin标头，Referer头将仍然是唯一的标识

* **302重定向**：在302重定向之后Origin不包含在重定向的请求中，因为Origin可能会被认为是其他来源的敏感信息

但这种方式只能防止部分第三方网站发起的攻击，如果是本域发起的攻击。比如攻击者有权限在本域发布评论（含链接、图片等，统称UGC），那么它可以直接在本域发起攻击，这种情况下同源策略无法达到防护的作用。

#### 2. 使用Token替代Cookie验证方案

前面我们说到，攻击者是利用用户登录后的cookie凭证（攻击者无法获取cookie）和浏览器自动添加cookie的方式，来达到冒充用户的目的。

那么，我们可以在用户登录成功后，返回用户一个token凭证。然后在每次HTTP请求头中，手动添加token的方式来避免这种情况（比如：使用axios在request拦截器中，统一添加token）。服务端验证当前请求是否token合法，再进行数据返回/修改

这样，第三方无法获取token，在发送请求后就会被服务端拒绝。

#### 3. SameSite Cookie属性

我们也可以直接从源头上解决该问题，Google起草了一份草案来改进HTTP协议，通过设置`SameSite`，来标明这个Cookie只能作为第一方Cookie使用，不能作为第三方使用。

`SameSite`有两个值：Strict 和 Lax

* Strict：严格模式，表明这个Cookie在任何情况下，都不能作为第三方Cookie使用。

如在`www.gmail.com`中设置了如下Cookie:

```
Set-Cookie: foo=1; SameSite=Strict
```

如果通过`www.hacker.com`发起了对`www.gmail.com`的任何请求，foo这个Cookie都不会被包含在Cookie请求头中

* Lax：宽松模式，这个请求 改变了当前页面或者打开了新页面 且 同时是个GET请求，则这个Cookie可以作为第三方Cookie。但发起HTTP请求时，不会带上

如在`www.gmail.com`中设置了如下Cookie:

```
Set-Cookie: bar=2; SameSite=Lax
```

那么从`www.gmail.com`跳转到`www.hacker.com`时，Cookie会被带上。但在`www.hacker.com`发送HTTP请求时，其无法携带Cookie。

SameSite可以防范CSRF攻击，但也有其缺点。如下：

设置`Strict`时，有效避免了CSRF攻击，但也导致了用户在打开新窗口输入同样的地址时，无法携带Cookie，需要重新登录。当前域名的子域也无法获取Cookie。

设置`Lax`时，安全性不一定能得到保证。

同样其也有一定的兼容问题，目前仅新版Chrome和Firefox支持。其还不是太成熟，不过也可以作为一种解决方案。

## XSS

### 什么是XSS

Cross-Site Scripting（跨站脚本攻击）简称 XSS，是一种代码注入攻击。攻击者通过在目标网站上注入恶意脚本，使之在用户的浏览器上运行。利用这些恶意脚本，攻击者可获取用户的敏感信息如 Cookie、SessionID 等，进而危害数据安全。

### 常见的 XSS 的攻击类型

* 存储型XSS（服务端风险）

攻击者将恶意代码提交到数据库中，当用户获取服务端代码时，恶意代码也被返回。浏览器解析后，将其执行。

常见的有：论坛发帖、商品评论、用户私信等

* 反射型XSS（服务端风险）

攻击者构造出有恶意代码的特殊URL，当用户点击打开URL后，**服务端**从URL中取出恶意代码并拼接在HTML里面返回给客户端。客户端浏览器收到响应后执行解析，导致恶意代码也被执行。

常见的有：通过 URL 传递参数的功能，如网站搜索、跳转等。

* DOM型XSS（客户端风险）

攻击者构造出有恶意代码的特殊URL，当用户点击打开URL后，**前端JavaScript**从URL中取出恶意代码并执行。

### XSS的特点

XSS 攻击不同于CSRF攻击，其发生在当前站点，是页面被注入了恶意的代码（包括：JavaScript、LiveScript、Flash等）且被执行。导致攻击者可以获取用户的敏感信息，从而冒充用户发起HTTP请求。

### XSS的防范

通过前面的介绍可以得知，XSS 攻击有两大要素：**攻击者提交恶意代码** 和 **浏览器执行恶意代码**

**针对存储型和反射型XSS**

主要有两种处理方案：

* 纯前端渲染：将返回来的数据和HTML分离，由前端渲染静态HTML，在通过拿到服务端返回的数据，通过DOM API更新到页面上

* 使用专门的库（如:Node中的[jsxss](https://github.com/leizongmin/js-xss)）对HTML进行转义

**针对DOM型XSS**

DOM型XSS其实主要是由于网站前端JavaScript不够严谨导致被注入了恶意代码。如在使用`innerHtml`、`outerHtml`或`document.write()`时，一定要小心。

比如用 Vue/React/Angular 技术栈，使用 `v-html/dangerouslySetInnerHTML/DomSanitizer.bypassSecurityTrustHtml` 功能，就在前端 render 阶段避免 innerHTML、outerHTML 的 XSS 隐患。他会把一些认为有风险的脚本过滤掉。比如：<script></script>

**补充一些其他的防范措施**

* 禁止加载外域代码，防止复杂的攻击逻辑。

* 禁止外域提交，网站被攻击后，用户的数据不会泄露到外域。

* 禁止内联脚本执行（规则较严格，目前发现 GitHub 使用）。

* 禁止未授权的脚本执行（新特性，Google Map 移动版在使用）。

* 设置Cookie的`http-only`属性: 禁止 JavaScript 读取某些敏感 Cookie，攻击者完成 XSS 注入后也无法窃取此 Cookie。

* 验证码：防止脚本冒充用户提交危险操作。

最后附上一张掘金前端的Cookie设置

![safe-cookie](https://raw.githubusercontent.com/kerwin-ly/Blog/master/assets/imgs/browser/safe-cookie.png)

## 参考链接

[前端安全系列之二：如何防止CSRF攻击？](https://juejin.cn/post/6844903689702866952#heading-28)

[前端安全系列（一）：如何防止XSS攻击？](https://juejin.cn/post/6844903685122703367#heading-15)

[黑客入门基础 / XSS原理和攻防 / Web安全常识](https://www.bilibili.com/video/BV1s5411s7qd?spm_id_from=333.337.search-card.all.click)
