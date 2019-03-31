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

---

# Introduction

jShow is an **open tool framework**. It's designed to support both `WebBrowser`, `Node.js` environment, it's composed of `core tool library` and `external components`.

- **`core tool library`** It's like a Swiss army knife. It helps you simplify your code. Anyone can use it to create their own **tool library**.

- **`external components`** Automatically identify environmental patterns, follow the light component principle, load the following components as needed
	- `module loading framework` Modular development framework, with async function as the core, asynchronous load page module
	- `front-end routing` Through simple configuration, the front-end routing structure is established and the single-page application is developed easily
	- `DOM operation` Simple DOM operation object, fully compatible with [jQuery](https://jquery.com/) operation mode
	- `gesture recognition` For Mobile terminal, simple gestures can be identified in series by setting to recognize complex gestures
	- `tcp/http2 service` Provide TCP/HTTP2 backend services, fully compatible with [Koa@2](https://koajs.com/) middleware, integrated multilingual solutions.

---

# Feature List

- **`core tool library`** It's like a Swiss army knife. It helps you simplify your code. Anyone can use it to create their own **tool library**.
	- [`core`](https://github.com/j-show/jShow/wiki/CTL_core_en) Basic function library for a variety of simple, complex types of judgment
	- [`class extensions`](https://github.com/j-show/jShow/wiki/CTL_class_en) Extend the basic class structure and improve the operation mode of events, exceptions, etc.
	- [`async extensions`](https://github.com/j-show/jShow/wiki/CTL_async_en) Extend asynchronous functions to define generic asynchronous code encoding specifications

- **`external components`** Automatically identify environmental patterns, follow the light component principle, load the following components as needed
	- [`module loading framework`](https://github.com/j-show/jShow/wiki/EC_cmd_en) Modular development framework, with async function as the core, asynchronous load page module
	- [`front-end routing`](https://github.com/j-show/jShow/wiki/EC_router_en) Through simple configuration, the front-end routing structure is established and the single-page application is developed easily
	- [`DOM operation`](https://github.com/j-show/jShow/wiki/EC_dom_en) Simple DOM operation object, fully compatible with [jQuery](https://jquery.com/) operation mode
	- [`gesture recognition`](https://github.com/j-show/jShow/wiki/EC_gesture_en) For Mobile terminal, simple gestures can be identified in series by setting to recognize complex gestures
	- [`tcp service`](https://github.com/j-show/jShow/wiki/EC_tcp_en) Provide TCP backend services, Integrated buffer processing Solutions.
	- [`http2 service`](https://github.com/j-show/jShow/wiki/EC_http2_en) Provide HTTP2 backend services, fully compatible with [Koa@2](https://koajs.com/) middleware, integrated multilingual solutions.

- **`Tools Library`**
	- [`core`](https://github.com/j-show/jShow/wiki/core_function) Basic function library for a variety of simple, complex types of judgment
	- [`Check`](https://github.com/j-show/jShow/wiki/lib_check) Extend the basic class structure and improve the operation mode of events, exceptions, etc.
	- [`async extensions`](https://github.com/j-show/jShow/wiki/async_extensions) Extend asynchronous functions to define generic asynchronous code encoding specifications
	- [`Check`](https://github.com/j-show/jShow/wiki/lib_check) —— Check everything function library.
	- [`Conver`](https://github.com/j-show/jShow/wiki/lib_conver) —— Data Conver function library.
	- [`Dete`](https://github.com/j-show/jShow/wiki/lib_date) —— Date & Time calculations functions.
	- [`Security`](https://github.com/j-show/jShow/wiki/lib_security) —— Security safe function library(MD5、CRC、SHA)
	- [`Regexp`](https://github.com/j-show/jShow/wiki/lib_regexp) —— Regexp tool function library.
	- [`String`](https://github.com/j-show/jShow/wiki/lib_string) —— String tool function library.
  
---
   
# Installation

- Install

```bash
npm install jshow
```
  
- Node.js

The `jShow package` has an auto-load property, and a `jShow` object map is created in the global object after the first execution to facilitate its use in any subsequent module, so it is recommended to declare references at the top of the startup file.

```javascript
const jShow = require("jshow");
console.log(jShow.version());
```

- Web Brower
 
`jShow` module is based on CMD mode for lazy loading. You need to make the call using the entry function.
The following two loading methods have slightly different effects.
  

* full module loading

```html
<script type="text/javascript" src="/inc/jShow/jShow.js"></script>
<script type="text/javascript">
jShow.use(function(){
    //At this time, all modules of jShow will be loaded, and the relative loading time is relatively long
});
</script>
```
  
* according to the need to loading

```javascript
// /usr/test.js
jShow.define(function (module, exports, require) {
  // At this time, only jShow.Check and jShow.Conver modules are introduced into the module, and other modules in the jShow cannot be used
}, {module: this, exports: this}, ["Check", "Conver"], "test");
```

```html
// index.html
<script type="text/javascript">
  jShow.use("test.js"); 
  //Module default load /usr directory corresponding files
</script>
```

---
  
# Questions

For questions and support please use [the official forum](https://jshow.org/forum) or [community chat](https://jshow.org/chat). 
The [issue](https://github.com/j-show/jShow/issues) list of this repo is **exclusively** for bug reports and feature requests.

---

# License

[MIT](http://opensource.org/licenses/MIT)

---

<p align="center"> Copyright (c) 2019 jShow.org </p>
