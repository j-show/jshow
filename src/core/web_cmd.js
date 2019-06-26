/**
 * ==========================================
 * Name:           jShow's Load Module
 * Author:         j-show
 * CreTime:        2019-03-14
 * Description:    JavaScript/CSS Loader for Web, use CMD, like SeaJs, Node's Frame is invalid
 * Log:
 * 2015-05-06    优化了路径解析拼接函数
 * 2015-06-01    修改路径结构，适应web方式，分离出root/incs/user三种状态
 * 2015-09-17    增加了对端口页面的支持
 * 2016-11-24    基于ES6改写
 * 2017-02-10    去除函数默认参数,增加适配
 * 2019-03-14    Init Class
 * 2019-05-20    Format Code to jShow Style Guide
 * 2019-05-25    增加AMD识别方式，同时兼容CMD/AMD
 * ==========================================
 */
(($, global) => {
	if ($.mode === $.MODE.Node) return;

	const loadMode = {
		CMD: "CMD",
		AMD: "AMD"
	};
	const fileType = {
		JS:   1,
		CSS:  2,
		JSON: 3
	};
	const modules  = {};
	const config   = {
		mode:  loadMode.AMD,
		delay: true,
		deps:  [],
		libs:  {},
		root:  "/",
		incs:  "./inc/jBD/",
		user:  "./usr/"
	};

	const TModule = (function (CFG, MOD) {
		const metaState = {
			Error:     -1,
			Ready:     0,
			Loading:   1,
			Define:    2,
			Loaded:    3,
			Executing: 4,
			Done:      5
		};
		const codeType  = {
			None:     0,
			Object:   1,
			Function: 2,
			Value:    3
		};

		//因为作用域问题，必须使用var进行定义
		var lastMeta = null;

		const errorMsg     = (...arg) => {
			throw new Error(console.error(`[${CFG.mode}] ${arg.join(" ")}`));
		};
		const parseHref    = (url, path) => {
			let _url = url.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/+$/, "").replace(/\/\.\//g, "/");

			if (/^http[s]?:\/\//.test(_url)) return _url;

			let local = window.location;
			let _path = path || `${local.protocol}//${local.host}/`;

			_path += _url || `${_url}/`;
			_path = _path.replace(/\/\.\//g, "/").replace(/([^:\/])\/+\//g, "$1/");

			return _path;
		};
		const parseRealUrl = (url, path, ext) => {
			let _url = url.replace(/\\/g, "/");

			if (!_url) return "";
			if (/^http[s]?:\/\//.test(_url)) return _url;

			const DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//;
			const SINGLE_DOT_RE = /([^/])\/[^/]+\//;

			let _path = path;

			if (_url[0] === "/") {
				if (!/^http[s]?:\/\//.test(_path)) _path = "";
				else {
					while (_path.match(SINGLE_DOT_RE)) _path = _path.replace(SINGLE_DOT_RE, "$1/");
					_path = _path.substr(0, _path.length - 1);
				}
			}

			_url = `${_path}${_url}`;
			_url = _url.replace(/\/\.\//g, "/").replace(/^(http[s]?:\/\/[\w\.-]+(?:\:[\d]+)*?)\//, "$1/").replace(/([^:\/])\/+\//g, "$1/");
			while (_url.match(DOUBLE_DOT_RE)) _url = _url.replace(DOUBLE_DOT_RE, "/");

			if (ext && !/(?:\.[A-Za-z]+|\?[^\?\.\/]*)$/.test(_url)) _url += `.${ext}`;

			return _url.replace(/^\//, "");
		};
		const loadEvent    = (state, meta) => {
			switch (state) {
				default:
					return (() => {
						if (lastMeta) {
							meta.state = lastMeta.state;
							if (meta.state === metaState.Error) errorMsg("factory null");

							meta.type[2] = lastMeta.type;
							meta.alias   = $.unique(meta.alias.concat(lastMeta.alias));
							meta.deps    = $.unique(meta.deps.concat(lastMeta.deps));

							meta.node           = meta.node.remove() && null;
							meta.exec           = lastMeta.exec;
							meta.module.factory = lastMeta.factory;

							((meta, module) => {
								if (meta.deps.length < 1) {
									module.done();
								}
								else {
									meta.surs = meta.deps.length;
									meta.deps.forEach((d, i) => {
										module.require(d, mod => {
											meta.surs -= 1;
											meta.deps[i] = mod;

											module.done();
										});
									});
								}
							})(meta, meta.module);

							lastMeta = null;
						}
						else {
							meta.type[2] = codeType.None;
							meta.node.removeAttribute("jshow_use");
							meta.node = null;
							meta.module.done(() => {
								meta.state = metaState.Done;
							});
						}
					});
				case "error":
					return (e => {
						errorMsg(`load event url:${meta.url} msg:${e.message}`);
					});
				case "ajax":
					return (() => {
						if (meta.node.readyState !== 4) return;

						let e = meta.node.status;

						if (e === 200) {
							meta.type[2]        = codeType.Object;
							meta.exec           = false;
							meta.node           = null;
							meta.module.factory = eval(meta.node.responseText || "{}");
							meta.module.done(() => {
								meta.state = metaState.Done;
							});
						}
						else if (e >= 200 && e < 600) errorMsg(`load ajax url:${meta.url} code:${e}`);
						else if (e > 200 && e !== 203) errorMsg(`load ajax url:${meta.url} code:${e}`);
					});
			}
		};
		const parseModule  = name => {
			let url  = [parseRealUrl(name, CFG.incs, "js"), parseRealUrl(name, CFG.user, "js")];
			let meta = null;

			$.each(MOD, d => {
				meta = d;

				if ($.has(name, meta)) return false;
				if (d.url === url[0] || d.url === url[1]) return false;

				meta = null;
			});

			if (meta === null) meta = CFG.libs[name];

			return meta;
		};
		const parseDepend  = (deps, code) => {
			if (code.indexOf("require") === -1) return;

			const rxpNumber = /\d/;
			const rxpQuote  = /'|"/;
			const rxpStr    = /[a-z_$]/i;
			const rxpNum    = [/^\.\d+(?:E[+-]?\d*)?\s*/i, /^0x[\da-f]*/i, /^0x[\da-f]*\s*/i];
			const rxpKey    = [/^[\w$]+/, /^require\s*\(\s*(['"]).+?\1\s*\)/, /^require\s*\(\s*['"]/, /^[\w$]+(?:\s*\.\s*[\w$]+)*/];
			const cntKey    = [
				{
					"if":    true,
					"for":   true,
					"while": true,
					"with":  true
				},
				{
					"break":      true,
					"case":       true,
					"continue":   true,
					"debugger":   true,
					"delete":     true,
					"do":         true,
					"else":       true,
					"false":      true,
					"if":         true,
					"in":         true,
					"instanceof": true,
					"return":     true,
					"typeof":     true,
					"void":       true
				}
			];
			const pts       = [];

			let isMod = false;
			let isReg = true;
			let isPT  = false;
			let i     = 0;
			let l     = code.length;
			let str   = "";

			const readChar  = () => {
				str = code.charAt(i++);
				i += 1;
			};
			const dealQuote = () => {
				let start = i;
				let code  = str;
				let end   = code.indexOf(code, start);

				if (end === -1) i = l;
				else if (code.charAt(end - 1) !== "\\") i = end + 1;
				else {
					while (i < l) {
						readChar();

						if (str === "\\") i += 1;
						else if (str === code) break;
					}
				}

				if (isMod) {
					deps.push(code.slice(start, i - 1));
					isMod = false;
				}
			};
			const dealReg   = sub => {
				if (sub) i -= 1;

				while (i < l) {
					readChar();

					switch (str) {
						case "\\":
							i += 1;
							break;
						case "/":
							if (!sub) return;
							break;
						case "[":
							if (!sub) dealReg(true);
							break;
						case "]":
							if (sub) return;
							break;
					}
				}
			};
			const dealWord  = value => {
				let str = value.slice(i - 1);
				let rxp = rxpKey[0].exec(str)[0];

				isPT  = cntKey[0][rxp];
				isReg = cntKey[1][rxp];
				isMod = rxpKey[1].test(str);

				if (isMod) {
					rxp = rxpKey[2].exec(str)[0];
					i += rxp.length - 2;
				}
				else i += rxpKey[3].exec(str)[0].length - 1;
			};
			const dealNum   = (value, code) => {
				let str = code.slice(i - 1);
				let r;

				if (value === '.') r = rxpNum[0].exec(str)[0];
				else if (rxpNum[1].test(str)) r = rxpNum[2].exec(str)[0];
				else r = rxpNum[3].exec(str)[0];

				i += r.length - 1;
				isReg = false;
			};

			for (i = 0; i < l;) {
				readChar();

				if (rxpNumber.test(str)) {
				}
				else if (rxpQuote.test(str)) {
					dealQuote();
					isReg = true;
				}
				else if (str === "/") {
					readChar();

					if (str === "/") {
						i = code.indexOf("\n", i);

						if (i === -1) i = code.length;
					}
					else if (str === "*") {
						i = code.indexOf("*/", i);

						if (i === -1) i = l;
						else i += 2;
					}
					else if (isReg) {
						dealReg();
						isReg = false;
					}
					else {
						i--;
						isReg = true;
					}
				}
				else if (rxpStr.test(str)) {
					dealWord(code);
				}
				else if (rxpNumber.test(str) || ((str === '.') && rxpNumber.test(code.charAt(i)))) {
					dealNum(str, code);
				}
				else if (str === "(") {
					pts.push(isPT);
					isReg = true;
				}
				else if (str === ")") {
					isReg = !!(pts.pop());
				}
				else {
					isReg = (str !== "]");
					isMod = false;
				}
			}
		};

		class TModule {
			constructor (url, deps, callback) {
				this._factory  = null;
				this._exports  = null;
				this._callback = $.Callback({flag: "once memory", callback});
				this._callback.on(() => {
					this.meta.state = metaState.Loaded;
				});

				this._meta = ((url, deps) => {
					let meta = {
						state:  metaState.Ready,
						type:   [false, fileType.JS, codeType.None],
						alias:  /(\w+)\.(css|js|json)$/.exec(url),
						deps:   deps,
						url:    url,
						module: this,
						exec:   true,
						node:   null,
						surs:   0
					};

					meta.alias = meta.alias ? [meta.alias[1]] : [];

					switch (url.substr(-4).toLowerCase()) {
						case ".css":
							meta.type[1] = fileType.CSS;
							break;
						case "json":
							meta.type[1] = fileType.JSON;
							break;
					}

					return meta;
				})(url, deps);

				((meta, event) => {
					const getNodeFile = (meta, event) => {
						const doc  = document;
						const head = doc.getElementsByTagName("head")[0] || doc.head || doc.documentElement;
						const base = head.getElementsByTagName("base")[0];

						let node;

						switch (meta.type[1]) {
							case fileType.CSS:
								node      = doc.createElement("link");
								node.type = "text/css";
								node.rel  = "stylesheet";
								node.href = url;
								break;
							case fileType.JS:
								node       = doc.createElement("script");
								node.type  = "text/javascript";
								node.async = true;
								node.src   = url;
								break;
						}

						meta.state = metaState.Loading;
						meta.node  = node;

						node.setAttribute("jshow_use", true);
						node.onload  = event("loaded", meta);
						node.onerror = event("error", meta);

						base ? head.insertBefore(node, base) : head.appendChild(node);
					};
					const getNodeUrl  = (meta, event) => {
						if (!window.XMLHttpRequest) errorMsg("CMD Load Method Error");

						meta.state = metaState.Loading;
						meta.node  = void (0);

						node.onreadystatechange = event("ajax", meta);
						node.open("GET", url, true);
						node.send(null);
					};

					switch (meta.type[1]) {
						default:
						case fileType.JSON:
							getNodeUrl(meta, event);
							break;
						case fileType.CSS:
						case fileType.JS:
							getNodeFile(meta, event);
							break;
					}
				})(this._meta, loadEvent);
			}

			static create (url, deps, callback) {
				return new TModule(url, deps || [], callback);
			}

			static require (url, deps, callback = deps) {
				if (!$.isString(url)) errorMsg("load url is null");

				const done = tag => {
					return function doneByTag () {
						let exec = null;

						if (meta) {
							exec = meta.module.exec();
							if (tag) $[tag] = exec;
							if ($.isFunction(callback, true)) callback(exec);
						}

						return exec;
					};
				};
				const load = (url, path, tag) => {
					let _url = parseRealUrl(url, path, "js");

					meta          = TModule.create(_url, dep || [], done(tag)).meta;
					MOD[meta.url] = meta;
				};

				let dep  = $.isString(deps) ? [deps] : deps;
				let meta = parseModule(url);

				switch ($.type(meta)) {
					case "object":
						if (meta.state !== metaState.Error) return done(url);
					default:
						errorMsg("require is throw");
						break;
					case "string":
						load(meta, CFG.incs, url);
						break;
					case "null":
						load(url, CFG.user);
						break;
				}
			}

			static define (alias, deps = alias, factory = deps, owner = factory, exec = owner) {
				let dep  = deps;
				let name = alias;

				switch ($.type(name, true)) {
					default:
						name = [];
						break;
					case "string":
						name = [name];
						break;
					case "array":
						break;
				}

				switch ($.type(dep, true)) {
					default:
						dep = [];
						break;
					case "string":
						dep = [dep];
						break;
					case "array":
						break;
				}

				lastMeta = {
					state:   metaState.Define,
					type:    codeType.Value,
					alias:   name,
					deps:    dep,
					factory: factory,
					exec:    exec !== false
				};

				if (factory) {
					lastMeta.state = metaState.Define;
					switch ($.type(factory)) {
						case "function":
							lastMeta.type = codeType.Function;
							parseDepend(lastMeta.deps, CFG.mode === loadMode.CMD ? lastMeta.factory.toString() : "");
							break;
						case "object":
							lastMeta.type = codeType.Object;
							break;
					}
				}
			}

			static config (cfg) {
				let {
						mode  = loadMode.AMD,
						delay = true,
						root, incs, user,
						deps, libs
					} = cfg;

				if ($.isArray(cfg)) deps = cfg;
				if ($.isArray(libs)) CFG.deps = [...CFG.deps, ...libs];

				CFG.mode  = $.has(mode, loadMode) ? mode : CFG.mode;
				CFG.delay = delay === true;
				CFG.root  = parseHref($.isString(root) ? root : CFG.root);
				CFG.incs  = parseHref($.isString(incs) ? incs : CFG.incs) + "/";
				CFG.user  = parseHref($.isString(user) ? user : CFG.user) + "/";

				$.each(CFG.deps, (d, i) => {
					CFG.deps[i] = parseRealUrl(d, CFG.incs, "js");
				});
				$.each(deps, d => {
					CFG.deps.push(parseRealUrl(d, CFG.user, "js"));
				});

				CFG.deps = $.unique(CFG.deps);

				return CFG;
			}

			static ready (callback) {
				if (!$.isFunction(callback)) return;

				const DOMCL = function () {
					callback();

					if (document.addEventListener()) document.removeEventListener("DOMContentLoaded", DOMCL, false);
					else if (document.readyState === "complete") document.detachEvent("onreadystatechange", DOMCL);
				};

				if (document.readyState === "complete") DOMCL();
				else if (document.addEventListener) document.addEventListener("DOMContentLoaded", DOMCL, false);
				else if (document.attachEvent) document.attachEvent("onreadystatechange", DOMCL);
				else window.onload = DOMCL;
			}

			static use (url, cfg = url, callback = cfg) {
				const done = (url, deps, callback) => {
					$.require(url, deps, mod => {
						if (callback) callback(mod);
					});
				};

				$.config(cfg);

				let _url      = $.isString(url) ? parseRealUrl(url, CFG.user, "js") : parseHref(`${CFG.incs}/lib/web/use.js`);
				let _callback = $.isFunction(_callback) ? callback : null;
				let _deps     = CFG.deps;

				if (CFG.delay) $.ready(() => done(_url, _deps, _callback));
				else done(_url, _deps, _callback);
			}

			get factory () {
				return this._factory;
			}

			get exports () {
				return this._exports;
			}

			get callback () {
				return this._callback;
			}

			get meta () {
				return this._meta;
			}

			require (url, callback) {
				const done = tag => {
					return function doneByTag () {
						let exec = null;

						if (meta) {
							exec = meta.module.exec();
							if (tag) $[tag] = exec;
							if ($.isFunction(callback, true)) callback(exec);
						}

						return exec;
					};
				};
				const load = (url, path, tag) => {
					let _url = parseRealUrl(url, path, "js");

					meta = TModule.create(_url, [], done(tag)).meta;

					MOD[meta.url] = meta;
				};

				let meta = parseModule(url);

				switch ($.type(meta)) {
					case "object":
						if (meta.state !== metaState.Error) {
							if ($.isFunction(callback, true)) meta.module.callback.on(callback);
							break;
						}
					default:
						errorMsg("module require is throw");
						break;
					case "string":
						load(meta, CFG.incs, url);
						break;
					case "null":
						load(url, CFG.user);
						break;

				}

				return this;
			}

			done (callback) {
				if (this.meta.surs < 1) {
					if ($.isFunction(callback, true)) this.callback.on(callback);

					this.callback.fireWith(this, this.meta);
				}

				return this;
			}

			exec () {
				let meta    = this.meta;
				let exports = this.exports;

				if (meta.state !== metaState.Done && meta.state > metaState.Loaded) return exports;

				if (meta.state === metaState.Loaded) {
					meta.state = metaState.Executing;

					switch (meta.type[2]) {
						case codeType.None:
							errorMsg("exec none");
							return;
						case codeType.Function:
							if (meta.exec) {
								exports = {};

								let module = {exports};

								this._exports = exports;

								exports = this.factory.call(exports, TModule.require, module, ...meta.deps);

								if (exports === void(0)) exports = module.exports;

								this._exports = exports;
								break;
							}
						default:
							exports       = this.factory;
							this._exports = exports;
							break;
					}

					meta.state = metaState.Done;
				}

				return exports;
			}
		}

		return TModule;
	})(config, modules);

	const api = {
		loadMode,
		fileType,
		require: TModule.require,
		define:  TModule.define,
		config:  TModule.config,
		ready:   TModule.ready,
		use:     TModule.use,
		__require (url, tag) {
			if (tag) config.libs[tag] = url;
			else config.deps.push(url);
		}
	};

	jShow = {...$, ...api};
	$     = jShow;

	global.__module = modules;
	//适配部分外部库通过此属性区分Node状态;
	global.module   = void(0);

	if (!global.require) global.require = api.require;
	if (!global.define) global.define = api.define;

	if ($.mode & $.MODE.Web) {
		api.__require("../src/jquery.min.js");
		api.__require("../src/global.min.css");
	}
	else if ($.mode & $.MODE.WebMobile) {
		api.__require("../src/jquery.min.js");
		api.__require("../src/global.min.css");
	}
})(jShow, global);