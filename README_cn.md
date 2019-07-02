<p align="center">
	<a href="https://jshow.org" target="_blank">
		<img width="100" src="https://jshow.org/images/jshow.png" alt="jShow logo" />
	</a>
</p>

[![jshow-ci]][jshow-travisci]
[![jshow-co]][jshow-codecov]
[![jshow-dm]][jshow-npm]
[![jshow-ver]][jshow-npm]

[![jshow-lic]][jshow-npm]
[![jshow-ct]][jshow-chat]

[jshow-github]: https://github.com/j-show/jshow
[jshow-npm]: https://npmjs.com/package/jshow
[jshow-chat]: https://gitter.im/j-show/jshow
[jshow-travisci]: https://travis-ci.org/j-show/jshow
[jshow-codecov]: https://codecov.io/github/j-show/jshow?branch=master
[jshow-site]: https://jshow.org
[jshow-wiki]: https://wiki.jshow.org
[jshow-example]: https://example.jshow.org
[jshow-forum]: https://forum.jshow.org

[jshow-ci]: https://img.shields.io/travis/j-show/jshow/master.svg
[jshow-co]: https://img.shields.io/codecov/c/github/j-show/jshow/master.svg
[jshow-ver]: https://img.shields.io/npm/v/jshow.svg
[jshow-lic]: https://img.shields.io/npm/l/jshow.svg
[jshow-dm]: https://img.shields.io/npm/dm/jshow.svg
[jshow-ct]: https://img.shields.io/gitter/room/j-show/jshow.svg

[jshow-svr-url]: https://github.com/j-show/jshow-svr
[jshow-svr-npm]: https://npmjs.com/package/jshow-svr
[jshow-svr-ver]: https://img.shields.io/npm/v/jshow-svr.svg

[jshow-socket-url]: https://github.com/j-show/jshow-socket
[jshow-socket-npm]: https://npmjs.com/package/jshow-socket
[jshow-socket-ver]: https://img.shields.io/npm/v/jshow-socket.svg

[jshow-nano-url]: https://github.com/j-show/jshow-nano
[jshow-nano-npm]: https://npmjs.com/package/jshow-nano
[jshow-nano-ver]: https://img.shields.io/npm/v/jshow-nano.svg

---

# 支持jShow

jShow是一个MIT许可的开源项目, 其持续的开发完全是在这些令人感激的[支持者](https://github.com/j-show/jShow/blob/master/BACKERS.md)的支持下实现的。如果您想加入他们, 请考虑:

- [通过Patreon，成为支持者或赞助商](https://www.patreon.com/jshow).
- [通过OpenCollective，成为支持者或赞助商](https://opencollective.com/jshow).

### 以上两种支持方式有什么不同?

通过Patreon捐赠的资金直接用于支持 [jShow][jshow-github] 项目，并让核心团队成员通过全职的方式推动项目。通过OpenCollective捐赠的资金会以全透明方式进行项目管理, 并将用于补偿核心团队成员的工作和费用或赞助社区活动。您的名称/徽标将通过在任何一个平台上捐款获得适当的认可和曝光。

---

# 介绍

jShow是一个**开放式工具框架**。他被设计成同时支持`WebBrowser`、`Node.js`环境，它由`核心工具库`、`外挂组件`、`搭建助手`组成。

- **`核心工具库`** 提供多种便捷的工具函数，他就像一个瑞士军刀，能帮助你简化代码，任何人都能用它创建属于自己的**工具库**，我们鼓励大家提交代码来丰富完善工具库。

- **`外挂组件`** 自动识别环境模式，遵循轻组件原则，按需加载以下组件
	- `万能转换` 万能转换函数，提供各种类型的傻瓜式转换函数
	- `正则校验` 各种常用的校验函数
	- `时间计算` 扩展时间转换函数，并集成一些便捷函数
	- `字符计算` 扩展字符串处理函数，针对双字节字符进行特殊识别
	- `加解密` 常用的加解密计算函数，包含哈希、CRC等常用数据计算函数
	- `模块加载` 模块化开发框架，以async函数为核心，异步加载页面模块
	- `前端路由` 通过简单配置，建立前端路由结构，轻松开发单页应用
	- `DOM操作` 简易DOM操作对象，全面兼容 [jQuery](https://jquery.com/) 操作方式
	- `手势识别` 针对Mobile端，通过设定将简单手势的串联识别，识别复杂手势

- **`搭建助手`** jshow作为整个jShow家族的核心库，提供了全局安装方式，可以通过参数生成对应框架的样例工程。
	- [jshow-svr][jshow-svr-url] 提供HTTP/HTTPS/HTTP2后端服务，全面兼容 [Koa@2](https://koajs.com/) 插件，集成多语言解决方案，RESTful API、MVC代码模式
	- [jshow-socket][jshow-socket-url] 提供Socket数据流框架，支持TCP/UDP/WebSocket数据流解析操作
	- [jshow-nano][jshow-nano-url] 提供硬件操作，业务流程控制，支持GPIO/SPI/串口/蓝牙操作，集成部分gps、4g、QR模块读写

---


# 生态圈

| 项目 | 状态&版本 | 说明 |
|---|---|---|
| [jShow][jshow-github] | [![jshow-ver]][jshow-npm] | jShow 生态圈 核心库 |
| [jshow-svr][jshow-svr-url] | [![jshow-svr-ver]][jshow-svr-npm] | HTTP服务框架，支持HTTP/HTTPS/HTTP2 |
| [jshow-socket][jshow-socket-url] | [![jshow-socket-ver]][jshow-socket-npm] | Socket服务框架，支持TCP/UDP/WebSocket |
| [jshow-nano][jshow-nano-url] | [![jshow-nano-ver]][jshow-nano-npm] | ARM控制框架，支持GPIO/SPI/serial/bluetooth |

---

# 目录说明

```
──
 └── gulpfile.js     //gulp主文件
 └── build.json      //模块列表配置
 └── dist            //输出目录
 └── src             //项目源文件目录
 │ └── jShow.js      //核心主文件
 │ └── Generator.js  //搭建助手主文件
 │ └── loading.js    //外挂组件加载配置
 │ └── bin           //搭建助手脚本目录
 │ └── core          //核心工具库目录
 │ └── lib           //外挂组件目录
 └── test            //mocha测试文件
```

---

# 安装

- `代码模式`

	```javascript
	const jShow = require("jshow");
	
	console.log(jShow.version());
	```
	
- `搭建模式`
	
	```bash
	$ npm install -g jshow
	
	// 生成RESTful api项目
	$ jshow svr init --package a /data/example_api
	```

---

# 文档

我们提供[在线样例][jshow-example]，还可以通过阅读[Wiki][jshow-wiki]来了解相关说明, visit [jshow.org][jshow-site].

---

# 问题

如需问题和支持, 请使用 [官方论坛][jshow-forum] 或 [社区聊天][jshow-chat].
这个仓库的[Issue](https://github.com/j-show/jShow/issues)，**只用于错误报告和功能请求**

---

# License

[MIT](http://opensource.org/licenses/MIT)

---

**Copyright (c) 2019 jShow.org**
