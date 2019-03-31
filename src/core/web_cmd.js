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
 * ==========================================
 */
($ => {
	if ($.mode === $.MODE.Node) return;

	const metaState = {
			  Error:     -1,
			  Ready:     0,
			  Loading:   1,
			  Define:    2,
			  Loaded:    3,
			  Executing: 4,
			  Done:      5
		  },
		  fileType  = {
			  JS:   1,
			  CSS:  2,
			  JSON: 3
		  },
		  codeType  = {
			  None:     0,
			  Object:   1,
			  Function: 2,
			  Value:    3
		  },
		  modeules  = {},
		  config    = {
			  delay: true,
			  deps:  [],
			  libs:  {},
			  root:  "/",
			  incs:  "./inc/jBD/",
			  user:  "./usr/"
		  };

	let TModule = (function (CFG, MOD) {
		var lastMeta = null;

		const errorMsg     = function () { throw new Error(console.error("[CMD] ", Array.from(arguments).join(" "))); },
			  parseHref    = (url, path) => {
				  let local = window.location;

				  url = url.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/+$/, "").replace(/\/\.\//g, "/");

				  if (/^http[s]?:\/\//.test(url)) return url;

				  if (!path) path = local.protocol + "//" + local.host + "/";
				  if (!url) url += "/";

				  return (path + url).replace(/\/\.\//g, "/").replace(/([^:\/])\/+\//g, "$1/");
			  },
			  parseRealUrl = (url, path, ext) => {
				  if (!url || !(url = url.replace(/\\/g, "/"))) return "";
				  if (/^http[s]?:\/\//.test(url)) return url;

				  let DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//,
					  SINGLE_DOT_RE = /([^/])\/[^/]+\//;

				  if (url[0] == "/") {
					  if (!/^http[s]?:\/\//.test(path)) path = "";
					  else {
						  while (path.match(SINGLE_DOT_RE)) path = path.replace(SINGLE_DOT_RE, "$1/");
						  path = path.substr(0, path.length - 1);
					  }
				  }

				  url = path + url;
				  url = url.replace(/\/\.\//g, "/").replace(/^(http[s]?:\/\/[\w\.-]+(?:\:[\d]+)*?)\//, "$1/").replace(/([^:\/])\/+\//g, "$1/");
				  while (url.match(DOUBLE_DOT_RE)) url = url.replace(DOUBLE_DOT_RE, "/");

				  if (ext && !/(?:\.[A-Za-z]+|\?[^\?\.\/]*)$/.test(url)) url += "." + ext;

				  return url.replace(/^\//, "");
			  },
			  loadEvent    = (state, meta) => {
				  const error = e => errorMsg("load event", "url:" + meta.url, "msg:" + e.message),
						done  = e => {
							if (lastMeta) {
								meta.state = lastMeta.state;
								if (meta.state == metaState.Error) errorMsg("factory null");

								meta.type[2] = lastMeta.type;
								meta.alias = $.unique(meta.alias.concat(lastMeta.alias));
								meta.deps = $.unique(meta.deps.concat(lastMeta.deps));

								meta.node = meta.node.remove() && null;
								meta.module.factory = lastMeta.factory;
								meta.exec = lastMeta.exec;

								((meta, module) => {
									if (meta.deps.length < 1) module.done();
									else {
										const sd = () => {
												  meta.surs--;
												  module.done();
											  },
											  df = d => module.require(d, sd);

										meta.surs = meta.deps.length;
										meta.deps.forEach(df);
									}
								})(meta, meta.module);

								lastMeta = null;
							}
							else {
								meta.type[2] = codeType.None;
								meta.node.removeAttribute("bd_use");
								meta.node = null;
								meta.module.done(() => meta.state = metaState.Done);
							}
						},
						ajax  = e => {
							if (meta.node.readyState != 4) return;

							if ((e = meta.node.status) == 200) {
								meta.type[2] = codeType.Object;
								meta.module.factory = eval(meta.node.responseText || "{}");
								meta.exec = false;
								meta.node = null;
								meta.module.done(() => meta.state = metaState.Done);
							}
							else if (e >= 300 && e < 600) errorMsg("load ajax", "url:" + meta.url, "code:" + e);
							else if (e > 200 && e != 203) errorMsg("load ajax", "url:" + meta.url, "code:" + e);
						};

				  switch (state) {
					  default:
						  return done;
					  case "error":
						  return error;
					  case "ajax":
						  return ajax;
				  }
			  },
			  parseModule  = name => {
				  let url  = [parseRealUrl(name, CFG.incs, "js"), parseRealUrl(name, CFG.user, "js")],
					  meta = null;

				  $.each(MOD, d => {
					  if ($.has(name, meta = d)) return false;
					  if (d.url == url[0] || d.url == url[1]) return false;

					  meta = null;
				  });

				  if (meta === null) meta = CFG.libs[name];

				  return meta;
			  },
			  parseDepend  = (deps, code) => {
				  if (code.indexOf("require") == -1) return;

				  const rxpNumber = /\d/,
						rxpQuote  = /'|"/,
						rxpStr    = /[a-z_$]/i,
						rxpNum    = [/^\.\d+(?:E[+-]?\d*)?\s*/i, /^0x[\da-f]*/i, /^0x[\da-f]*\s*/i],
						rxpKey    = [/^[\w$]+/, /^require\s*\(\s*(['"]).+?\1\s*\)/, /^require\s*\(\s*['"]/, /^[\w$]+(?:\s*\.\s*[\w$]+)*/],
						cntKey    = [
							{
								"if":    1,
								"for":   1,
								"while": 1,
								"with":  1
							},
							{
								"break":      1,
								"case":       1,
								"continue":   1,
								"debugger":   1,
								"delete":     1,
								"do":         1,
								"else":       1,
								"false":      1,
								"if":         1,
								"in":         1,
								"instanceof": 1,
								"return":     1,
								"typeof":     1,
								"void":       1
							}
						],
						pts       = [];

				  const readChar  = () => {
							s = code.charAt(i++);
						},
						dealQuote = () => {
							let start = i,
								c     = s,
								end   = code.indexOf(c, start);

							if (end == -1) i = l;
							else if (code.charAt(end - 1) != "\\") i = end + 1;
							else {
								while (i < l) {
									readChar();

									if (s == "\\") i++;
									else if (s == c) break;
								}
							}

							if (modName) {
								deps.push(code.slice(start, i - 1));
								modName = 0;
							}
						},
						dealReg   = () => {
							i--;
							while (i < l) {
								readChar();

								if (s == "\\") i++;
								else if (s == "/") break;
								else if (s == "[") {
									while (i < l) {
										readChar();

										if (s == "\\") i++;
										else if (s == "]") break;
									}
								}
							}
						},
						dealWord  = v => {
							let s = v.slice(i - 1),
								r = rxpKey[0].exec(s)[0];

							ptState = cntKey[0][r];

							isReg = cntKey[1][r];

							if (modName = rxpKey[1].test(s)) {
								r = rxpKey[2].exec(s)[0];
								i += r.length - 2;
							}
							else i += rxpKey[3].exec(s)[0].length - 1;
						},
						dealNum   = (v, c) => {
							let s = c.slice(i - 1),
								r;

							if (v == '.') r = rxpNum[0].exec(s)[0];
							else if (rxpNum[1].test(s)) r = rxpNum[2].exec(s)[0];
							else r = rxpNum[3].exec(s)[0];

							i += r.length - 1;
							isReg = 0;
						};

				  let modName = 0,
					  isReg   = 1,
					  ptState = 0,
					  i       = 0,
					  l       = code.length,
					  s;

				  while (i < l) {
					  readChar();

					  if (rxpNumber.test(s)) {}
					  else if (rxpQuote.test(s)) {
						  dealQuote();
						  isReg = 1;
					  }
					  else if (s == "/") {
						  readChar();
						  if (s == "/") {
							  if ((i = code.indexOf("\n", i)) == -1) i = code.length;
						  }
						  else if (s == "*") {
							  if ((i = code.indexOf("*/", i)) == -1) i = l;
							  else i += 2;
						  }
						  else if (isReg) {
							  dealReg();
							  isReg = 0;
						  }
						  else {
							  i--;
							  isReg = 1;
						  }
					  }
					  else if (rxpStr.test(s)) dealWord(code);
					  else if (rxpNumber.test(s) || s == '.' && rxpNumber.test(code.charAt(i))) dealNum(s, code);
					  else if (s == "(") {
						  pts.push(ptState);
						  isReg = 1;
					  }
					  else if (s == ")") isReg = pts.pop();
					  else {
						  isReg = s != "]";
						  modName = 0;
					  }
				  }
			  };

		function TModule (url, deps, callback) {
			this.factory = null;
			this.exports = null;
			this.callback = $.Callback("once memory", callback);
			this.callback.on(d => this.meta.state = metaState.Loaded);

			this.meta = ((url, deps) => {
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
				const getNodeFile = (meta, event, node) => {
						  const doc  = document,
								head = doc.getElementsByTagName("head")[0] || doc.head || doc.documentElement,
								base = head.getElementsByTagName("base")[0];

						  if (meta.type[1] == fileType.CSS) {
							  node = doc.createElement("link");
							  node.type = "text/css";
							  node.rel = "stylesheet";
							  node.href = url;
						  }
						  else {
							  node = doc.createElement("script");
							  node.type = "text/javascript";
							  node.async = true;
							  node.src = url;
						  }

						  meta.state = metaState.Loading;
						  meta.node = node;

						  node.setAttribute("bd_use", true);
						  node.onload = event("loaded", meta);
						  node.onerror = event("error", meta);

						  base ? head.insertBefore(node, base) : head.appendChild(node);
					  },
					  getNodeUrl  = (meta, event, node) => {
						  if (!window.XMLHttpRequest) errorMsg("CMD Load Method Error");

						  meta.state = metaState.Loading;
						  meta.node = node;

						  node.onreadystatechange = event("ajax", meta);
						  node.open("GET", url, true);
						  node.send(null);
					  };

				if (meta.type[1] == fileType.JSON) getNodeUrl(meta, event);
				else getNodeFile(meta, event);
			})(this.meta, loadEvent);

			return this;
		}

		TModule.require = function (url, deps, callback) {
			if (typeof(url) != "string" || !url) errorMsg("load url is null");

			const done = tag => {
					  return function () {
						  let exec = null;

						  if (meta) {
							  exec = meta.module.exec();
							  if (tag) $[tag] = exec;
							  if (callback) callback();
						  }

						  return exec;
					  }
				  },
				  load = (url, path, tag) => {
					  meta = (new TModule(parseRealUrl(url, path, "js"), deps || [], done(tag))).meta;
					  MOD[meta.url] = meta;
				  };

			let meta = null;

			if (arguments.length == 2 && typeof(deps) == "function") {
				callback = deps;
				deps = null;
			}
			if (typeof(deps) == "string" && deps) deps = [deps];

			switch ($.type(meta = parseModule(url))) {
				case "string":
					load(meta, CFG.incs, url);
					break;
				case "null":
					load(url, CFG.user);
					break;
				case "object":
					if (meta.state != metaState.Error) return done(url);
				default:
					errorMsg("require");
					break;
			}
		};
		TModule.define = (factory, own, deps, alias, exec) => {
			switch ($.type(deps, true)) {
				case "string":
					deps = [deps];
					break;
				case "array":
					break;
				default:
					deps = [];
					break;
			}
			switch ($.type(alias, true)) {
				case "string":
					alias = [alias];
					break;
				case "array":
					break;
				default:
					alias = [];
					break;
			}

			lastMeta = {
				state:   metaState.Define,
				type:    codeType.Value,
				alias:   alias,
				deps:    deps,
				factory: factory,
				exec:    exec !== false
			};

			if (factory) {
				lastMeta.state = metaState.Define;
				switch ($.type(factory)) {
					case "function":
						lastMeta.type = codeType.Function;
						parseDepend(lastMeta.deps, lastMeta.factory.toString());
						break;
					case "object":
						lastMeta.type = codeType.Object;
						break;
				}
			}
		};

		TModule.prototype = {
			require: function (url, callback) {
				const done = tag => {
						  return function () {
							  if (!meta) return;
							  if (tag) $[tag] = meta.module.exec();
							  if (callback) callback(meta.module.exec());
						  }
					  },
					  load = (url, path, tag) => {
						  meta = (new TModule(parseRealUrl(url, path, "js"), [], done(tag))).meta;
						  MOD[meta.url] = meta;
					  };

				let meta = null;

				switch ($.type(meta = parseModule(url))) {
					case "string":
						load(meta, CFG.incs, url);
						break;
					case "null":
						load(url, CFG.user);
						break;
					case "object":
						if (meta.state != metaState.Error) {
							if (callback) meta.module.callback.on(callback);
							break;
						}
					default:
						errorMsg("module require");
						break;
				}

				return this;
			},
			done:    function (callback) {
				if (this.meta.surs < 1) {
					if (typeof(callback) == "function") this.callback.on(callback);
					this.callback.fireWith(this, this.meta);
				}

				return this;
			},
			exec:    function () {
				let meta = this.meta,
					exp  = this.exports;

				if (meta.state != metaState.Done && meta.state > metaState.Loaded) return exp;

				if (meta.state == metaState.Loaded) {
					meta.state = metaState.Executing;

					switch (meta.type[2]) {
						case codeType.None:
							errorMsg("exec none");
							return;
						case codeType.Function:
							if (meta.exec) {
								exp = this.factory.call(this.exports = {}, this, this.exports, TModule.require);

								if (exp !== void(0)) this.exports = exp;
								break;
							}
						default:
							exp = this.exports = this.factory;
							break;
					}

					meta.state = metaState.Done;
				}

				return exp;
			}
		};

		$.config = cfg => {
			let deps = [];

			if ($.isArray(cfg)) cfg = {deps: cfg};

			$.each(cfg, (d, k) => {
				switch (k) {
					case "delay":
					case "root":
					case "incs":
					case "user":
						CFG[k] = d;
						break;
					case "deps":
						if ($.isArray(d) && d.length > 0) Array.prototype.push.apply(deps, d);
						break;
					case "libs":
						if ($.isArray(d) && d.length > 0) Array.prototype.push.apply(CFG.deps, d);
						break;
				}
			});

			CFG.root = parseHref(CFG.root);
			CFG.incs = parseHref(CFG.incs, CFG.root) + "/";
			CFG.user = parseHref(CFG.user, CFG.root) + "/";

			$.each(CFG.deps, (d, i) => CFG.deps[i] = parseRealUrl(d, CFG.incs, "js"));
			$.each(deps, (d, i) => CFG.deps.push(parseRealUrl(d, CFG.user, "js")));
			CFG.deps = $.unique(CFG.deps);

			return CFG;
		};
		$.ready = fn => {
			if (!$.isFunction(fn)) return;

			function DOMCL () {
				fn();

				if (document.addEventListener) document.removeEventListener("DOMContentLoaded", DOMCL, false);
				else if (document.readyState === "complete") document.detachEvent("onreadystatechange", DOMCL);
			}

			if (document.readyState === "complete") DOMCL();
			else if (document.addEventListener) document.addEventListener("DOMContentLoaded", DOMCL, false);
			else if (document.attachEvent) document.attachEvent("onreadystatechange", DOMCL);
			else window.onload = DOMCL;
		};
		$.use = function (url, cfg, callback) {
			let done = (url, deps, callback) => {
					$.require(url, deps, mod => { if (callback) callback(mod); });
				},
				load = (url, done, callback) => {
					return () => {
						let _url  = parseRealUrl(url, config.user, "js"),
							_surs = (CFG.deps = $.unique(CFG.deps)).length;

						if (_surs < 1) done(_url, CFG.deps, callback);
						else {
							$.each(CFG.deps, d => {
								if (--_surs > 0) return;
								done(_url, CFG.deps, callback);
							});
						}
					}
				};

			if (cfg === void(0)) cfg = url;
			if (callback === void(0)) callback = cfg;

			$.config(cfg);

			if (!$.isString(url)) url = parseHref(CFG.incs + "./lib/web/use.js");
			if (!$.isFunction(callback)) callback = null;

			if (CFG.delay) $.ready(load(url, done, callback));
			else load(url, done, callback)();
		};

		return TModule;
	})(config, modeules);

	$.require = TModule.require;
	$.define = TModule.define;

	global.__module = modeules;
	//适配部分外部库通过此属性区分Node状态;
	global.module = void(0);

	if (!global.require) global.require = $.require;
	if (!global.define) global.define = $.define;

	$.__require = (url, tag) => {
		if (tag) config.libs[tag] = url;
		else config.deps.push(url);
	};

	if ($.mode & $.MODE.Web) {
		$.__require("../src/jquery.min.js");
		$.__require("../src/global.min.css");
	}
	else if ($.mode & $.MODE.WebMobile) {
		$.__require("../src/jquery.min.js");
		$.__require("../src/global.min.css");
	}
})(this);