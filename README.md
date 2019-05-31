<p align="center">
	<a href="https://jshow.org" target="_blank">
		<img width="100" src="https://jshow.org/images/jshow.png" alt="jShow logo" />
	</a>
</p>

[![jshow-ci]][jshow-circleci]
[![jshow-co]][jshow-codecov]
[![jshow-dm]][jshow-npm]
[![jshow-ver]][jshow-npm]

[![jshow-lic]][jshow-npm]
[![jshow-ct]][jshow-chat]

[jshow-url]: https://github.com/j-show/jshow
[jshow-npm]: https://npmjs.com/package/jshow
[jshow-chat]: https://jshow.org/chat
[jshow-circleci]: https://circleci.com/gh/j-show/jshow/tree/dev
[jshow-codecov]: https://codecov.io/github/vuejs/vue?branch=dev
[jshow-ci]: https://img.shields.io/circleci/project/github/j-show/jshow/dev.svg
[jshow-co]: https://img.shields.io/codecov/c/github/j-show/jshow/dev.svg
[jshow-ver]: https://img.shields.io/npm/v/jshow.svg
[jshow-lic]: https://img.shields.io/npm/l/jshow.svg
[jshow-dm]: https://img.shields.io/npm/dm/jshow.svg
[jshow-ct]: https://img.shields.io/badge/chat-on%20discord-7289da.svg

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

# Supporting

jShow is an MIT-Licensed open source project with its ongoing development made possible entirely by the support of these awesome [backers](https://github.com/j-show/jShow/blob/master/BACKERS.md). If you'd like to join them, please consider:

- [Become a backer or sponsor on Patreon](https://www.patreon.com/jshow).
- [Become a backer or sponsor on Open Collective](https://opencollective.com/jshow).

### What's the difference between Patreon and OpenCollective?

Funds donated via Patreon go directly to support [jShow][jshow-url] You's full-time work on jShow. Funds donated via OpenCollective are managed with transparent expenses and will be used for compensating work and expenses for core team members or sponsoring community events. Your name/logo will receive proper recognition and exposure by donating on either platform.

---

# Introduction

jShow is an **open tool framework**. It's designed to support both `WebBrowser`, `Node.js` environment, it's composed of `core tool library`,`external components`,`generator helper`.

- **`core tool library`** It's like a Swiss army knife. It helps you simplify your code. Anyone can use it to create their own **tool library**.

- **`external components`** Automatically identify environmental patterns, follow the light component principle, load the following components as needed
	- `any to conver` conversion function, provide various types of fool conversion function
	- `check & regexp` a variety of common checking functions
	- `calc date` Extend the time conversion function and integrate some convenience functions
	- `calc string` Extended string processing function for special recognition of double-byte characters
	- `encryption` Common encryption and decryption calculation function, including hash, CRC and other common data calculation function
	- `module loading framework` Modular development framework, with async function as the core, asynchronous load page module
	- `front-end routing` Through simple configuration, the front-end routing structure is established and the single-page application is developed easily
	- `DOM operation` Simple DOM operation object, fully compatible with [jQuery](https://jquery.com/) operation mode
	- `gesture recognition` For Mobile terminal, simple gestures can be identified in series by setting to recognize complex gestures

- **`generator helper`** As the core library of the entire jShow's Family, jshow provides a global installation method that can generate sample projects of the corresponding framework through parameters.
	- [jshow-svr][jshow-svr-url] Provide HTTP/HTTPS/HTTP2 backend services, fully compatible with [Koa@2](https://koajs.com/) middleware, integrated multilingual solutions, RESTful API, MVC and other code mode.
	- [jshow-socket][jshow-socket-url] Socket data flow framework is provided to support TCP/UDP/WebSocket data flow parsing operations.
	- [jshow-nano][jshow-nano-url] Provide hardware operation, business process control, support GPIO/SPI/serial/bluetooth operation, integrate part of GPS,4g,QR module reading and writing

---


# Ecosystem

| Project | Status | Description |
|---|---|---|
| [jshow][jshow-url] | [![jshow-ver]][jshow-npm] | jShow ecosystem core |
| [jshow-svr][jshow-svr-url] | [![jshow-svr-ver]][jshow-svr-npm] | HTTP Service Framework, compatible with HTTP/HTTPS/HTTP2 |
| [jshow-socket][jshow-socket-url] | [![jshow-socket-ver]][jshow-socket-npm] | Socket Service Framework, compatible with TCP/UDP/WebSocket |
| [jshow-nano][jshow-nano-url] | [![jshow-nano-ver]][jshow-nano-npm] | ARM Control Framework, compatible with GPIO/SPI/serial/bluetooth |

---

# Folder

```
──
 └── gulpfile.js     //gulp script file
 └── build.json      //modules configuration
 └── dist            //output folder
 └── src             //source folder
 │ └── jShow.js      //main script file
 │ └── Generator.js  //generator script file
 │ └── loading.js    //external components configuration
 │ └── core          //core tool library folder
 │ └── lib           //external components folder
 └── test            //mocha test folder
```

---

# Install

- `Code Mode`

	```javascript
	const jShow = require("jshow");
	
	console.log(jShow.version());
	```
	
- `Generator Mode`
	
	```bash
	$ npm install -g jshow
	
	// create RESTful api project
	$ jshow svr init --package a /data/example_api
	```

---

# Documentation


To check out [live examples](https://jshow.org/example) and [wiki docs](https://github.com/j-show/jShow/wiki), visit [jshow.org](https://jshow.org).

---

# Questions

For questions and support please use [the official forum](https://jshow.org/forum) or [community chat](https://jshow.org/chat). 
The [issue](https://github.com/j-show/jShow/issues) list of this repo is **exclusively** for bug reports and feature requests.

---

# License

[MIT](http://opensource.org/licenses/MIT)

---

**Copyright (c) 2019 jShow.org**