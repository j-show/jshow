"use strict";
(function (global, factory) {
	if (global.jShow) return;

	factory.call(
		{ver: "1.0.3"},
		global,
		{
			Node:       0,
			Web:        0xff,
			WebDesktop: 0x0f,
			WebMac:     0x08,
			WebMobile:  0xf0,
			WebiPhone:  0x10,
			WebiPad:    0x20,
			WebAndroid: 0xc0,
			WebAPhone:  0x40,
			WebAPad:    0x80
		});
})(typeof (window) !== "undefined" ? window : global, function (global, MODE) {
	const $ = this;

	if (!global.navigator) global.navigator = {userAgent: ""};

	global.jShow = $;
	$.MODE = MODE;
	$.mode = MODE.Node;

	/**
	 * 环境判断
	 *
	 * @param {string} [na=undefined] 版本字符串
	 * @returns {object}
	 *    @return {number} mode 模式，对应MODE码表
	 *    @return {string} kernel 内核名称
	 *    @return {string} version 内核版本
	 */
	$.version = na => {
		let r = {mode: MODE.Node, kernel: "node", version: ""};

		if (!na && typeof(window) == "undefined" && process) {
			r.kernel = "node";
			r.version = process.versions.node;
		}
		else {
			na = typeof(na) == "string" && na ? na : navigator.userAgent;

			let s = na.toLowerCase(),
				t;

			if (t = s.match(/msie ([\d.]+)/)) {
				r.kernel = "ie";
				r.version = t[1];
			}
			else if (t = s.match(/firefox\/([\d.]+)/)) {
				r.kernel = "firefox";
				r.version = t[1];
			}
			else if (t = s.match(/chrome\/([\d.]+)/)) {
				r.kernel = "chrome";
				r.version = t[1];
			}
			else if (t = s.match(/opera.([\d.]+)/)) {
				r.kernel = "opera";
				r.version = t[1];
			}
			else if (t = s.match(/version\/([\d.]+).*safari/)) {
				r.kernel = "safari";
				r.version = t[1];

			}
			else {
				r.kernel = "other";
				r.version = "0";
			}

			if (na.indexOf("Android") > -1 || na.indexOf("Linux") > -1) r.mode = MODE.WebAndroid;
			else if (na.indexOf("iPhone") > -1) r.mode = MODE.WebiPhone;
			else if (na.indexOf("iPad") > -1) r.mode = MODE.WebiPad;
			else if (na.match(/\(i[^;]+;( U;)? CPU.+Mac OS/)) r.mode = MODE.WebMac;
			else r.mode = MODE.WebDesktop;
		}

		return r;
	};
	$.mode = $.version().mode;
	if ($.mode == MODE.Node) exports = module.exports = $;
	else if (!global.global) global.global = global;

/**
 * ==========================================
 * Name:           jShow's Basic Function
 * Author:         j-show
 * CreTime:        2019-02-14
 * Description:    Basic Function Library
 * Log:
 * 2019-02-14    Init Library
 * ==========================================
 */
($ => {
	/**
	 * 对象类型识别
	 *
	 * @method type
	 * @param {object} obj 检测对象
	 * @param {boolean} [detail=false] 是否深度识别
	 * @returns {string}
	 *        True:    boolean, number, string, function, null
	 *        False:    boolean, number, string, function, undefined, null, object, arguments, array, date, regexp
	 */
	$.type = (obj, detail) => {
		detail = detail === true;

		let type = typeof obj,
			rxp  = v => (/^\[object (.*)\]$/.exec(Object.prototype.toString.call(v))[1]).toLowerCase();

		switch (type) {
			default:
			case "undefined":
				return detail ? "undefined" : "null";
			case "boolean":
			case "number":
			case "string":
				return type;
			case "function":
				return detail ? "function" : rxp(obj);
			case "object":
				if (obj === null) return "null";
				if (!detail) return "object";
				if (obj.jquery) return "jquery";

				if (obj instanceof Array) return "array";
				if (obj instanceof RegExp) return "regexp";

				type = rxp(obj);

				if (type.indexOf("html") == 0) return "dom";

				return type;
		}
	};
	/**
	 * 是否相等
	 *
	 * @param {*} a 判断值
	 * @param {*} b 判断值
	 * @param {boolean} [abs=true] 判断引用是否相等
	 * @returns {boolean}
	 */
	$.is = (a, b, abs) => {
		if (abs !== false) return Object.is(a, b);
		else {
			let type = [$.type(a, true), $.type(b, true)];

			if (type[0] != type[1]) return false;

			switch (type[0]) {
				default:
					return Object.is(a, b);
				case "function":
					return a.toString() == b.toString();
				case "date":
					return a.getTime() == b.getTime();
				case "array":
				case "arguments":
				case "object":
					if (Object.keys(a).length != Object.keys(b).length) return false;

					for (let k in a) if (!Object.is(a[k], b[k])) return false;

					return true;
			}
		}
	};
	/**
	 * 是否是简单类型
	 *
	 * @param value
	 * @returns {boolean}
	 */
	$.isSimple = value => {
		switch (typeof(value)) {
			default:
				return value === null;
			case "undefined":
			case "boolean":
			case "number":
			case "string":
				return true;
		}
	};
	/**
	 * 是否为Null
	 *
	 * @param {*} value 判断值
	 * @param {boolean|object} opt 参数
	 *    @param {boolean} [opt.udf=true] undefined是否为null
	 *    @param {boolean} [opt.obj=false] 数组/对象为空是否为null
	 * @returns {boolean}
	 */
	$.isNull = (value, opt) => {
		let udf, obj;

		switch (typeof(opt)) {
			case "object":
				if (opt) {
					udf = opt.udf;
					obj = opt.obj;
				}
				break;
			case "boolean":
				udf = opt;
				break;
		}
		udf = udf !== false;
		obj = obj === true;

		switch (typeof(value)) {
			default:
				return false;
			case "undefined":
				return udf;
			case "object":
				if (value === null) return true;
				if (!obj) return false;
				return Object.keys(value).length == 0;
		}
	};
	/**
	 * 是否为Boolean
	 *
	 * @param {*} value 判断值
	 * @param {boolean} [str=false] 是否判断字符串
	 * @returns {boolean}
	 */
	$.isBool = (value, str) => {
		return (typeof(value) == "boolean") || (str === true ? (String(value) in {
			"true":  1,
			"false": 1
		}) : false);
	};
	/**
	 * 是否为Number
	 *
	 * @param {*} value 判断值
	 * @param {boolean|object} opt 参数
	 *    @param {boolean} [opt.nan=false] NaN是否为数字
	 *    @param {boolean} [opt.str=false] 是否识别字符串
	 *    @param {boolean} [opt.int=true] 是否只识别整数
	 *    @param {number} [opt.min=NaN] 最小值
	 *    @param {number} [opt.max=NaN] 最大值
	 * @returns {boolean}
	 */
	$.isNumber = (value, opt) => {
		let nan, str, int, min, max, func;

		switch (typeof(opt)) {
			case "object":
				if (opt) {
					nan = opt.nan;
					str = opt.str;
					int = opt.int;
					min = opt.min;
					max = opt.max;
				}
				break;
			case "boolean":
				nan = opt;
				break;
		}
		min = Number(min);
		max = Number(max);
		nan = nan === true;
		str = str === true;
		if (int = int !== false) {
			if (!isNaN(min)) min = parseInt(min);
			if (!isNaN(max)) max = parseInt(max);
			func = v => {
				if (parseInt(v) !== v) return false;
				if (!isNaN(min) && v < min) return false;
				if (!isNaN(max) && v > max) return false;
				return true;
			}
		}
		else {
			func = (v, b) => {
				if (!b) return false;
				if (!isNaN(min) && v < min) return false;
				if (!isNaN(max) && v > max) return false;
				return true;
			};
		}

		switch (typeof(value)) {
			case "number":
				return func(value, nan ? true : !isNaN(value));
			case "string":
				return str && value ? $.isNumber(Number(value), {nan: nan, int: int}) : false;
			default:
				return false;
		}
	};
	/**
	 * 是否为String
	 *
	 * @param {*} value 判断值
	 * @param {boolean} [empty=false] 空值是否为字符串
	 * @returns {boolean}
	 */
	$.isString = (value, empty) => {
		return (typeof(value) == "string") && (empty === true ? true : value.length > 0);
	};
	/**
	 * 是否为函数
	 *
	 * @param {*} value 判断值
	 * @param {string|boolean} type 类型限定
	 * @returns {boolean}
	 */
	$.isFunction = (value, type) => {
		switch ($.type(value, true)) {
			default:
				return false;
			case "function":
				return true;
			case "asyncfunction":
				return (type === "async") || (type !== true);
			case "generatorfunction":
				return (type === "generator") || (type !== true);
		}
	};
	/**
	 * 是否为数组
	 *
	 * @param {*} value 判断值
	 * @param {boolean} [arg=false] arguments是否为数组
	 * @returns {boolean}
	 */
	$.isArray = (value, arg) => {
		switch ($.type(value, true)) {
			case "array":
				return true;
			case "arguments":
				return arg === true ? arg : false;
			default:
				return false;
		}
	};
	/**
	 * 是否为对象
	 *
	 * @param {*} value 判断值
	 * @param {string|boolean} [arg=object] 只识别Object
	 * @returns {boolean}
	 */
	$.isObject = (value, arg) => {
		let result = typeof(value) == "object";

		switch (arg) {
			case false:
				return result && (value !== null);
			default:
				return result && (value ? (value.constructor == Object) : false);
			case true:
			case "any":
				return result;
		}
	};
	/**
	 * 是否为Promise
	 *
	 * @param {*} value 判断值
	 * @returns {boolean}
	 */
	$.isPromise = value => $.type(value, true) === "promise";
	/**
	 * 是否为Generator
	 *
	 * @param {*} value 判断值
	 * @param {boolean} [obj=false] 是否检测对象
	 * @returns {boolean}
	 */
	$.isGenerator = (value, obj) => {
		const isFunc = $.isFunction,
			  isObj  = obj => isFunc(obj.next) && isFunc(obj.throw);

		if (!value) return false;
		if (!isFunc(value, "generatorfunction")) return obj === true ? isObj(value) : false;

		let main = value.constructor;

		if (main.name == "GeneratorFunction" || main.displayName == "GeneratorFunction") return true;

		return isObj(main.prototype);
	};
	/**
	 * 是否为JSON
	 *
	 * @param {*} value 判断值
	 * @param {object} [out=null] out为状态机参数
	 * @param {function} [callback]
	 * @returns {boolean}
	 */
	$.isJSON = (value, out, callback) => {
		if (typeof(value) != "string" || value.length < 2) return false;

		let data   = (o, v) => {
				o.type = v[0];
				o.escape = v[1];
				o.index = v[2];

				return o;
			},
			result = (o, v) => {
				if (callback) callback(o, v);
				return false;
			},
			type, escape;

		if (callback === void(0)) callback = out;

		if (!out || typeof (out) != "object") out = {};
		else {
			type = out.type;
			escape = out.escape;
		}
		if (!$.isFunction(callback)) callback = null;
		if (!(type instanceof Array)) type = [];
		escape = escape === true;

		let index = 0,
			len   = type.length - 1,
			str   = len >= 0 && type[len] == 1;

		if (!/^['"\[\{]/.test(value)) return result(data(out, [type, escape, -1]));

		for (let char of value) {
			if (escape) escape = false;
			else {
				switch (char = char.codePointAt()) {
					case 92:
						if (!str) return result(data({}, [type, escape, index]), out);

						escape = true;
						break;
					case 34:
					case 39:
						if (!str) {
							str = true;
							len = type.push(char) - 1;
						}
						else if (char == type[len]) {
							type.pop();
							len--;
							str = false;
						}
						break;
					case 91:
					case 123:
						if (!str) {
							len = type.push(char + 2) - 1;
						}
						break;
					case 93:
					case 125:
						if (!str) {
							if (char != type[len]) return result(data({}, [type, escape, index]), out);

							type.pop();
							len--;
						}
						break;
				}
			}

			index++;
			if (len == -1) break;
		}

		result(null, data(out, [type, escape, index]));

		return len == -1;
	};
	/**
	 * 是否为jQuery对象
	 *
	 * @param {*} value 判断值
	 * @returns {boolean}
	 */
	$.isjQuery = value => $.isObject(value) && value.jquery;
	/**
	 * 是否为DOM对象
	 *
	 * @param {*} value 判断值
	 * @returns {boolean|number}
	 */
	$.isDOM = value => $.type(value, true) === "dom" && value.nodeType;
	/**
	 * 是否为日期
	 *
	 * @param {*} value 判断值
	 * @param {boolean} [str=false] 是否检验字符串
	 * @returns {boolean}
	 */
	$.isDate = (value, str) => {
		switch ($.type(value, true)) {
			default:
				return false;
			case "date":
				return true;
			case "string":
				if (!(str === true)) return false;
				value = value.trim().split(" ");
				if (!value[0] || value.length > 2) return false;
				value[0] = value[0].replace(/-/g, "/").split("/");
				if (value[0].length != 3) return false;

				let year  = Number(value[0][0]),
					month = Number(value[0][1]),
					day   = Number(value[0][2]);

				if (isNaN(year) || year < 1900) return false;
				if (isNaN(month) || month < 1 || month > 12) return false;
				if (isNaN(day) || day < 1 || day > 31) return false;

				switch (month) {
					case 2:
						if (day > (28 + ((!(year % 4) && (year % 100)) || !(year % 400) ? 1 : 0))) return false;
						break;
					case 4:
					case 6:
					case 9:
						if (day > 30) return false;
						break;
				}

				return value.length > 1 ? $.isTime(value[1], true) : true;
		}
	};
	/**
	 * 是否为时间
	 *
	 * @param {*} value 判断值
	 * @param {boolean} [str=false] 是否检验字符串
	 * @returns {boolean}
	 */
	$.isTime = (value, str) => {
		switch ($.type(value, true)) {
			default:
				return false;
			case "date":
				return true;
			case "string":
				if (!(str === true)) return false;
				value = value.trim().replace(/\./g, ":").split(":");
				if (value.length < 3 || value.length > 4) return false;
				if (value.length == 3) value.push("0");

				let hour    = Number(value[0]),
					minute  = Number(value[1]),
					second  = Number(value[2]),
					msecond = Number(value[3]);

				if (isNaN(hour) || isNaN(minute) || isNaN(second) || isNaN(msecond)) return false;
				if (hour < 0 || hour > 23) return false;
				if (minute < 0 || minute > 59) return false;
				if (second < 0 || second > 59) return false;
				if (msecond < 0 || msecond > 999) return false;

				return true;
		}
	};
	/**
	 * 是否为guid
	 *
	 * @param {*} value 判断值
	 * @returns {boolean}
	 */
	$.isGuid = value => {
		if (typeof(value) != "string") return false;
		value = value.replace(/([{}])/g, "");
		if (value.length != 36) return false;

		value = value.toLowerCase().split("-");
		if (value.length != 5) return false;

		for (let i = 0, dic = [8, 4, 4, 4, 12], c, d; i < value.length; i++) {
			d = value[i];
			if (d.length != dic[i]) return false;
			for (c of d) {
				c = c.codePointAt();
				if (!((c >= 48 && c <= 57) || (c >= 97 && c <= 102))) return false;
			}
		}

		return true;
	};
	/**
	 * 是否是两者之间，不安全判定方式
	 *
	 * @param {number} value
	 * @param {number} b1
	 * @param {number} b2
	 * @returns {boolean}
	 */
	$.between = (value, b1, b2) => {
		value = Number(value);
		b1 = Number(b1);
		b2 = Number(b2);

		return value >= b1 && value <= b2;
	};
	/**
	 * 获得回调函数
	 *
	 * @param {Array|arguments} value
	 * @param {number} [index=0] 参数序号
	 * @returns {function/null}
	 */
	$.callback = (value, index) => {
		if (!$.isArray(value, true)) return null;
		if (!$.isNumber(index)) index = 0;
		if (index < 0 || index >= value.length) return null;

		value = value[value.length - 1];

		return $.isFunction(value) ? value : null;
	};
	/**
	 * 对象遍历
	 *
	 * @param {Array|object|string|set|map} value
	 * @param {function} callback
	 * @param {boolean|number|object} opt 参数
	 *    @param {boolean} [opt.detail=false] 详细内容
	 *    @param {boolean} [opt.force=false] 强制array识别
	 *    @param {boolean} [opt.index=0] 起始遍历位置，value=array时生效
	 *    @param {boolean} [opt.desc=false] 倒序排列，value=array时生效
	 * @returns {boolean}
	 */
	$.each = (value, callback, opt) => {
		if (!value || !$.isFunction(callback, "async")) return false;

		let detail, force, index, desc, list;

		switch (typeof(opt)) {
			case "object":
				if (opt) {
					detail = opt.detail;
					force = opt.force;
					index = opt.index;
					desc = opt.desc
				}
				break;
			case "boolean":
				detail = opt;
				break;
			case "number":
				index = opt;
				break;
		}
		detail = detail === true;
		force = force === true;
		index = $.isNumber(index) ? index : 0;
		desc = desc === true;
		list = value;

		switch (force ? "array" : $.type(value, true)) {
			default:
				return false;
			case "string":
			case "set":
				list = Array.from(value);
			case "array":
			case "arguments":
				if (index < 0) return false;

				let n = desc ? -1 : 1,
					i = (desc ? list.length - 1 : 0) + index * n,
					l, d;

				if (i < 0 || i >= list.length) l = i * -1;
				else l = desc ? 1 : list.length * -1;

				for (; i + l; i += n) {
					d = list[i];
					if (callback.apply(value, [d, i, detail ? $.type(d, true) : value, value]) === false) return false;
				}

				return true;
			case "object":
			case "function":
				desc = list;
				list = new Map();
				for (index in desc) list.set(index, desc[index]);
			case "map":
				let o = [null, null],
					k, v;
				for (o of list) {
					k = o[0];
					v = o[1];
					if (callback.apply(value, [v, k, detail ? $.type(v, true) : value, value]) === false) return false;
				}
				return true;

		}
	};
	/**
	 * 去重复
	 *
	 * @param {Array} value
	 * @param {boolean} [write=false] 是否更改源
	 * @returns {Array}
	 */
	$.unique = (value, write) => {
		if (!$.isArray(value, true)) return [];

		let result = Array.from(new Set(value));

		if (write === true) {
			value.splice(0, value.length);
			for (let i = 0; i < result.length; i++) value.push(result[i]);
		}

		return result;
	};
	/**
	 * 判断值是否存在
	 *
	 * @param {*} value
	 * @param {Array|object|set|map} list
	 * @param {function} callback
	 * @returns {boolean}
	 */
	$.has = (value, list, callback) => {
		let result = false;

		if (!$.isFunction(callback)) callback = null;

		switch ($.type(list, true)) {
			case "array":
			case "arguments":
			case "object":
				$.each(list, (d, k) => {
					if (!Object.is(value, d)) return;
					result = true;
					if (callback && (callback(k) === true)) return;

					return false;
				});
				break;
			case "set":
			case "map":
				result = list.has(value);
				break;
		}

		return result;
	};
	/**
	 * 深入合并，前项覆盖后项
	 *
	 * @param {*} src
	 * @param {*} dest
	 * @param {boolean|object} opt 参数，opt=boolean时，默认匹配opt.deep参数
	 *    @param {boolean} [opt.deep=false] 深入copy
	 *    @param {boolean} [opt.write=true] 改写dest
	 * @param {function} callback
	 * @returns {*}
	 */
	$.clone = (src, dest, opt, callback) => {
		let type   = $.type(src, true),
			simple = $.isSimple(dest);

		if (!$.has(type, ["array", "object", "function", "set", "map"])) return src;
		else if (!simple && $.type(dest, true) != type) return dest;

		const cbset   = (dest, key, odata, ndata, type) => {
				  return callback ? callback.apply(dest, [key, ndata, type, odata]) : ndata;
			  },
			  upset   = (type, dest, k, d, t) => {
				  switch (type) {
					  case "set":
						  return dest.add(d);
					  case "map":
						  return dest.set(k, cbset(dest, k, dest.has(k) ? dest.get(k) : void(0), d, t));
					  case "array":
						  return dest.length > k ? dest[k] = cbset(dest, k, dest[k], d, t) : dest.push(cbset(dest, k, void(0), d, t));
					  default:
						  return dest[k] = cbset(dest, k, dest[k], d, t);
				  }
			  },
			  deepset = (state, src, dest, k) => {
				  if (!state) return;
				  $.clone(src, dest, true, (key, nd, t, od) => callback ? callback.apply(dest, [k + "." + key, nd, t, od]) : nd);
			  };

		if (opt === void(0)) opt = dest;
		if (callback === void(0)) callback = opt;

		let deep, write;

		switch (typeof(opt)) {
			case "object":
				if (opt) {
					deep = opt.deep;
					write = opt.write;
				}
				break;
			case "boolean":
				deep = opt;
				break;
		}
		deep = deep === true;
		write = write !== false;
		if (!$.isFunction(callback)) callback = null;

		if (simple) {
			switch (type) {
				case "function":
					return src;
				case "set":
					dest = new Set();
					break;
				case "map":
					dest = new Map();
					break;
				case "array":
					dest = [];
					break;
				default:
					dest = {};
					break;
			}
		}
		if (!write) dest = $.clone(dest, null, true);

		$.each(src, (d, k, t) => {
			if (Object.is(src, d)) return;

			if (!deep) upset(type, dest, k, d, t);
			else {
				switch (t) {
					default:
						upset(type, dest, k, d, t);
						break;
					case "null":
					case "undefined":
						upset(type, dest, k, null, "null");
						break;
					case "object":
						upset(type, dest, k, {}, "object");

						deepset($.isObject(dest[k]), d, dest[k], k);
						break;
					case "array":
					case "arguments":
						upset(type, dest, k, [], "array");

						deepset(d.length > 0 && $.isArray(dest[k]), d, dest[k], k);
						break;
					case "set":
						upset(type, dest, k, new Set(), "set");

						deepset(d.size > 0 && $.type(dest[k], true) == "set", d, dest[k], k);
						break;
					case "map":
						upset(type, dest, k, new Map(), "map");

						deepset(d.size > 0 && $.type(dest[k], true) == "map", d, dest[k], k);
						break;
				}
			}
		}, true);

		return dest;
	};
})(this);
/**
 * ==========================================
 * Name:           jShow's Class Extensions
 * Author:         j-show
 * CreTime:        2019-02-14
 * Description:    Class Extensions
 * Log:
 * 2019-02-14    Init Class
 * ==========================================
 */
($ => {
	/*
	 ====================================
	 = 类名: TObject
	 = 功  能: 基类
	 = 类函数：
	 =   create    = 初始化函数
	 = 对象属性：
	 =   className  = 函数名
	 =   errorMax   = 记录错误上限
	 =   lastError  = 最后次错误记录
	 = 对象函数：
	 =   free       = 注销
	 =   on         = 事件绑定
	 =   off        = 事件移除
	 =   call       = 事件调用
	 =   getError   = 获得指定错误记录
	 =   setError   = 设置错误记录
	 =   clearError = 清除错误记录
	 ====================================
	 */
	class TObject {
		constructor () {
			this.__className = "TObject";

			this.__error_list = [];
			this.__error_max = 5;
			this.__event_list = {};
			this.__event_max = 99;
		}

		free () {

		}

		on (key, func) {
			if (!$.isString(key)) return this;

			let list = this.__event_list[key] || (this.__event_list[key] = []),
				max  = this.__event_max,
				each = (o, l, n, m) => {
					for (let i = n, f; i < l.length; i++) {
						switch ($.type(f = l[i], true)) {
							case "function":
								o.push(f);
								if (o.length > m) o.pop();
								break;
							case "array":
								each(o, f, 0, m);
								break;
						}
					}
				};

			each(list, arguments, 1, max);

			return this;
		}

		off (key, func) {
			if (arguments.length < 1) this.__event_list = {};
			else if (typeof(func) !== "function") this.__event_list[key] = [];
			else {
				let list = this.__event_list[key] || [];

				for (let i = 0; i < list.length;) {
					if (Object.is(func, list[i])) list.splice(i, 1);
					else i++;
				}
			}

			return this;
		}

		async call (key, arg) {
			const dtd  = $.Deferred(true),
				  list = this.__event_list[key] || [];

			arg = Array.prototype.slice.call(arguments, 1);
			if (arg.length === 1 && $.isArray(arg[0])) arg = arg[0];

			try {
				for (let i = 0, f; i < list.length; i++) {
					switch ($.type(f = list[i], true)) {
						case "function":
							list[i].apply(this, arg);
							break;
						case "asyncfunction":
							await list[i].apply(this, arg);
							break;
					}
				}
			}
			catch (e) {
				dtd.reject(e);
			}

			dtd.resolve(key);

			return dtd.promise();
		}

		getError (index) {
			let list = this.__error_list;

			if (!$.isNumber(index, {min: 0, max: list.length})) return null;

			return index < list.length ? list[index] : null;
		}

		setError (level, code = level, msg = code) {
			if (!$.has(level, ["log", "info", "error"])) level = "log";
			if (!$.isNumber(code)) code = -1;
			if (!$.isString(msg)) msg = "";

			let list = this.__error_list,
				max  = this.__error_max,
				err  = {level, code, msg};

			while (list.length > max) list.shift();
			list.push(err);

			this.call("error", [err]);

			return list[list.length - 1];
		}

		clearError () {
			this.__error_list = [];

			return this;
		}

		get className () {
			return this.__className;
		}

		get errorMax () {
			return this.__error_max;
		}

		set errorMax (value) {
			if (!$.isNumber(value, {min: 1, max: 99})) return;

			this.__error_max = value;

			let list = this.__error_list;

			while (list.length > value) list.shift();
		}

		get lastError () {
			let list = this.__error_list;

			return list.length > 0 ? list[list.length - 1] : null;
		}

		static create () {
			return new TObject();
		}
	}

	/*
	 ====================================
	 = 类名: TSeal
	 = 功  能: 密封类生成
	 = 对象属性：
	 =   className = 函数名
	 = 对象函数：
	 =   clone     = 复制本体
	 =   Create    = 初始化
	 ====================================
	 */
	$.TSeal = (() => {
		const initClassError = function () {
				  if (this.getError || this.setError || this.lastError) return;
				  this.__error__ = [];
				  this.errorMax = 5;
				  this.getError = function (index) {
					  index = $.isNumber(index, {min: 0}) ? index : -1;

					  let list = this.__error__;

					  return list.length < 1 ? null : list[index < 0 ? list.length - 1 : index];
				  };
				  this.setError = function (level, code, msg) {
					  if (arguments.length < 2) code = level;
					  if (arguments.length < 3) msg = code;

					  if (!$.has(level, ["log", "info", "error"])) level = "log";
					  if (!$.isNumber(code)) code = -1;
					  if (!$.isString(msg)) msg = "";

					  let list = this.__error__,
						  err  = {level, code, msg};

					  while (list.length >= this.errorMax) list.shift();
					  list.push(err);

					  this.call("error", [err]);

					  return list[list.length - 1];
				  };
				  this.lastError = function () {
					  let list = this.__error__;

					  return list.length > 0 ? list[list.length - 1] : null;
				  };
			  },
			  initClassEvent = function () {
				  if (this.on || this.off || this.call) return;
				  this.__event__ = {};
				  this.on = function (key, func) {
					  let each = (o, l, n) => {
							  for (let i = n, f; i < l.length; i++) {
								  f = l[i];

								  switch ($.type(f, true)) {
									  case "function":
										  o.push(f);
										  break;
									  case "array":
										  each(o, f, 0);
										  break;
								  }
							  }
						  },
						  list = this.__event__[key] || (this.__event__[key] = []);

					  each(list, arguments, 1);

					  return this;
				  };
				  this.off = function (key, func) {
					  if (arguments.length == 0) this.__event__ = {};
					  else if (typeof(func) != "function") this.__event__[key] = [];
					  else {
						  let list = this.__event__[key];

						  if (list && list.length > 0) {
							  for (let i = 0; i < list.length; i++) {
								  if (func !== list[i]) i++;
								  else list.splice(i, 1);
							  }
						  }
					  }

					  return this;
				  };
				  this.call = function (key, arg) {
					  let list = this.__event__[key];

					  if (list && list.length > 0) {
						  if (arguments.length < 2) arg = [];
						  else if (!$.isArray(arg)) arg = [arg];

						  for (let i = 0; i < list.length; i++) list[i].apply(this, arg);
					  }

					  return this;
				  };
			  };

		function TSeal () {}

		TSeal.extend = function (childAPI) {
			if (!$.isObject(childAPI)) throw new Error(console.error("[TSeal] object is null"));

			const className   = childAPI.className || "TSeal",
				  parentClass = TSeal,
				  initChild   = function () {
					  initClassError.call(this);
					  initClassEvent.call(this);

					  this["create"].apply(this, arguments);

					  return this;
				  };

			let childClass = null;

			eval("childClass=function " + className + "(){return initChild.apply(this,arguments);}");

			childClass.prototype = Object.create(parentClass.prototype);
			childClass.className = className;

			(CLASS => {
				$.each(childAPI, (d, k) => {
					if (Object.is(CLASS[k], d)) return;

					CLASS[k] = $.clone(d, true);
				});
			})(childClass.prototype);

			return childClass;
		};
		TSeal.className = "TSeal";
		TSeal.prototype = {
			className: "TSeal",
			create:    function () { return this; },
			free:      function () {},
			clone:     function () { return $.clone(this, true); }
		};

		return TSeal;
	})();

	/*
	 ====================================
	 = 类名: TCache
	 = 功  能：缓存类，基于Buffer进行缓存循环运用
	 = 继  承：TObject
	 = 类函数：
	 =   create    = 初始化函数
	 = 对象属性：
	 =   max       = 最大缓冲大小
	 =   index     = 当前数据位
	 =   length    = 有效数据长度
	 =   offset    = 空白数据起始位
	 =   surplus   = 剩余缓冲大小
	 = 对象函数：
	 =   valueOf   = 真实数据块
	 =   clear     = 清空缓存
	 =   resize    = 数据整理
	 =   push      = 推入数据
	 =   remove    = 删除数据
	 ====================================
	 */
	class TCache extends TObject {
		constructor (size) {
			super();

			this.__className = "TCache";

			this._max = $.isNumber(size, {min: 32, max: 10240}) ? size : 128;
			this._index = 0;
			this._length = 0;

			this._cache = Buffer.alloc(this._max);
		}

		free () {
			this._cache = null;
		}

		valueOf () {
			return this._cache;
		}

		resize (force) {
			if (force === true) this.clear();
			else {
				if (this._length > 0) this.valueOf().copy(this.valueOf(), 0, this.index, this.offset);

				this._index = 0;
			}

			return this.surplus;
		}

		clear () {
			this._index = 0;
			this._length = 0;

			return this;
		}

		push (buf) {
			let offset = buf.byteOffset,
				count  = buf.byteLength,
				write;

			while (count > 0) {
				write = Math.min(count, (write = this.surplus) > 0 ? write : this.resize());
				if (write < 1) write = this.resize(true);

				buf.copy(this.valueOf(), this.offset, offset, offset + write);

				this._length += write;
				offset += write;
				count -= write;

				if (this.parse) this.parse();
			}

			return this;
		}

		remove (size) {
			size = Math.min(size, this.length);

			this._index += size;
			this._length -= size;

			return this;
		}

		get max () {
			return this._max;
		}

		get index () {
			return this._index;
		}

		get length () {
			return this._length;
		}

		get offset () {
			return this._index + this._length;
		}

		get surplus () {
			return this.max - this.offset;
		}

		static create (size) {
			return new TCache(size);
		}

		static alloc (max) {
			return new TCache(max);
		}
	}

	/*
	 ====================================
	 = 类名: TList
	 = 功  能: 队列类
	 = 继  承：TObject
	 = 对象属性：
	 =   length    = 数据长度
	 =   type      = 数据限定类型
	 =   first     = 首个数据
	 =   last      = 尾端数据
	 = 对象函数：
	 =   clear     = 清空数据
	 =   sort      = 数据排序，接受自定义排序函数
	 =   each      = 数据检索，遍历函数为true时，删除遍历项
	 =   set       = 设置数据，校验数据类型
	 =   del       = 删除数据
	 =   add       = 添加数据，校验数据类型
	 =   addList   = 批量添加数据
	 =   push      = 先进后出，添加数据
	 =   pop       = 先进后出，获取数据
	 =   put       = 先进先出，添加数据
	 =   poll      = 先进先出，获取数据
	 ====================================
	 */
	(function (TObject) {
		const isType   = (obj, type) => {
				  let objType;

				  if (!type || type == "*" || (type == (objType = $.type(obj, true)))) return true;
				  if (type == "object" && (objType == "null" || objType == "undefined")) return false;
				  if (objType != "object") return false;
				  if (type == "date" && obj.className == "TChinaDate") return true;

				  return false;
			  },
			  fmtIndex = (index, def, max) => {
				  index = $.isNumber(index) ? index : def;

				  if (index < 0) index = -1;
				  else if (index >= max) index = max;

				  return index;
			  },
			  setData  = (own, data) => {
				  let i;

				  for (i = 0; i < own.length; i++) delete own[i];
				  for (i = 0; i < data.length; i++) own[i] = data[i];

				  if ((own.length = data.length) > 0) {
					  own.first = own[0];
					  own.last = own[own.length - 1];
				  }
				  else {
					  own.first = null;
					  own.last = null;
				  }
			  };

		class TList extends TObject {
			constructor (type) {
				super();

				this.__className = "TList";

				this._data = [];
				this._type = $.isString(type) ? type : "*";
				this._length = 0;
			}

			free () {
				super.free();

				this.clear();
			}

			valueOf () {
				return this._data;
			}

			clear () {
				this._data = [];
				this._length = 0;

				setData(this, this._data);

				this.call("clear");

				return this;
			}

			sort (func) {
				func = $.isFunction(func, true) ? func : null;

				let list = this.valueOf();

				list.sort.apply(this, func || []);

				setData(this, list);

				this.call("sort");

				return this;
			}

			each (func) {
				if (!$.isFunction(func, true)) return this;

				let list = this.valueOf();

				for (let i = 0, r; i < this.length;) {
					r = func(list[i]);

					if (r === true) this.del(i);
					else if (r === false) break;
					else i++;
				}

				return this;
			}

			set (index, data) {
				index = fmtIndex(index, -1, this.length);

				if (!isType(data, this.type)) return -1;

				this._data[index] = data;

				this.call("set", {index: index, data: data});

				return index;
			}

			del (index) {
				if (this.length === 0) return null;

				index = fmtIndex(index, 0, this.length - 1);

				let list = this.valueOf(),
					result;

				if (index <= 0) result = list.shift();
				else if (index >= this.length - 1) result = list.pop();
				else {
					result = list[index];

					list.splice(index, 1);
				}

				setData(this, list);

				this.call("del", {index: index});

				return result;
			}

			add (data, index) {
				index = fmtIndex(index, this.length, this.length);

				if (!isType(data, this.type)) return -1;

				let list = this.valueOf();

				if (index <= 0) {
					list.unshift(data);

					index = 0;
				}
				else if (index >= this.length) list.push(data);
				else list.splice(index, 0, data);

				setData(this, list);

				this.call("add", {index: index, data: data});

				return index;
			}

			addList (data, index) {
				if ($.isArray(data) && data.length > 0) {
					index = fmtIndex(index, this.length, this.length);

					let _this = this;

					$.each(data, function (d, i) {
						_this.add(d, index + i);
					});
				}

				return this;
			}

			push (data) {
				return this.add(data, this.length);
			}

			pop () { return this.del(this.length); }

			put (data) { return this.add(data, 0); }

			poll () { return this.del(0); }

			get length () {
				return this._length;
			}

			get type () {
				return this._type;
			}
		}

		$.TList = TList;
	})(TObject);

	/*
	 ====================================
	 = 类名: TChinaDate
	 = 功  能: 中文日期类
	 = 类函数：
	 =   toString   = 转换为字符串
	 = 对象属性：
	 =   Year,Month,Day,Term,Zodiac  = 年，月，日，节气，星座
	 =   CYear,CMonth,CDay           = 农历年，农历月，农历日
	 =   IsLeapYear                  = 是否是闰年
	 = 对象函数：
	 =   getTime    = 获取当前毫秒数
	 =   setTime    = 设置当前时间
	 =   toString   = 转换为字符串
	 ====================================
	 */
	(function (TObject) {
		const ct          = {
				  monthInfoDt: new Date(1900, 0, 31),
				  monthInfo:   [
					  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
					  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
					  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
					  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
					  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
					  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0,
					  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
					  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6,
					  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
					  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
					  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
					  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
					  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
					  0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
					  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0
				  ],
				  termInfo:    [
					  0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551, 218072, 240693,
					  263343, 285989, 308563, 331033, 353350, 375494, 397447, 419210, 440795, 462224, 483532, 504758
				  ],
				  tianGan:     ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"],
				  diZhi:       ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"],
				  monthStr:    ["月", "正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"],
				  dayStr:      [
					  ["日", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"],
					  ["初", "十", "廿", "卅", "　"]
				  ],
				  termStr:     [
					  "小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨", "立夏", "小满", "芒种", "夏至",
					  "小暑", "大暑", "立秋", "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至"
				  ],
				  zodiacStr:   ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"]
			  },
			  getTGDZ     = num => {
				  num = $.isNumber(num) ? num : 0;

				  return ct.tianGan[num % 10] + ct.diZhi[num % 12];
			  },
			  getZodiac   = num => ct.zodiacStr[(num - 4) % 12],
			  getTermDate = (year, month) => {
				  return (new Date((31556925974.7 * (year - 1900) + ct.termInfo[month % ct.termInfo.length] * 60000) + Date.UTC(1900, 0, 6, 2, 5))).getUTCDate();
			  },
			  getTerm     = (year, month, date) => {
				  let term = [getTermDate(year, month * 2), getTermDate(year, month * 2 + 1)];

				  for (let i = 0; i < term.length; i++) {
					  if (term[i] == date) return ct.termStr[(month * 2 + i) % ct.termStr.length];
				  }

				  return "";
			  },
			  getYear     = num => getTGDZ(num - 1864),
			  getMonth    = (num, leap) => {
				  return (leap ? "闰" : "") + ct.monthStr[num % ct.monthStr.length];
			  },
			  getDay      = num => {
				  return ct.dayStr[1][(num - num % 10) / 10] + ct.dayStr[0][num % 10 + (num % 10 ? 0 : 10)];
			  };

		class TChinaDate extends TObject {
			constructor (dt) {
				super();

				this.__className = "TChinaDate";

				this._nt = {year: 0, month: 0, day: 0};
				this._dt = new Date();

				this._Year = "";
				this._Month = "";
				this._Day = "";
				this._Term = "";
				this._Zodiac = "";
				this._cYear = "";
				this._cMonth = "";
				this._cDay = "";
				this._IsLeapYear = false;

				this.setTime(dt);
			}

			get Year () {
				return this._Year;
			}

			get Month () {
				return this._Month;
			}

			get Day () {
				return this._Day;
			}

			get Term () {
				return this._Term;
			}

			get Zodiac () {
				return this._Zodiac;
			}

			get CYear () {
				return this._cYear;
			}

			get CMonth () {
				return this._cMonth;
			}

			get CDay () {
				return this._cDay;
			}

			get IsLeapYear () {
				return this._IsLeapYear;
			}

			valueOf () {
				return this.getTime();
			}

			getTime () {
				return this._dt.getTime();
			}

			setTime (dt) {
				const getLeapYearMonth = year => {
						  return ct.monthInfo[year - ct.monthInfoDt.getFullYear()] & 0xf;
					  },
					  getLeapYearDay   = year => {
						  return getLeapYearMonth(year) ? ((ct.monthInfo[year - ct.monthInfoDt.getFullYear()] & 0x10000) ? 30 : 29) : 0;
					  },
					  getTotalYearDay  = year => {
						  let sum   = 348,
							  minfo = ct.monthInfo[year - ct.monthInfoDt.getFullYear()];

						  for (let i = 0x8000; i > 0x8; i >>= 1) sum += (minfo & i) ? 1 : 0;

						  return sum + getLeapYearDay(year);
					  },
					  getTotalMonthDay = (year, month) => {
						  return (ct.monthInfo[year - ct.monthInfoDt.getFullYear()] & (0x10000 >> month)) ? 30 : 29;
					  };

				switch ($.type(dt, true)) {
					case "date":
						this._dt.setTime(dt.getTime());
						break;
					case "number":
						this._dt.setTime(dt);
						break
				}

				let temp   = 0,
					leap   = 0,
					offset = parseInt((this._dt - ct.monthInfoDt) / 86400000),
					nt     = this._nt,
					i;

				nt.year = 0;
				nt.month = 14;
				nt.day = offset + 40;

				for (i = ct.monthInfoDt.getFullYear(); i < ct.monthInfoDt.getFullYear() + ct.monthInfo.length && offset > 0; i++) {
					temp = getTotalYearDay(i);

					offset -= temp;
					nt.month += 12;
				}

				if (offset < 0) {
					offset += temp;
					i--;
					nt.month -= 12;
				}

				nt.year = i;
				this._IsLeapYear = false;

				leap = getLeapYearMonth(i);

				for (i = 1; i < 13 && offset > 0; i++) {
					if (leap > 0 && i == (leap + 1) && !this._IsLeapYear) {
						i--;
						this._IsLeapYear = true;
						temp = getLeapYearDay(nt.year);
					}
					else
						temp = getTotalMonthDay(nt.year, i);

					if (this._IsLeapYear && i == (leap + 1)) this._IsLeapYear = false;

					offset -= temp;

					if (!this._IsLeapYear) nt.month++;
				}

				if (offset < 0) {
					offset += temp;

					i--;
					nt.month--;
				}
				else if (offset == 0 && leap > 0 && i == leap + 1) {
					if (!this._IsLeapYear) {
						i--;
						nt.month--;
					}

					this._IsLeapYear = !this._IsLeapYear;
				}

				this._cYear = getTGDZ(nt.year - 1864);
				this._cMonth = getTGDZ(nt.month);
				this._cDay = getTGDZ(nt.day);

				nt.month = i;
				nt.day = offset + 1;

				this._Year = getYear(nt.year);
				this._Month = getMonth(nt.month, this._IsLeapYear);
				this._Day = getDay(nt.day);
				this._Term = getTerm(nt.year, nt.month, this._dt.getDate());
				this._Zodiac = getZodiac(this._dt.getFullYear());

				return this;
			}

			toString (fmt) {
				let result = $.isString(fmt) ? fmt : "Y年(Z) M月 D T";

				if (/((CY|CM|Y|M|D|T|Z)+)/.test(result)) {
					fmt = {
						"CY+": this.cYear,
						"CM+": this.cMonth,
						"CD+": this.cDay,
						"Y+":  this.Year,
						"M+":  this.Month,
						"D+":  this.Day,
						"T+":  this.Term,
						"Z+":  this.Zodiac
					};

					$.each(fmt, function (d, k) {
						let rxp = new RegExp("(" + k + ")", "g");

						if (rxp.test(result)) result = result.replace(rxp, d + "");
					});
				}

				return result.trim();
			}

			static toString (fmt, date = fmt) {
				if (!$.isDate(date)) date = new Date();

				return (new TChinaDate(date)).toString(fmt);
			}
		}

		$.TChinaDate = TChinaDate;
	})(TObject);

	/*
	 ====================================
	 = 类名: TGuid
	 = 功  能: Guid类
	 = 对象函数：
	 =   New          = 获取新Guid
	 =   toString     = 获取字符串
	 =   toByteArray  = 获取字节数据
	 ====================================
	 */
	class TGuid extends TObject {
		constructor (data) {
			super();

			this.__className = "TGuid";

			this._value = [0, 0, 0, 0, 0];
			this._gd = [4, 2, 2, 2, 6];

			switch ($.type(data, true)) {
				case "string":
					data = data.replace(/^(\{)|(\})$/g, "").split("-");
					break;
				case "array":
					if (data.length === this._gd.length) break;
				default:
					data = [];
					break;
			}

			if (data.length !== this._gd.length) return;

			let fmt = (d, i, t, list) => {
				switch (t) {
					case "string":
						d = "0x" + d;
						break;
					case "number":
						if (!isNaN(d = parseInt(d))) break;
					default:
						return false;
				}

				if (d < 0 || d >= Math.pow(2, 8 * gd[i])) return false;

				list[i] = d;
			};

			if ($.each(data, fmt)) this._value = data;
		}

		valueOf () {
			return this.toString();
		}

		toString () {
			const com   = (s, l) => {
					  while (s.length < l * 2) s = "0" + s;

					  return s;
				  },
				  value = this._value,
				  gd    = this._gd;

			let result = [];

			for (let i = 0; i < value.length; i++) result.push(com(value[i].toString(16), gd[i]));

			return result.join("-");
		}

		toByteArray () {
			const des   = (r, d) => {
					  d.reverse();
					  for (let i = 0; i < d.length; i++) if (d[i].length > 0) r.push(parseInt("0x" + d[i]));
				  },
				  value = this._value;

			let result = [];

			for (let i = 0; i < value.length; i++) des(result, value[i].toString(16).split(/(\w{2})/g));

			return result;
		}

		New () {
			const rmd = l => Math.round(Math.random() * (Math.pow(2, 8 * l) - 1)),
				  gd  = this._gd;

			let result = [];

			for (let i = 0; i < gd.length; i++) result.push(rmd(gd[i]));

			return this;
		}

		static toString () {
			return (new TGuid()).New().toString();
		}

		static toByteArray () {
			return (new TGuid()).New().toByteArray();
		}

		static New () {
			return (new TGuid()).New();
		}
	}

	$.TObject = TObject;
	$.TCache = TCache;
	$.TGuid = TGuid;

	/**
	 * 队列函数
	 *
	 * @param {string} [type=*] 限定类型，对输入内容进行过滤
	 * @returns {object}
	 */
	$.List = type => (new $.TList(type));
	/**
	 * 中文日期函数
	 *
	 * @param {date} [dt=now]
	 * @returns {object}
	 */
	$.ChinaDate = dt => (new $.TChinaDate(dt));
	/**
	 * New Guid
	 *
	 * @returns {object}
	 */
	$.NewGuid = () => (new $.TGuid()).New();
	/**
	 * Empty Guid
	 *
	 * @returns {object}
	 */
	$.EmptyGuid = () => (new $.TGuid());
})(this);
/**
 * ==========================================
 * Name:           jShow's Async Extensions
 * Author:         j-show
 * CreTime:        2019-02-20
 * Description:    Async Extensions
 * Log:
 * 2019-02-20    Init Async
 * ==========================================
 */
($ => {
	/*
	 ====================================
	 = 类名: TCallback
	 = 功  能: 回调类
	 = 对象函数：
	 =   lock        = 锁定状态
	 =   unlock      = 去除锁定
	 =   add         = 添加函数
	 =   del         = 删除指定函数
	 =   fire        = 触发调用
	 =   fireWith    = 触发调用,改变this指向
	 =   empty       = 清空回调列表
	 =   unique      = 去除重复函数
	 =   has         = 检测是否存在指定函数
	 ====================================
	 */
	class TCallback extends TObject {
		constructor (opt, limit, callback) {
			super();

			this.__className = "TCallback";

			this._locked = false;
			this._limit = limit;
			this._length = 0;

			this.__func = [];
			this.__arg = null;
			this.__opt = opt;
			this.__callback = callback || null;

			const getFuncs  = (list, callback) => {
					  $.each(list, (d, k, t) => {
						  switch (t) {
							  case "function":
								  callback(d);
								  break;
							  case "array":
								  if (d.length > 0) getFuncs(d, callback);
								  break;
						  }
					  }, true);
				  },
				  eachFuncs = (list, callback) => {
					  let i = 0;

					  while (i < list.length) {
						  if (callback(i, list[i]) !== false) i++;
					  }
				  },
				  fireFuncs = (list, data, once, done, prog) => {
					  if (list.length < 1) return done;

					  eachFuncs(list, (i, f) => {
						  f.apply(data[0], data[1]);

						  if (once) list.splice(i, 1);
						  if (prog) prog();
						  if (once) return false;
					  });

					  if (done) done();

					  return null
				  };

			this.__getFuncs = getFuncs;
			this.__eachFuncs = eachFuncs;
			this.__fireFuncs = fireFuncs;
		}

		get limit () {
			return this._limit;
		}

		get length () {
			return this._length;
		}

		get locked () {
			return this._locked;
		}

		lock () {
			return this._locked = true;
		}

		unlock () {
			return this._locked = false;
		}

		on () {
			if (this.locked) return this;

			let opt  = this.__opt,
				func = this.__func,
				arg  = this.__arg;

			this.__getFuncs(arguments, d => {
				func.push(d);
				if (func.length > this.__limit) func.pop();
			});
			this._length = func.length;

			if (opt.unique) this.unique();
			if (opt.memory && opt.fire && arg) this.__fireFuncs(func, arg, opt.once, this.__callback, d => this._length = func.length);

			return this;
		}

		off () {
			if (this.locked) return this;

			let _this = this,
				func  = this.__func;

			if (arguments.length == 0) func = this.__func = [];
			else {
				_this.__getFuncs(arguments, d => {
					_this.__eachFuncs(func, (i, f) => {
						if (Object.is(d, f)) {
							func.splice(i, 1);
							return false;
						}
					})
				});
			}

			this._length = func.length;

			return this;
		}

		has (func) {
			return this.__func.indexOf(func) !== -1;
		}

		unique () {
			if (!this._locked) {
				this._length = (this.__func = Array.from(new Set(this.__func))).length;
			}

			return this;
		}

		fire () {
			return this.fireWith(this, arguments);
		}

		fireWith (own, args, done) {
			if (arguments.length < 2) args = [];
			if (arguments.length < 1) own = this;

			let opt = this.__opt,
				arg;

			this.__arg = arg = [own, args.slice ? args.slice() : args];
			if (opt.memory && !opt.fire) {
				opt.fire = true;
				if (opt.limit) this.__arg = null;
			}
			else {
				let func = this.__func;

				this.__fireFuncs(func, arg, opt.once, done, d => this.length = func.length);
				if (this.__callback) this.__callback.apply(arg[0], arg[1]);
			}

			return this;
		}
	}

	/*
	 ====================================
	 = 类名: TDeferred
	 = 功  能: 异步类(观察者模式)
	 = 对象函数：
	 =   empty       = 清空回调列表
	 =   promise     = 操作对象
	 =   resolve     = 触发成功
	 =   reject      = 触发失败
	 =   alarm       = 触发警告
	 =   notify      = 触发进度
	 =   on          = 绑定事件
	 =   off         = 解除绑定
	 = 对象事件:
	 =   done        = 成功
	 =   fail        = 失败
	 =   warn        = 警告
	 =   progress    = 进度
	 =   always      = 结束
	 ====================================
	 */
	class TDeferred extends TObject {
		constructor (limit, callback) {
			super();

			let _this  = this,
				_state = _this.STATE,
				_event = _this.__event = {
					done:     $.Callback(limit).fire(),
					fail:     $.Callback(limit).fire(),
					warn:     $.Callback(limit).fire(),
					progress: $.Callback(limit).fire(),
					always:   $.Callback(limit, callback).fire()
				},
				_action = _this.__action = {
					resolve: _event.done,
					reject:  _event.fail,
					alarm:   _event.warn,
					notify:  _event.progress
				},
				_promise = _this.__promise = {
					state:   _state.inited,
					on:      function () {
						_this.on.apply(_this, arguments);
						return this;
					},
					off:     function () {
						_this.off.apply(_this, arguments);
						return this;
					},
					promise: function () { return _this.promise.apply(_this, arguments); }
				};

			_this._state = _state.pending;
			_this.__owner = void(0);
			_this.__surp = 0;

			_event.done.on(e => {
				_this.__promise.state = _this._state = _state.resolved;
				_event.fail.lock();
				_event.warn.lock();
				_event.progress.lock();
			});
			_event.fail.on(e => {
				_this.__promise.state = _this._state = _state.rejected;
				_event.done.lock();
				_event.warn.lock();
				_event.progress.lock();
			});

			$.each(_event, (d, k) => {
				_promise[k] = _this[k] = function () {
					d.on(Array.from(arguments));
					return this;
				};
			});

			$.each(_action, (d, k) => {
				_this[k] = function () {
					_this[k + "With"](_this, arguments);

					return this;
				};
				_this[k + "With"] = function (own, arg) {
					own = own || _this.__owner;
					d.fireWith(own, arg);

					if (_this.state == k) _event.always.fireWith(own, arg);
					else if (k == "notify" && --_this.__surp < 1) _this["resolveWith"](own, arg);

					return this;
				};
			});
		}

		get state () {
			return this._state;
		}

		get STATE () {
			return {
				inited:   0,
				pending:  1,
				resolved: "resolve",
				rejected: "reject"
			};
		}

		on (tag, callback) {
			if (this.__event[tag]) this.__event[tag].on(callback);

			return this;
		}

		off (tag) {
			if (arguments.length == 0) $.each(this.__event, d => d.off());
			else if (this.__event[tag]) this.__event[tag].off();

			return this;
		}

		promise (own, max) {
			const STATE = this.STATE;

			switch (this.state) {
				case STATE.inited:
				case STATE.pending:
					this.__promise.state = this._state = STATE.pending;

					if (arguments.length == 1 && $.isNumber(own)) max = own;
					max = $.isNumber(max, {min: 0}) ? max : this.__surp;

					this.__owner = own === null ? void(0) : own;
					this.__surp = max > 0 ? max : 0;
					break;
			}

			return this.__promise;
		}
	}

	/**
	 * 异步链式对象,扩展Promise对象
	 *
	 */
	(Promise => {
		let prop = Promise.prototype;

		prop.end = function (onFulfilled, onRejected) {
			this.then(onFulfilled, onRejected)
				.catch(function (reason) {
					// 抛出一个全局错误
					setTimeout(() => { throw reason }, 0);
				});
		};
		prop.on = function (tag, callback) {
			switch (tag) {
				case "done":
				default:
					return this.then(callback);
				case "fail":
					return this.catch(callback);
				case "always":
					let P = this.constructor;

					return this.then(
						value => P.resolve(callback()).then(() => value),
						reason => P.resolve(callback()).then(() => { throw reason })
					);
				case "warn":
					if (this.__simple) this.__warn.on(callback);

					return this;
				case "progress":
					if (this.__simple) this.__progress.on(callback);

					return this;
			}
		};
		prop.done = function (callback) { return this.on("done", callback); };
		prop.fail = function (callback) { return this.on("fail", callback); };
		prop.always = prop.finally = function (callback) { return this.on("always", callback); };
		prop.warn = function (callback) { return this.on("warn", callback); };
		prop.progress = function (callback) { return this.on("progress", callback); };
		prop.resolve = function () {
			let arg = Array.prototype.push.apply([], arguments);

			this.__resolve.call(this, arg.length === 1 ? arg[0] : arg);

			return this;
		};
		prop.reject = function () {
			let arg = Array.prototype.push.apply([], arguments);

			this.__reject.call(this, arg.length === 1 ? arg[0] : arg);

			return this;
		};
		prop.alarm = function () {
			let arg = Array.prototype.push.apply([], arguments);

			this.__warn.fireWith(this, arg.length === 1 ? arg[0] : arg);

			return this;
		};
		prop.notify = function () {
			let arg = Array.prototype.push.apply([], arguments);

			if (this.__simple) {
				if (this.__limit > 0) {
					arg = arg.length === 1 ? arg[0] : arg;
					this.__progress.fireWith(this, arg);

					if (--this.__limit < 1) {
						this.__simple = false;
						this.__resolve.call(this, arg);
					}
				}
			}

			return this;
		};
		prop.promise = function (max) {
			if (this.__simple && $.isNumber(max, {min: 1})) this.__limit = max;
			else this.__simple = false;

			return this;
		};

		Promise.create = function (simple, callback) {
			let obj, done, fail;

			obj = new Promise(function (resolve, reject) {
				done = resolve;
				fail = reject;
			});
			obj.__resolve = done;
			obj.__reject = fail;

			obj.__simple = simple === true;
			if (obj.__simple) {
				obj.__warn = $.Callback(100).fire();
				obj.__progress = $.Callback(100).fire();
			}

			if (!callback) callback = simple;
			if (typeof(callback) === "function") callback(obj);

			return obj;
		};

		return Promise;
	})(Promise);

	/**
	 * 回调对象
	 *
	 * @param {string} [flag=once memory limit] 工作模式
	 * @param {number} [limit=50] 回调列表数量
	 * @param {function} callback 结束回调
	 * @returns {object}
	 */
	$.Callback = function (flag, limit, callback) {
		switch (arguments.length) {
			case 1:
				switch (typeof(flag)) {
					case "number":
						limit = flag;
						break;
					case "function":
						callback = flag;
						break;
				}
				break;
			case 2:
				if ($.isFunction(limit)) callback = limit;
				if ($.isNumber(flag)) limit = flag;
				break;
		}
		if (!$.isString(flag)) flag = "once memory limit";
		limit = $.isNumber(limit, {min: 1}) ? limit : 50;
		if (!$.isFunction(callback)) callback = null;

		let opt = {};

		flag.split(" ").forEach(d => opt[d] = true);

		if (opt.memory && !opt.limit) opt.fire = true;

		return new TCallback(
			{
				once:   opt.once === true,
				memory: opt.memory === true,
				limit:  opt.limit === true,
				unique: opt.unique === true,
				fire:   opt.fire === true
			},
			opt.simple === true ? 1 : parseInt(limit),
			callback);
	};

	/**
	 * 异步观察者对象
	 *
	 * @param {boolean} [simple=false] 是否用简单模式
	 * @param {function} [callback] 结束回调
	 * @returns {object}
	 */
	$.Deferred = function (simple, callback) {
		if (arguments.length == 1) callback = simple;

		if (!$.isFunction(callback)) callback = null;

		if (simple === true) return Promise.create(true, callback);
		else return (new TDeferred($.isNumber(simple, {min: 1}) ? simple : 50, callback));
	};

	/**
	 * 异步链式对象,扩展Promise对象
	 *
	 */
	$.Promise = callback => Promise.create(callback);

	/**
	 * Generator函数转Promise对象
	 *
	 * @param {Generator} gen 函数主体，必须是Generator函数
	 * @param {*} [data] 带入参数
	 * @param {*} [owner] 带入所有者
	 * @returns {object}
	 */
	$.Async = function (gen, data, owner) {
		if (!$.isGenerator(gen)) throw new Error("callback is not Generator");

		if ($.isNull(data)) data = [];
		else if (!$.isArray(data)) data = [data];
		if (!$.isObject(owner)) owner = null;

		const isFunc    = $.isFunction,
			  isPromise = $.isPromise,
			  isGen     = $.isGenerator,
			  toPromise = function (gen, data, owner, first) {
				  if (isPromise(gen)) return gen;

				  return new Promise(function (resolve, reject) {
					  const step = err => {
								let method = err ? "throw" : "next";

								return (arg, rev) => {
									try {
										rev = gen[method](arg);
									}
									catch (e) {
										return reject(e);
									}

									next(rev);
								};
							},
							then = (own, ok, fail) => own.then(ok || step(), fail || step(1)),
							next = rev => {
								if (rev.done) return resolve(rev.value);
								rev = rev.value;

								then(toPromise(rev, [], owner));
							};

					  if (isGen(gen) || (first && isFunc(gen))) gen = gen.apply(owner, data);

					  if (isPromise(gen)) gen.then(resolve, reject);
					  else if (!isGen(gen, true)) resolve(gen);
					  else step()();
				  });
			  };

		return toPromise(gen, data, owner, true);
	};

	/**
	 * 普通函数转Promise对象
	 * @param {function} func 普通函数
	 * @returns {Promise<*>}
	 * @constructor
	 */
	$.Done = async function (func) {
		const dtd = Promise.create();

		if ($.isFunction(func)) func = Promise.create(func);

		func.always(() => dtd.resolve());

		return dtd.promise();
	};
})(this);
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
/**
 * ==========================================
 * Name:           jShow's Load Module
 * Author:         j-show
 * CreTime:        2019-03-14
 * Description:    Node.js Load Module
 * Log:
 * 2019-03-14    Init Class
 * ==========================================
 */
($ => {
	if ($.mode !== $.MODE.Node) return;

	$.__require = $.require = (url, tag) => {
		if (tag === void(0)) tag = url;

		return this[tag] = require(url);
	};

	$.__define = $.define = (factory, own, deps, alias, exec) => {
		if ($.isFunction(factory) && exec !== false) factory = factory(own.module, own.exports, require);

		return own.module.exports = factory;
	}
})(this);


});