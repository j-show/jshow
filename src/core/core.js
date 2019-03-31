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