"use strict";
(function (global, factory) {
	if (global.jShow) return;

	const MODE = {
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
	};

	const jShow = {
		ver: "1.0.5",
		...(factory.call(global, MODE))
	};

	global.jShow = jShow;

	if (jShow.mode === MODE.Node) module.exports = jShow;
})(typeof (window) !== "undefined" ? window : global, function (global, MODE) {
	let jShow = {};

	if (!global.navigator) global.navigator = {userAgent: ""};

	jShow.MODE = MODE;
	jShow.mode = MODE.Node;

	/**
	 * Get Javascript Env Version
	 *
	 * @param {string} [na=undefined] <version object>
	 * @returns {object}
	 *    @return {number} mode <value from MODE object>
	 *    @return {string} kernel <kernel name>
	 *    @return {string} version <kernel version>
	 */
	jShow.version = function parseKernelVersion (na = navigator.userAgent) {
		let nav     = na;
		let mode    = MODE.Node;
		let kernel  = "node";
		let version = "";

		try {
			if (!nav && (window === void 0) && process) {
				version = process.versions.node;
				return;
			}

			(nav => {
				let val = null;

				val = nav.match(/msie ([\d.]+)/);
				if (val && val.length > 1) {
					kernel  = "msie";
					version = val[1];
					return;
				}

				val = nav.match(/firefox\/([\d.]+)/);
				if (val && val.length > 1) {
					kernel  = "firefox";
					version = val[1];
					return;
				}

				val = nav.match(/chrome\/([\d.]+)/);
				if (val && val.length > 1) {
					kernel  = "chrome";
					version = val[1];
					return;
				}

				val = nav.match(/opera.([\d.]+)/);
				if (val && val.length > 1) {
					kernel  = "opera";
					version = val[1];
					return;
				}

				val = nav.match(/version\/([\d.]+).*safari/);
				if (val && val.length > 1) {
					kernel  = "safari";
					version = val[1];
					return;
				}

				kernel  = "other";
				version = "0";
			})(nav.toLowerCase());

			mode = (nav => {
				if (nav.indexOf("Android") > -1 || nav.indexOf("Linux") > -1) return MODE.WebAndroid;

				if (nav.indexOf("iPhone") > -1) return MODE.WebiPhone;

				if (nav.indexOf("iPad") > -1) return MODE.WebiPad;

				if (nav.match(/\(i[^;]+;( U;)? CPU.+Mac OS/)) return MODE.WebMac;

				return MODE.WebDesktop;
			})(nav);
		}
		finally {
			return {mode, kernel, version};
		}
	};
	jShow.mode = jShow.version().mode;

	if (jShow.mode !== MODE.Node && !global.global) global.global = global;

	/**
 * ==========================================
 * Name:           jShow's Basic Function
 * Author:         j-show
 * CreTime:        2019-02-14
 * Description:    Basic Function Library
 * Log:
 * 2019-02-14    Init Library
 * 2019-05-19    Format Code to jShow Style Guide
 * ==========================================
 */
(owner => {
	const $ = global.jShow;

	const api = {
		/**
		 * Any type parse, return type string
		 *
		 * @param {object} value <target>
		 * @param {boolean} [detail=false] <is parse detail>
		 * @returns {string}
		 *        True:    boolean, number, string, function, null
		 *        False:    boolean, number, string, function, undefined, null, object, arguments, array, date, regexp
		 */
		type (value, detail = false) {
			const opt  = detail === true;
			const type = typeof value;
			const rxp  = v => (/^\[object (.*)\]$/.exec(Object.prototype.toString.call(v))[1]).toLowerCase();

			switch (type) {
				default:
				case "undefined":
					return opt ? "undefined" : "null";
				case "boolean":
				case "number":
				case "string":
					return type;
				case "function":
					return opt ? "function" : rxp(value);
				case "object": {
					if (value === null) return "null";
					if (!opt) return "object";
					if (value.jquery) return "jquery";

					if (value instanceof Array) return "array";
					if (value instanceof RegExp) return "regexp";

					let val = rxp(value);

					if (val.indexOf("html") === 0) return "dom";

					return val;
				}
			}
		},
		/**
		 * Between Judge, a and b
		 *
		 * @WANR: this function no safe
		 * @FIX: pls change this
		 *
		 * @param {number} value
		 * @param {number} a
		 * @param {number} b
		 * @returns {boolean}
		 */
		between (value, a, b) {
			const isNumber = $.isNumber;

			if (!isNumber(value, {int: false})) return false;
			if (isNumber(a, {int: false}) && value < a) return false;
			if (isNumber(b, {int: false}) && value > b) return false;

			return true;
		},
		/**
		 * Get callback function from array/arguments
		 *
		 * @param {Array|arguments} value <target>
		 * @param {object|number} opt <option>
		 *    @param {number} [opt.index=0] <start position>
		 *    @param {boolean} [opt.loop=true] <is loop check>
		 *    @param {boolean|string} [opt.type=async] <change function type is (normal,async,generator)>
		 * @returns {function/null}
		 */
		callback (value, opt = 0) {
			const list = [...value];

			if (list.length < 1) return null;

			let {
					index = 0,
					loop  = true,
					type  = "async"
				} = opt;

			switch (typeof(opt)) {
				case "boolean":
					loop = opt;
					break;
				case "number":
					index = opt;
					break;
			}

			loop = loop === true;

			if (!$.isNumber(index)) index = 0;
			if (index < 0) index += list.length;

			if (index < 0 || index >= list.length) return null;

			for (let i = list.length - 1, func = $.isFunction; i > 0; i--) {
				if (func(list[i], type)) return list[i];
				if (!loop) break;
			}

			return null;
		},
		/**
		 * Any each
		 *
		 * @param {Array|object|string|set|map} value <target>
		 * @param {function} callback
		 * @param {boolean|number|object} opt <option>
		 *    @param {boolean} [opt.detail=false] <is get value detail>
		 *    @param {boolean} [opt.force=false] <is force of array type>
		 *    @param {boolean} [opt.index=0] <start position, only type=array>
		 *    @param {boolean} [opt.desc=false] <is desc sort, only trype=array>
		 * @returns {boolean}
		 */
		each (value, callback, opt = false) {
			if (!value || !$.isFunction(callback, "async")) return false;

			let {
					detail = false,
					force  = false,
					index  = 0,
					desc   = false
				} = opt;

			switch (typeof(opt)) {
				case "boolean":
					detail = opt;
					break;
				case "number":
					index = opt;
					break;
			}

			detail = detail === true;
			force  = force === true;
			desc   = desc === true;

			let list = value;
			let type = $.type(list, true);

			switch (type) {
				case "string":
				case "set":
				case "arguments":
					list = [...list];
					type = "array";
					break;
				case "map":
					list = {};

					for (let [k, v] of value) list[k] = v;

					type = "object";
					break;
			}

			if (force) type = "array";

			switch (type) {
				default:
					return false;
				case "array": {
					type = $.type;

					if (!$.isNumber(index)) index = 0;
					if (index < 0) index += list.length;

					if (index < 0) return false;

					let n = desc ? -1 : 1;
					let i = (desc ? list.length - 1 : 0) + index * n;
					let l = desc ? 1 : list.length * -1;

					if (i < 0 || i >= list.length) l = i * -1;

					for (let d; i + l; i += n) {
						d = list[i];
						d = callback.call(value, d, i, (detail ? type(d, true) : list), value);
						if (d === false) return false;
					}

					break;
				}
				case "object":
				case "function": {
					type = $.type;

					let d;

					for (let k in list) {
						d = list[k];
						d = callback.call(value, d, k, (detail ? type(d, true) : list), value);
						if (d === false) return false;
					}

					break;
				}
			}

			return true;
		},
		/**
		 * Unique function
		 *
		 * @param {Array|set|map} value <src object>
		 * @param {boolean} [write=false] <is change src object>
		 * @returns {Array}
		 */
		unique (value, write = false) {
			if (!$.isArray(value, true)) return [];

			const opt    = write === true;
			const result = [];
			const len    = value.length;

			for (let i = 0, d; i < len; i++) {
				d = value[i];

				if (result.indexOf(d) > -1) continue;

				result.push(d);
				if (opt) value.push(d);
			}

			if (opt) value.splice(0, len);

			return result;
		},
		/**
		 * Exist judge value in list
		 *
		 * @param {*} value <target>
		 * @param {Array|object|set|map} list <check list>
		 * @param {function} callback
		 * @returns {boolean}
		 */
		has (value, list, callback) {
			let result = false;

			if (!$.isFunction(callback)) callback = null;

			switch ($.type(list, true)) {
				default:
					return false;
				case "set":
				case "map":
					return list.has(value);
				case "array":
				case "arguments":
				case "object":
				case "string":
					return $.each(list, (d, k) => {
						if (!Object.is(value, d)) return;
						if (callback && callback(k) === true) return;

						return false;
					});
			}

			return result;
		},
		/**
		 * Deep copy
		 *
		 * @param {*} src
		 * @param {*} dest
		 * @param {boolean|object} opt <option, when opt=boolean like change opt.deep>
		 *    @param {boolean} [opt.deep=false] <is deep copy>
		 *    @param {boolean} [opt.write=true] <is change src>
		 * @param {function} callback
		 * @returns {*}
		 */
		clone (src, dest = null, opt = false, callback = null) {
			let stype   = $.type(src, true);
			let dtype   = $.type(dest, true);
			let dsimple = $.isSimple(dest);

			if (!(stype in ["array", "object", "function", "set", "map"])) return src;
			if (!dsimple && stype !== dtype) return dest;

			let {
					deep  = false,
					write = true
				} = opt;

			if ($.isBool(opt)) deep = opt;

			deep  = deep === true;
			write = write === true;

			let result = dest;

			if (dsimple) {
				switch (stype) {
					default:
						result = {};
						break;
					case "set":
						result = new Set();
						break;
					case "map":
						result = new Map();
						break;
					case "function":
						result = src;
						break;
					case "array":
						result = [];
						break;
				}
			}
			else {
				if (!write) result = $.clone(result, null, true);
			}

			((src, dest, deep, callback) => {
				const cbset   = (dest, key, data, type, odata) => {
					return callback ? callback.call(dest, key, data, type, odata) : data;
				};
				const upset   = (mode, obj, key, data, type) => {
					let result;

					switch (mode) {
						case "array":
							if (obj.length <= key) obj.push(void(0));
						default:
							result   = cbset(obj, key, data, type, obj[key]);
							obj[key] = result;
							break;
						case "set":
							result = data;
							obj.add(result);
							break;
						case "map":
							if (!obj.has(key)) obj.set(key, void(0));

							result = cbset(obj, key, data, type, obj.get(key));
							obj.set(key, result);
							break;
					}

					return result;
				};
				const deepset = (state, src, dest, key) => {
					if (!state) return;

					$.clone(src, dest, true, (k, d, t, old) => cbset(dest, `${key}.${k}`, d, t, old));
				};

				let data,
					type,
					state,
					value;

				$.each(src, (d, k, t) => {
					if (Object.is(src, d)) return;

					if (deep) {
						data  = d;
						type  = t;
						state = false;

						switch (t) {
							case "object":
								data  = {};
								state = true;
								break;
							case "arguments":
								type = "array";
							case "array":
								data  = [];
								state = d.length > 0;
								break;
							case "set":
								data  = new Set();
								state = d.size > 0;
								break;
							case "map":
								data  = new Map();
								state = d.size > 0;
								break;
						}

						value = upset(stype, dest, k, data, type);
						deepset(state, d, value, k);
					}
					else {
						upset(stype, dest, k, d, t);
					}
				}, true);
			})(src, result, deep, ($.isFunction(callback) ? callback : null));

			return result;
		},
		/**
		 * Same judge
		 *
		 * @param {*} a
		 * @param {*} b
		 * @param {boolean} [abs=true] <is absolute check>
		 * @returns {boolean}
		 */
		is (a, b, abs = true) {
			if (abs === true) return Object.is(a, b);

			let type = [
				$.type(a, true),
				$.type(b, true)
			];

			if (type[0] !== type[1]) return false;

			switch (type[0]) {
				default:
					return Object.is(a, b);
				case "function":
					return a.toString() === b.toString();
				case "date":
					return a.getTime() === b.getTime();
				case "array":
				case "arguments":
				case "object":
					if (Object.keys(a).length !== Object.keys(b).length) return false;

					for (let k in a) {
						if (!Object.is(a[k], b[k])) return false;
					}

					return true;
			}
		},
		/**
		 * Type judge: simple
		 *
		 * @param {*} value
		 * @returns {boolean}
		 */
		isSimple (value) {
			switch (typeof(value)) {
				default:
					return value === null;
				case "undefined":
				case "boolean":
				case "number":
				case "string":
					return true;
			}
		},
		/**
		 * Type judge: null
		 *
		 * @param {*} value <target>
		 * @param {boolean|object} opt <option>
		 *    @param {boolean} [opt.udf=true] <undefined of null>
		 *    @param {boolean} [opt.obj=false] <array/object is empty of null>
		 * @returns {boolean}
		 */
		isNull (value, opt = true) {
			let {
					udf = true,
					obj = false
				} = opt;

			if ($.isBool(opt, false)) udf = opt;

			udf = udf === true;
			obj = obj === true;

			switch (typeof(value)) {
				default:
					return false;
				case "undefined":
					return udf;
				case "object":
					if (value === null) return true;
					if (!obj) return false;

					return Object.keys(value).length < 1;
			}
		},
		/**
		 * Type judge: boolean
		 *
		 * @param {*} value <target>
		 * @param {boolean} [str=false] <is parse string>
		 * @returns {boolean}
		 */
		isBool (value, str = false) {
			switch (typeof(value)) {
				default:
					return false;
				case "boolean":
					return true;
				case "string":
					if (str !== true) return false;

					return ({"true": true, "false": true})[value];
			}
		},
		/**
		 * Type judge: number
		 *
		 * @param {*} value <target>
		 * @param {boolean|object} opt <option>
		 *    @param {boolean} [opt.nan=false] <NaN of number>
		 *    @param {boolean} [opt.str=false] <is parse string>
		 *    @param {boolean} [opt.int=true] <is only parse integer>
		 *    @param {number} [opt.min=NaN] <min number allow by value>
		 *    @param {number} [opt.max=NaN] <max number allow by value>
		 * @returns {boolean}
		 */
		isNumber (value, opt = false) {
			let {
					nan = false,
					str = false,
					int = true,
					min = NaN,
					max = NaN
				} = opt;

			if ($.isBool(opt)) nan = opt;

			min = Number(min);
			max = Number(max);
			nan = nan === true;
			str = str === true;
			int = int === true;

			switch (typeof(value)) {
				default:
					return false;
				case "number":
					if (!nan && isNaN(value)) return false;

					if (int) {
						if (parseInt(value) !== value) return false;

						if (!isNaN(min)) min = parseInt(min);
						if (!isNaN(max)) max = parseInt(max);
					}

					if (!isNaN(min) && value < min) return false;
					if (!isNaN(max) && value > max) return false;

					return true;
				case "string":
					if (!str) return false;

					return $.isNumber(Number(value), {nan, int, min, max});
			}
		},
		/**
		 * Type judge: string
		 *
		 * @param {*} value <target>
		 * @param {object|boolean|number} [opt=*] <option>
		 *    @param {boolean} [opt.empty=false] <value is empty of string>
		 *    @param {number} [opt.min=NaN] <min number allow by value>
		 *    @param {number} [opt.max=NaN] <max number allow by value>
		 * @returns {boolean}
		 */
		isString (value, opt = false) {
			if (typeof (value) !== "string") return false;

			let {
					empty = false,
					min   = NaN,
					max   = NaN
				} = opt;

			switch (typeof(opt)) {
				case "boolean":
					empty = opt;
					break;
				case "number":
					min = opt;
					break;
			}

			min   = Number(min);
			max   = Number(max);
			empty = empty === true;

			if (empty) {
				min = 0;
				max = 0;
			}

			let len = value.length;

			if (!isNaN(min) && len < min) return false;
			if (!isNaN(max) && len > max) return false;

			return true;
		},
		/**
		 * Type judge: function
		 *
		 * @param {*} value 判断值
		 * @param {string|boolean} [type=false] <function type, allow normal/async/generator>
		 *     true <all function type>
		 *     false <only normal type>
		 *     async <normal/async type>
		 *     generator <noarmal/generator type>
		 * @returns {boolean}
		 */
		isFunction (value, type = true) {
			switch ($.type(value, true)) {
				default:
					return false;
				case "function":
					return true;
				case "asyncfunction":
					return (type !== true) || (type === "async") || (type === "all");
				case "generatorfunction":
					return (type !== true) || (type === "generator") || (type === "all");
			}
		},
		/**
		 * Type judge: array
		 *
		 * @param {*} value <target>
		 * @param {object|boolean} opt <option>
		 *    @param {boolean} [opt.empty=false] <value is empty of array>
		 *    @param {boolean} [opt.arg=false] <value is arguments of array>
		 *    @param {number} [opt.min=0] <min number allow by value.length>
		 * @returns {boolean}
		 */
		isArray (value, opt = false) {
			let {
					empty = false,
					arg   = false,
					min   = NaN
				} = opt;

			switch (typeof (opt)) {
				case "boolean":
					arg = opt;
					break;
				case "number":
					min = opt;
					break;
			}

			min = Number(min);
			if (empty === true) min = 0;

			switch ($.type(value, true)) {
				default:
					return false;
				case "array":
					return !isNaN(min) || (value.length > min);
				case "arguments":
					return (arg === true) && (!isNaN(min) || (value.length > min));
			}
		},
		/**
		 * Type judge: object
		 *
		 * @WARN: only check object like json, this function no safe
		 *
		 * @param {*} value <target>
		 * @param {string|boolean} [arg=object] <only parse object>
		 * @returns {boolean}
		 */
		isObject (value, arg = "object") {
			let result = typeof(value) === "object";

			if (!result) return false;

			switch (arg) {
				default:
					return value ? (value.constructor === Object) : false;
				case false:
					return value !== null;
				case true:
				case "any":
					return true;
			}
		},
		/**
		 * Type judge: Promise object
		 *
		 * @param {*} value <target>
		 * @returns {boolean}
		 */
		isPromise (value) {
			return $.type(value, true) === "promise";
		},
		/**
		 * Type judge: Generator function
		 *
		 * @param {*} value <target>
		 * @param {boolean} [obj=false] <is parse generator object>
		 * @returns {boolean}
		 */
		isGenerator (value, obj = false) {
			if (!value) return false;

			const isFunc = $.isFunction;

			if (isFunc(value, "generator")) return true;
			if (obj !== true || !$.isObject(value, "ang")) return false;

			return isFunc(value.next) && isFunc(value.throw);
		},
		/**
		 * Type judge: JSON
		 *
		 * @param {*} value <target>
		 * @param {function} [callback]
		 * @param {object} [out=null] <status object>
		 * @returns {boolean}
		 */
		isJSON (value, callback, out = {}) {
			if (!$.isString(value, 2)) return false;

			let {
					type   = [],
					escape = false,
					index  = 0
				} = out;

			if (!$.isArray(type)) type = [];
			escape = escape === true;
			if (!$.isNumber(index)) index = 0;

			const result = (o, v) => {
				if (callback) callback(o, v);
				return false;
			};

			if (!/^['"\[\{]/.test(value)) return result({type, escape, index: -1});

			if (!$.isObject(out)) out = {};

			let len  = type.length - 1;
			let str  = len > -1 && type[len] === 1;
			let list = [...value];

			for (let i = 0, char; i < list.length; i++) {
				if (escape) escape = false;
				else {
					char = char.codePointAt();

					switch (char) {
						case 92:
							if (!str) return result({type, escape, index}, out);

							escape = true;
							break;
						case 34:
						case 39:
							if (!str) {
								str = true;
								len = type.push(char) - 1;
							}
							else if (char === type[len]) {
								type.pop();
								len -= 1;
								str = false;
							}
							break;
						case 91:
						case 123:
							if (!str) len = type.push(char + 2) - 1;
							break;
						case 93:
						case 125:
							if (!str) {
								if (char !== type[len]) return result({type, escape, index}, out);

								type.pop();
								len -= 1;
							}
							break;
					}
				}

				index += 1;
				if (len === -1) break;
			}

			out.type   = type;
			out.escape = escape;
			out.index  = index;

			result(null, out);

			return len === -1;
		},
		/**
		 * Year judge leap
		 *
		 * @param {number} year
		 * @returns {boolean}
		 */
		isLeapYear (year) {
			let num = Number(year);

			if (!$.isNumber(num)) return false;

			if (!(num % 4) && (num % 100)) return true;
			if (!(num % 400)) return true;

			return false;
		},
		/**
		 * Type judge: date
		 *
		 * @param {*} value <target>
		 * @param {boolean} [str=false] <is parse string>
		 * @returns {boolean}
		 */
		isDate (value, str = false) {
			switch ($.type(value, true)) {
				default:
					return false;
				case "date":
					return true;
				case "string": {
					if (str !== true) return false;

					let data = value.trim().replace("T", " ").replace("Z", "");

					data = data.split(" ");

					if (!data[0] || data.length > 2) return false;
					data[0] = data[0].replace(/-/g, "/").split("/");
					if (data[0].length !== 3) return false;

					let [year, month, day] = value[0];

					year  = Number(year);
					month = Number(month);
					day   = Number(day);

					if (!$.isNumber(year, {min: 1900})) return false;
					if (!$.isNumber(month, {min: 1, max: 12})) return false;
					if (!$.isNumber(day, {min: 1, max: 31})) return false;

					switch (month) {
						case 2:
							if (day > (28 + ($.isLeapYear(year) ? 1 : 0))) return false;
							break;
						case 4:
						case 6:
						case 9:
							if (day > 30) return false;
					}

					return data.length > 1 ? $.isTime(data[1], true) : true;
				}
			}
		},
		/**
		 * Type judge: time
		 *
		 * @WARN: if value is string only parse time
		 *
		 * @param {*} value <target>
		 * @param {boolean} [str=false] <is parse string>
		 * @returns {boolean}
		 */
		isTime (value, str = false) {
			switch ($.type(value, true)) {
				default:
					return false;
				case "date":
					return true;
				case "string":
					if (str !== true) return false;

					let data = value.trim().replace(/\./g, ":").split(":");

					if (data.length < 2 || data.length > 4) return false;
					if (data.length < 4) data.push(0, 0);

					let [hour, minute, second, msecond] = data;

					if ($.isNumber(hour, {min: 0, max: 23})) return false;
					if ($.isNumber(minute, {min: 0, max: 59})) return false;
					if ($.isNumber(second, {min: 0, max: 59})) return false;
					if ($.isNumber(msecond, {min: 0, max: 999})) return false;

					return true;
			}
		},
		/**
		 * Type judge: jquery object
		 *
		 * @param {*} value <target>
		 * @returns {boolean}
		 */
		isjQuery (value) {
			return $.isObject(value) && value.jquery && true;
		},
		/**
		 * Type judge: DOM object
		 *
		 * @param {*} value <target>
		 * @returns {boolean|number}
		 */
		isDOM (value) {
			return $.type(value, true) === "dom" && value.nodeType;
		},
		/**
		 * Value judge: guid
		 *
		 * @WARN: only parse string
		 *
		 * @param {*} value <target>
		 * @returns {boolean}
		 */
		isGuid (value) {
			if (!$.isString(value, 36)) return false;

			let data = value.replace(/^\{|\}$/g, "");
			if (data.length !== 36) return false;

			data = data.toLowerCase().split("-");
			if (data.length !== 5) return false;

			for (let i = 0, dic = [8, 4, 4, 4, 12], c, d; i < value.length; i++) {
				d = value[i];

				if (d.length !== dic[i]) return false;

				d = d.split("");
				for (let j = 0; j < d.length; j++) {
					c = d[j].codePointAt();
					if (!((c >= 48 && c <= 57) || (c >= 97 && c <= 102))) return false;
				}
			}

			return true;
		},
		hasOwnProperty (value, key) {
			switch ($.type(value)) {

			}
		}
	};

	jShow = {...owner, ...api};
})(jShow);
/**
 * ==========================================
 * Name:           jShow's Class Extensions
 * Author:         j-show
 * CreTime:        2019-02-14
 * Description:    Class Extensions
 * Log:
 * 2019-02-14    Init Class
 * 2019-05-20    Format Code to jShow Style Guide
 * ==========================================
 */
(owner => {
	const $ = global.jShow;

	/*
	 ====================================
	 = Name: TObject
	 = Info: 基类
	 = Static Method：
	 =   create     = static create function
	 = Object Property:
	 =   className  = get className (readonly)
	 =   errorMax   = error messag limit
	 =   eventMax   = event function limit
	 = Object Method:
	 =   free       = class object free
	 =   on         = bind function by key
	 =   off        = unbind function by key
	 =   call       = call function
	 =   getError   = get error message by index
	 =   setError   = set error message by data
	 =   lastError  = get last error message
	 =   clearError = clear error message
	 ====================================
	 */
	class TObject {
		constructor () {
			this.__className = "TObject";

			this.__error__    = [];
			this.__errorMax__ = 5;
			this.__event__    = {};
			this.__eventMax__ = 99;
		}

		free () {
			this.__error__ = null;
			this.__event__ = null;
		}

		valueOf () {
			return this;
		}

		toString () {
			return `${this.className} Object`;
		}

		addListenEvent (key, ...func) {
			if (!$.isString(key)) return this;
			if (!$.isArray(func, true)) return this;

			const each = (own, list, num, max) => {
				for (let i = num, f; i < list.length; i++) {
					f = list[i];

					switch ($.type(f, true)) {
						case "function":
							own.push(f);
							if (own.length > max) own.pop();
							break;
						case "array":
							each(own, f, 0, max);
							break;
					}
				}
			};

			let list = this.__event__[key];

			if (!list) {
				list                = [];
				this.__event__[key] = list;
			}

			each(list, func, 1, this.eventMax);

			return this;
		}

		removeListenEvent (key, func) {
			try {
				if (arguments.length < 1) {
					this.__event__ = {};
					return;
				}

				if (!$.isString(key)) return;

				if (!$.isFunction(func)) {
					this.__event__[key] = [];
					return;
				}

				let list = this.__event__[key] || [];

				for (let i = 0; i < list.length;) {
					if (Object.is(func, list[i])) list.splice(i, 1);
					else i += 1;
				}
			}
			finally {
				return this;
			}
		}

		on (key, ...func) {
			return this.addListenEvent(key, ...func);
		}

		off (key, func) {
			return this.removeListenEvent(key, ...func);
		}

		async call (key, ...arg) {
			const dtd  = $.Deferred(true);
			const list = this.__event__[key] || [];

			try {
				let owner = arg.length > 0 ? arg[0] : this;

				for (let i = 0, f; i < list.length; i++) {
					f = list[i];
					switch ($.type(f, true)) {
						case "function":
							list[i].apply(owner, arg);
							break;
						case "asyncfunction":
							await list[i].apply(owner, arg);
							break;
					}
				}

				dtd.resolve(key);
			}
			catch (e) {
				dtd.reject(e);
			}

			return dtd.promise();
		}

		getError (index) {
			const list = this.__error__;

			if (list.length < 1) return null;
			if (!$.isNumber(index, {min: 0, max: list.length - 1})) return null;

			return list[index];
		}

		setError (level, code = level, msg = code) {
			if (!$.has(level, ["log", "info", "error"])) level = "log";
			if (!$.isNumber(code)) code = -1;
			if (!$.isString(msg)) msg = "";

			const list = this.__error__;
			const max  = this.errorMax;

			let err = {level, code, msg};

			while (list.length > max) list.shift();
			list.push(err);

			this.call("error", err);

			return err;
		}

		lastError () {
			const list = this.__error__;

			if (list.length < 1) return null;

			return list[list.length - 1];
		}

		clearError () {
			this.__error__ = [];

			return this;
		}

		get [Symbol.toStringTag] () {
			return this.className;
		}

		get className () {
			return this.__className;
		}

		get errorMax () {
			return this.__errorMax__;
		}

		set errorMax (value) {
			if (!$.isNumber(value, {min: 1, max: 99})) return;
			if (value === this.errorMax) return;

			this.__errorMax__ = value;

			const list = this.__error__;

			while (list.length > value) list.shift();
		}

		get eventMax () {
			return this.__eventMax__;
		}

		set eventMax (value) {
			if (!$.isNumber(value, {min: 1, max: 99})) return;
			if (value === this.__eventMax__) return;

			this.__eventMax__ = value;

			const list = this.__event__;

			$.each(list, d => {
				while (d.length > value) d.shift();
			});
		}

		static create () {
			return new TObject();
		}
	}

	/*
	 ====================================
	 = Name: TSeal
	 = Info: The sealed class is mounted in prototype way, and the method of sealing is not in accordance with the specification
	 =
	 = @WARN: this class like TObject
	 =
	 = Object Method:
	 =   clone     = copy this object
	 =   create    = create object, like constructor
	 ====================================
	 */
	TSeal = (() => {
		const clsError = function initClassError () {
			if (this.getError || this.setError || this.lastError) return;

			this.__error__ = [];
			this.errorMax  = 5;
			this.getError  = function getError (index = -1) {
				const list = this.__error__;
				let num    = Number(index);

				if (list.length < 1) return null;

				if (!$.isNumber(num, {min: 0, max: list.length - 1})) num = list.length - 1;

				return list[num];
			};
			this.setError  = function setError (level, code = level, msg = code) {
				if (!$.has(level, ["log", "info", "error"])) level = "log";
				if (!$.isNumber(code)) code = -1;
				if (!$.isString(msg)) msg = "";

				const list = this.__error__;
				const max  = this.errorMax;

				let err = {level, code, msg};

				while (list.length >= max) list.shift();
				list.push(err);

				this.call("error", [err]);

				return err;
			};
			this.lastError = function () {
				const list = this.__error__;

				if (list.length < 1) return null;

				return list[list.length - 1];
			};
		};
		const clsEvent = function initClassEvent () {
			if (this.on || this.off || this.call) return;

			this.__event__ = {};
			this.eventMax  = 99;
			this.on        = function (key, ...func) {
				if (!$.isString(key)) return this;
				if (!$.isArray(func, true)) return this;

				const each = (own, list, num, max) => {
					for (let i = num, f; i < list.length; i++) {
						f = list[i];

						switch ($.type(f, true)) {
							case "function":
								own.push(f);
								if (own.length > max) own.pop();
								break;
							case "array":
								each(own, f, 0, max);
								break;
						}
					}
				};

				let list = this.__event__[key];

				if (!list) {
					list                = [];
					this.__event__[key] = list;
				}

				each(list, func, 1, this.eventMax);

				return this;
			};
			this.off       = function (key, func) {
				try {
					if (arguments.length < 1) {
						this.__event__ = {};
						return;
					}

					if (!$.isString(key)) return;

					if (!$.isFunction(func)) {
						this.__event__[key] = [];
						return;
					}

					let list = this.__event__[key] || [];

					for (let i = 0; i < list.length;) {
						if (Object.is(func, list[i])) list.splice(i, 1);
						else i += 1;
					}
				}
				finally {
					return this;
				}
			};
			this.call      = async function (key, ...arg) {
				const dtd  = $.Deferred(true);
				const list = this.__event__[key] || [];

				try {
					let owner = arg.length > 0 ? arg[0] : this;

					for (let i = 0, f; i < list.length; i++) {
						f = list[i];
						switch ($.type(f, true)) {
							case "function":
								list[i].apply(owner, arg);
								break;
							case "asyncfunction":
								await list[i].apply(owner, arg);
								break;
						}
					}

					dtd.resolve(key);
				}
				catch (e) {
					dtd.reject(e);
				}

				return dtd.promise();
			};
		};

		function TSeal () {}

		TSeal.extend    = function (childAPI) {
			if (!$.isObject(childAPI)) throw new Error(console.error("[TSeal] object is null"));

			const className   = childAPI.className || "TSeal";
			const parentClass = TSeal;
			const initChild   = function initClass (...arg) {
				clsError.call(this);
				clsEvent.call(this);

				if (this.create) this.create.apply(this, arg);

				return this;
			};

			let childClass = null;

			eval(`childClass=function ${className}(...arg){return initChild.apply(this,arg);}`);

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
			create () { return this; },
			free () {},
			clone () { return $.clone(this, true); },
			valueOf () { return this; },
			toString () { return `${this.className} Object`; },
			get [Symbol.toStringTag] () { return this.className; }
		};

		return TSeal;
	})();

	/*
	 ====================================
	 = Name:   TCache
	 = Info：  Perform cache looping by Buffer
	 = Extend：TObject
	 = Static Method:
	 =   create    = static create function
	 = Object Property:
	 =   max       = cache buffer limit
	 =   index     = real data start position of cache
	 =   length    = real data length
	 =   offset    = block cache start position of cache
	 =   surplus   = surplus block length
	 = Object Method:
	 =   valueOf   = cache buffer
	 =   clear     = clear data
	 =   resize    = resize data position
	 =   push      = push data to cache
	 =   remove    = remove data to cache
	 =   parse     = parse real data, extend must rewrite this method
	 = Object Event:
	 =   data      = output data event
	 =   discard   = discard data event
	 ====================================
	 */
	class TCache extends TObject {
		/**
		 * 缓存初始化，可以设置最大缓存
		 *
		 * @param {number} [size=128] 最大缓存，单位字节(取值32 <= size <= 10K)
		 */
		constructor (size = 128) {
			super();

			this.__className = "TCache";

			this._max    = $.isNumber(size, {min: 32, max: 10240}) ? size : 128;
			this._index  = 0;
			this._length = 0;

			this._cache = Buffer.alloc(this._max);
		}

		free () {
			this._cache = null;

			super.free();
		}

		valueOf () {
			return this._cache;
		}

		/**
		 * 返回缓存内容
		 *
		 * @param {string} [encoding=utf8] 返回字符串编码形式
		 * @returns {string}
		 */
		toString (encoding = "utf8") {
			return this._cache.toString(encoding, this.index, this.offset);
		}

		/**
		 * 调准数内容，返回可用剩余空间大小
		 *
		 * @param {number} [len=0] 调整数字，=0 时进行数据移动，<surplus 时移动index
		 * @returns {number}
		 */
		resize (len = 0) {
			let val = $.isNumber(len, {min: 0}) ? len : 0;

			if (val === 0) {
				const data = this._cache;

				if (this.length > 0) data.copy(data, 0, this.index, this.offset);

				this._index = 0;
			}
			else if (val < this.surplus) {
				this._index += len;
				this._length -= len;
			}
			else {
				this._index  = 0;
				this._length = 0;
			}

			return this.surplus;
		}

		clear () {
			this._index  = 0;
			this._length = 0;

			return this;
		}

		/**
		 * 循环读取数据buf，并同步调用parse函数进行数据识别及输出
		 *
		 * @param {buffer} buf
		 * @returns {TCache}
		 */
		push (buf) {
			const data = this._cache;

			let offset = buf.byteOffset;
			let count  = buf.byteLength;
			let write  = 0;

			while (count > 0) {
				write = this.surplus;
				if (write < 1) write = this.resize();

				write = Math.min(count, write);
				if (write < 1) {
					this.call("discard", data.slice(this.index, this.offset), true);
					write = this.resize(this.max);
				}

				buf.copy(data, this.offset, offset, offset + write);
				this._length += write;

				offset += write;
				count -= write;

				write = this.parse();
				if (write > 0) {
					this.call("data", data.slice(this.index, write + this.index));
					this.resize(write);
				}
				else if (write < 0) {
					this._index += -(write);
				}
			}

			return this;
		}

		/**
		 * 删除数据，允许删除数据中段
		 *
		 * @param {object|number} opt
		 *    @param {number} [opt.start] 删除起始位置
		 *    @param {number} [opt.size] 删除长度
		 * @returns {TCache}
		 */
		remove (opt) {
			let {
					start = 0,
					len   = this.length
				} = opt;

			if ($.isNumber(opt, {min: 0})) len = opt;

			start = Number(start);
			len   = Number(len);

			if (isNaN(len) || len < 1) return this;

			if (isNaN(start)) start = 0;

			if (start < 0) start += this.length;
			if (start < 0 || start >= this.length) return this;

			if (start > 0) {
				let end = start + len;

				if (this.length - end > 0) {
					let data = this._cache;

					data.copy(data, start + this.index, end + this.index, this.length - end);
				}

				this._length -= len;
			}
			else {
				this.resize(len);
			}

			if (size !== 0) this.resize(size);

			return this;
		}

		/**
		 * 数据解析，需要在子类中改下，否则输出所有数据内容，不需要处理时，返回0
		 * >0 时，输出返回数量的数据，触发data事件
		 * <0 时，删除返回数量的数据
		 *
		 * @returns {number}
		 */
		parse () {
			return this.length;
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
	 = Name:   TList
	 = Info:   Queue class by Array, you must limit type when init class
	 = Extend：TObject
	 = Object Propertry：
	 =   length    = data length
	 =   type      = limit tyoe
	 =   first     = first data
	 =   last      = last data
	 = Object Method：
	 =   clear     = clear data
	 =   sort      = sort data，can custom sort function
	 =   each      = each data, if callback return is false, delete item
	 =   set       = set data, check data type
	 =   del       = delete data
	 =   add       = add data, check data type
	 =   addList   = add datas by list
	 =   push      = add data, from list tail
	 =   pop       = get and delete data, from list tail
	 =   put       = add data from list head
	 =   poll      = get and delete data, from list head
	 ====================================
	 */
	const TList = (function (TObject) {
		const isType   = (obj, type) => {
			if (!type || type === "*") return true;

			let otype = $.type(obj, true);

			if (type === otype) return true;

			switch (type) {
				case "date":
					if (otype === "TChinaDate" || obj.className === "TChinaDate") return true;
					break;
			}

			return false;
		};
		const fmtIndex = (index, def, max) => {
			let num = $.isNumber(index) ? index : def;

			if (num < 0) num = -1;
			else if (num >= max) num = max;

			return num;
		};
		const addData  = (own, value, index) => {
			const len = own.length - 1;

			if (index !== len) {
				for (let i = len; i >= index; i--) own[i] = own[i - 1];
			}

			own[index] = value;
		};
		const delData  = (own, index, old) => {
			const len = own.length - 1;

			if (index !== len) {
				for (let i = index; i <= len; i++) own[i] = own[i + 1];
			}

			delete own[old];
		};

		class TList extends TObject {
			constructor (type) {
				super();

				this.__className = "TList";

				this._value = [];
				this._type  = "*";

				if ($.isString(type)) this._type = type;
			}

			free () {
				this._value = null;

				super.free();
			}

			valueOf () {
				return this._value;
			}

			toString () {
				return this._value.toString();
			}

			[Symbol.iterator] () {
				const data = this._value;

				return (function* () {
					for (let i = 0; i < data.length; i++) {
						yield data[i];
					}
				})();
			}

			get length () {
				return this._value.length;
			}

			get type () {
				return this._type;
			}

			get first () {
				const data = this._value;

				if (data.length < 1) return null;

				return data[0];
			}

			get last () {
				const data = this._value;

				if (data.length < 1) return null;

				return data[data.length - 1];
			}

			clear () {
				const data = this._value;

				for (let i = 0; i < data.length; i++) delete this[i];

				this._value = [];

				this.call("clear");

				return this;
			}

			sort (callback) {
				let func = callback;

				if (!$.isFunction(func)) func = null;

				const data = this._value;

				data.sort.apply(this, func || []);

				for (let i = 0; i < data.length; i++) this[i] = data[i];

				this.call("sort");

				return this;
			}

			each (func) {
				if (!$.isFunction(func)) return this;

				let list = this.valueOf();

				for (let i = 0, r; i < this.length;) {
					r = func(list[i]);

					if (r === true) this.del(i);
					else if (r === false) break;
					else i++;
				}

				return this;
			}

			set (index, value) {
				if (!isType(value, this.type)) return -1;

				const data = this._value;

				if (!$.isNumber(index, {min: 0, max: data.length - 1})) return -1;

				data[index] = value;
				this[index] = value;

				this.call("set", {index: index, data: value});

				return index;
			}

			del (index) {
				if (this.length === 0) return null;

				const data = this._value;
				let len    = data.length - 1;

				if (!$.isNumber(index, {min: 0, max: len})) return -1;

				let item;

				if (index === len) {
					item = data.pop();
				}
				else if (index === 0) {
					item = data.shift();
				}
				else {
					item = data[inde];
					data.splice(index, 1);
				}

				delData(this, index, len);

				this.call("del", {index: index, data: item});

				return item;
			}

			add (value, index) {
				if (!isType(value, this.type)) return -1;

				let num  = fmtIndex(index, this.length, this.length);
				let data = this._value;
				let len  = data.length;

				if (num <= 0) {
					data.unshift(value);

					num = 0;
				}
				else if (num >= len) {
					data.push(value);

					num = len;
				}
				else {
					data.splice(num, 0, value);
				}

				addData(this, value, num);

				this.call("add", {index: num, data: value});

				return num;
			}

			addList (value, index, desc = false) {
				if (!$.isArray(value, {min: 1})) return this;

				const data = value;
				if (desc === true) data.reverse();

				let num = this.length;
				num     = fmtIndex(index, num, num);

				for (let i = 0; i < data.length; i++) this.add(data[i], num + i);

				return this;
			}

			push (...value) {
				return this.addList(value, this.length);
			}

			pop () { return this.del(this.length); }

			put (...value) { return this.addList(value, 0, true); }

			poll () { return this.del(0); }

			static create (type) {
				return (new TList(type));
			}
		}

		return TList;
	})(TObject);

	/*
	 ====================================
	 = Name:   TChinaDate
	 = Info:   Chinese date
	 = Extend: TObject
	 = Static Method：
	 =   toString   = conver to string
	 = Object Propertry：
	 =   Year        = year
	 =   Month       = month
	 =   Day         = day
	 =   Term        = term of chinese date
	 =   Zodiac      = zodizc of chinese date
	 =   CYear       = year of chinese date
	 =   CMonth      = month of chinese date
	 =   CDay        = day of chinese date
	 =   IsLeapYear  = is leap year
	 = Object Method：
	 =   getTime    = get object millisecond
	 =   setTime    = set time
	 =   toString   = output format string by fmt
	 ====================================
	 */
	const TChinaDate = (function (TObject) {
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

				this._Year       = "";
				this._Month      = "";
				this._Day        = "";
				this._Term       = "";
				this._Zodiac     = "";
				this._cYear      = "";
				this._cMonth     = "";
				this._cDay       = "";
				this._IsLeapYear = false;

				this.setTime(dt);
			}

			free () {
				this._nt = null;

				super.free();
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

			toString (fmt) {
				let result = $.isString(fmt) ? fmt : "Y年(Z) M月 D T";

				if (/((CY|CM|CD|CT|CZ|Y|M|D)+)/.test(result)) {
					fmt = {
						"CY+": this.cYear,
						"CM+": this.cMonth,
						"CD+": this.cDay,
						"CT+": this.Term,
						"CZ+": this.Zodiac,
						"Y+":  this.Year,
						"M+":  this.Month,
						"D+":  this.Day
					};

					$.each(fmt, function (d, k) {
						let rxp = new RegExp("(" + k + ")", "g");

						if (rxp.test(result)) result = result.replace(rxp, d + "");
					});
				}

				return result.trim();
			}

			getTime () {
				return this._dt.getTime();
			}

			setTime (dt) {
				const getLeapYearMonth = year => {
					return ct.monthInfo[year - ct.monthInfoDt.getFullYear()] & 0xf;
				};
				const getLeapYearDay   = year => {
					return getLeapYearMonth(year) ? ((ct.monthInfo[year - ct.monthInfoDt.getFullYear()] & 0x10000) ? 30 : 29) : 0;
				};
				const getTotalYearDay  = year => {
					let sum   = 348,
						minfo = ct.monthInfo[year - ct.monthInfoDt.getFullYear()];

					for (let i = 0x8000; i > 0x8; i >>= 1) sum += (minfo & i) ? 1 : 0;

					return sum + getLeapYearDay(year);
				};
				const getTotalMonthDay = (year, month) => {
					return (ct.monthInfo[year - ct.monthInfoDt.getFullYear()] & (0x10000 >> month)) ? 30 : 29;
				};

				switch ($.type(dt, true)) {
					case "date":
						this._dt.setTime(dt.getTime());
						break;
					case "number":
						this._dt.setTime(dt);
						break;
				}

				let nt     = this._nt;
				let temp   = 0;
				let offset = parseInt((this._dt - ct.monthInfoDt) / 86400000);
				let i      = 0;

				nt.year  = 0;
				nt.month = 14;
				nt.day   = offset + 40;

				(({monthInfoDt, monthInfo}) => {
					let len = monthInfoDt.getFullYear() + monthInfo.length;

					for (i = monthInfoDt.getFullYear(); i < len && offset > 0; i++) {
						temp = getTotalYearDay(i);

						offset -= temp;
						nt.month += 12;
					}

					if (offset < 0) {
						offset += temp;
						i--;
						nt.month -= 12;
					}
				})(ct);

				nt.year          = i;
				this._IsLeapYear = false;

				let leap = getLeapYearMonth(nt.year);
				if (leap < 1) throw "TChinaDate setTime Error";

				this._IsLeapYear = (leap => {
					let _leap = false;

					for (i = 1; i < 13 && offset > 0; i++) {
						if (i === leap && !_leap) {
							i--;
							_leap = true;
							temp  = getLeapYearDay(nt.year);
						}
						else {
							temp = getTotalMonthDay(nt.year, i);
						}

						if (_leap && i === leap) _leap = false;

						offset -= temp;

						if (!_leap) nt.month++;
					}

					if (offset < 0) {
						offset += temp;

						i--;
						nt.month--;
					}
					else if (offset === 0 && i === leap) {
						if (!_leap) {
							i--;
							nt.month--;
						}

						_leap = !_leap;
					}

					return _leap;
				})(leap + 1);

				this._cYear  = getTGDZ(nt.year - 1864);
				this._cMonth = getTGDZ(nt.month);
				this._cDay   = getTGDZ(nt.day);

				nt.month = i;
				nt.day   = offset + 1;

				this._Year   = getYear(nt.year);
				this._Month  = getMonth(nt.month, this._IsLeapYear);
				this._Day    = getDay(nt.day);
				this._Term   = getTerm(nt.year, nt.month, this._dt.getDate());
				this._Zodiac = getZodiac(this._dt.getFullYear());

				return this;
			}

			static toString (fmt, date = fmt) {
				if (!$.isDate(date)) date = new Date();

				return (new TChinaDate(date)).toString(fmt);
			}
		}

		return TChinaDate;
	})(TObject);

	/*
	 ====================================
	 = Name:   TGuid
	 = Info:   simulate guid
	 = Extend: TObject
	 = Static Method:
	 =   toByteArray  = conver to unit8array
	 =   New          = get TGuid object with random value
	 =   Empty        = get TGuid object with fill 0
	 = Object Method：
	 =   New          = set random value
	 =   toString     = conver to string
	 =   toByteArray  = conver to unit8array
	 ====================================
	 */
	class TGuid extends TObject {
		constructor (value) {
			super();

			this.__className = "TGuid";

			this._value = [0, 0, 0, 0, 0];
			this._gd    = [4, 2, 2, 2, 6];

			let data = [];

			switch ($.type(value, true)) {
				case "string":
					data = value.replace(/^\{|\}$/g, "").split("-");
					data = data.map(v => parseInt(`0x${v}`));
					break;
				case "array":
					if (data.length === this._gd.length) data = value;
					break;
			}

			if (data.length !== this._gd.length) return;

			for (let i = 0, gd = this._gd, d; i < data.length; i++) {
				d = data[i];

				if (!$.isNumber(d, {min: 0, max: (2 ** (8 * gd[i])) - 1})) return;
				data[i] = d;
			}

			this._value = data;
		}

		free () {
			this._value = null;
			this._gd    = null;

			super.free();
		}

		valueOf () {
			return this.toString();
		}

		toString () {
			const com  = (s, l) => {
				while (s.length < l * 2) s = "0" + s;

				return s;
			};
			const data = this._value;
			const gd   = this._gd;

			let result = [];

			for (let i = 0, d; i < data.length; i++) {
				d = data[i].toString(16);
				d = com(d, gd[i]);
				result.push(d);
			}

			return result.join("-");
		}

		toByteArray () {
			const des  = (r, d) => {
				d.reverse();
				for (let i = 0; i < d.length; i++) if (d[i].length > 0) r.push(parseInt("0x" + d[i]));
			};
			const data = this._value;

			let result = [];

			for (let i = 0, d; i < data.length; i++) {
				d = data[i].toString(16);

				des(result, d.split(/\w{2}/g));
			}

			return result;
		}

		New () {
			const rmd = l => Math.round(Math.random() * ((2 ** (8 * l)) - 1));
			const gd  = this._gd;

			let result = [];

			for (let i = 0; i < gd.length; i++) result.push(rmd(gd[i]));

			this._value = result;

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

		static Empty () {
			return (new TGuid());
		}
	}

	const api = {
		TObject,
		TSeal,
		TCache,
		TList,
		TChinaDate,
		TGuid,
		/**
		 * 队列函数
		 *
		 * @param {string} [type=*] 限定类型，对输入内容进行过滤
		 * @returns {object}
		 */
		List (type) {
			return new $.TList(type);
		},
		/**
		 * 中文日期函数
		 *
		 * @param {date} [dt=now]
		 * @returns {object}
		 */
		ChinaDate (dt) {
			return new $.TChinaDate(dt);
		},
		/**
		 * New Guid
		 *
		 * @returns {object}
		 */
		NewGuid () {
			return $.TGuid.New();
		},
		/**
		 * Empty Guid
		 *
		 * @returns {object}
		 */
		EmptyGuid () {
			return $.TGuid.Empty();
		}
	};

	jShow = {...owner, ...api};
})(jShow);
/**
 * ==========================================
 * Name:           jShow's Async Extensions
 * Author:         j-show
 * CreTime:        2019-02-20
 * Description:    Async Extensions
 * Log:
 * 2019-02-20    Init Async
 * 2019-05-19    Format Code to jShow Style Guide
 * ==========================================
 */
(owner => {
	const $ = global.jShow;

	/*
	 ====================================
	 = Name: TCallback
	 = Info: callback class
	 = Object Method：
	 =   lock        = lock call function
	 =   unlock      = unlock call function
	 =   on          = add function
	 =   off         = remove function by function
	 =   fire        = call function
	 =   fireWith    = call function, change this object
	 =   empty       = clear function
	 =   unique      = unique function
	 =   has         = exist check function by list
	 = Object Property:
	 =   limit       = function list limit
	 =   length      = function list length
	 =   locked      = lock status
	 ====================================
	 */
	const TCallback = (function (TObject) {
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
		};
		const eachFuncs = (list, callback) => {
			let i = 0;

			while (i < list.length) {
				if (callback(i, list[i]) !== false) i++;
			}
		};
		const fireFuncs = (list, data, once, done, prog) => {
			if (list.length < 1) return done;

			eachFuncs(list, (i, f) => {
				f.apply(data[0], data[1]);

				if (once) list.splice(i, 1);
				if (prog) prog();
				if (once) return false;
			});

			if (done) done();

			return null;
		};

		class TCallback extends TObject {
			constructor (opt, limit, callback) {
				super();

				this.__className = "TCallback";

				this._locked = false;
				this._limit  = limit;
				this._value  = [];
				this._arg    = null;

				this._opt      = opt;
				this._callback = $.isFunction(callback) ? callback : null;
			}

			valueOf () {
				return this._value;
			}

			get limit () {
				return this._limit;
			}

			get length () {
				return this._value.length;
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

			on (...func) {
				if (this.locked) return this;

				const opt   = this._opt;
				const data  = this._value;
				const arg   = this._arg;
				const limit = this._limit;

				getFuncs(func, d => {
					data.push(d);
					if (data.length > limit) data.pop();
				});

				if (opt.unique) this.unique();
				if (opt.memory && opt.fire && arg) fireFuncs(data, arg, opt.once, this._callback);

				return this;
			}

			off (...func) {
				if (this.locked) return this;

				const data = this._value;

				if (func.length < 1) {
					this._value = [];
				}
				else {
					getFuncs(func, d => {
						eachFuncs(data, (i, f) => {
							if (Object.is(d, f)) {
								data.splice(i, 1);
								return false;
							}
						});
					});
				}

				return this;
			}

			has (func) {
				return this._value.indexOf(func) !== -1;
			}

			unique () {
				if (this.locked) return this;

				this._value = $.unique(this._value);

				return this;
			}

			fire (...args) {
				return this.fireWith(this, args);
			}

			fireWith (own = this, args = [], done) {
				const arg = [own, $.isArray(args) ? args : []];
				const opt = this._opt;

				this._arg = arg;

				if (opt.memory && !opt.fire) {
					opt.fire = true;
					if (opt.limit) this._arg = null;
				}
				else {
					let data = this._value;

					fireFuncs(data, arg, opt.once, done);
					if (this._callback) this._callback.apply(arg[0], arg[1]);
				}

				return this;
			}
		}

		return TCallback;
	})(TObject);

	/*
	 ====================================
	 = Name: TDeferred
	 = Info: Async class (Observer Mode)
	 = Static Method:
	 =   create      = static create function
	 = Object Method：
	 =   empty       = clear bind function
	 =   promise     = return promise object
	 =   resolve     = call done event
	 =   reject      = call fail event
	 =   alarm       = call warn event
	 =   notify      = call progress event
	 =   on          = bind function by key
	 =   off         = unbind function by key
	 = Object Event:
	 =   done        = done evnet, only once call
	 =   fail        = fail event, only once call
	 =   warn        = warn event
	 =   progress    = progress event
	 =   always      = always event, after done/fail event
	 ====================================
	 */
	class TDeferred extends TObject {
		constructor (limit, callback) {
			super();

			let _this    = this;
			let _state   = _this.STATE;
			let _event   = {
				done:     $.Callback(limit).fire(),
				fail:     $.Callback(limit).fire(),
				warn:     $.Callback(limit).fire(),
				progress: $.Callback(limit).fire(),
				always:   $.Callback(limit, callback).fire()
			};
			let _action  = {
				resolve: _event.done,
				reject:  _event.fail,
				alarm:   _event.warn,
				notify:  _event.progress
			};
			let _promise = {
				get state () {
					return _this._state;
				},
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

			_this.__event   = _event;
			_this.__action  = _action;
			_this.__promise = _promise;

			_this._state  = _state.pending;
			_this.__owner = void(0);
			_this.__surp  = 0;

			_event.done.on(e => {
				_this._state = _state.resolved;

				_event.fail.lock();
				_event.warn.lock();
				_event.progress.lock();
			});
			_event.fail.on(e => {
				_this._state = _state.rejected;

				_event.done.lock();
				_event.warn.lock();
				_event.progress.lock();
			});

			$.each(_event, (d, k) => {
				_this[k]    = function () {
					d.on([...arguments]);
					return this;
				};
				_promise[k] = _this[k];
			});

			$.each(_action, (d, k) => {
				_this[k]          = function () {
					_this[`${k}With`](_this, arguments);

					return this;
				};
				_this[`${k}With`] = function (own, arg) {
					own = own || _this.__owner;
					d.fireWith(own, arg);

					if (_this.state === k) {
						_event.always.fireWith(own, arg);
					}
					else if (k === "notify") {
						_this.__surp -= 1;
						if (_this.__surp < 1) _this["resolveWith"](own, arg);
					}

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
			if (arguments.length === 0) $.each(this.__event, d => d.off());
			else if (this.__event[tag]) this.__event[tag].off();

			return this;
		}

		promise (own, max = own) {
			const STATE = this.STATE;

			switch (this.state) {
				case STATE.inited:
				case STATE.pending:
					this._state = STATE.pending;

					this.__owner = own === null ? void(0) : own;
					this.__surp  = $.isNumber(max, {min: 0}) ? max : 0;
					break;
			}

			return this.__promise;
		}

		static create (limit, callback) {
			return (new TDeferred(limit, callback));
		}
	}

	/*
	 ====================================
	 = Name: TPromise
	 = Info: Async object, extension Promise object
	 = Static Method:
	 =   create      = static create function
	 = Object Method：
	 =   empty       = clear bind function
	 =   promise     = return promise object
	 =   resolve     = call done event
	 =   reject      = call fail event
	 =   alarm       = call warn event
	 =   notify      = call progress event
	 =   on          = bind function by key
	 =   off         = unbind function by key
	 = Object Event:
	 =   done        = done evnet, only once call
	 =   fail        = fail event, only once call
	 =   warn        = warn event
	 =   progress    = progress event
	 =   always      = always event, after done/fail event
	 ====================================
	 */
	const TPromise = (Promise => {
		let prop = Promise.prototype;

		prop.end      = function (onFulfilled, onRejected) {
			this.then(onFulfilled, onRejected)
				.catch(function (reason) {
					// 抛出一个全局错误
					setTimeout(() => { throw reason; }, 0);
				});
		};
		prop.on       = function (tag, callback) {
			if (!$.isFunction(callback, true)) return this;

			switch (tag) {
				default:
				case "done":
					return this.then(callback);
				case "fail":
					return this.catch(callback);
				case "always":
					let P = this.constructor;

					return this.then(
						value => P.resolve(callback()).then(() => value),
						reason => P.resolve(callback()).then(() => { throw reason; })
					);
				case "warn":
					if (!this.__simple) this.__warn.on(callback);

					return this;
				case "progress":
					if (!this.__simple) this.__progress.on(callback);

					return this;
			}
		};
		prop.done     = function (callback) { return this.on("done", callback); };
		prop.fail     = function (callback) { return this.on("fail", callback); };
		prop.always   = function (callback) { return this.on("always", callback); };
		prop.warn     = function (callback) { return this.on("warn", callback); };
		prop.progress = function (callback) { return this.on("progress", callback); };
		prop.resolve  = function (arg) {
			this.__resolve.call(this, arg);

			return this;
		};
		prop.reject   = function (arg) {
			this.__reject.call(this, arg);

			return this;
		};
		prop.alarm    = function (arg) {
			this.__warn.fireWith(this, arg);

			return this;
		};
		prop.notify   = function (arg) {
			if (this.__simple) return this;

			if (this.__limit > 0) {
				this.__progress.fireWith(this, arg);

				this.__limit -= 1;
				if (this.__limit < 1) this.__resolve.call(this, arg);
			}

			return this;
		};
		prop.promise  = function (max) {
			if ($.isNumber(max, {min: 1})) this.__limit = max;

			return this;
		};

		Promise.create = function (simple, callback) {
			let done;
			let fail;

			let obj = new Promise(function (resolve, reject) {
				done = resolve;
				fail = reject;
			});

			obj.__resolve = done;
			obj.__reject  = fail;

			obj.__limit  = 0;
			obj.__simple = simple === true;
			if (!obj.__simple) {
				obj.__warn     = $.Callback(100).fire();
				obj.__progress = $.Callback(100).fire();
			}

			if (!callback) callback = simple;
			if (typeof(callback) === "function") callback(obj);

			return obj;
		};

		return Promise;
	})(Promise);

	const api = {
		TCallback,
		TDeferred,
		TPromise,
		/**
		 * Create TCallback object
		 *
		 * @param {object} opt <option>
		 *    @param {string} [opt.flag=once memory limit] <work mode>
		 *    @param {number} [opt.limit=50] <callback list limit>
		 *    @param {function} opt.callback <callback list after function>
		 * @returns {object}
		 */
		Callback (opt) {
			let {
					flag  = "once memory limit",
					limit = 50,
					callback
				} = opt;

			switch (typeof(opt)) {
				case "number":
					limit = opt;
					break;
				case "string":
					flag = opt;
					break;
				case "function":
					callback = opt;
					break;
			}

			if (!$.isNumber(limit, {min: 1})) limit = 50;
			if (!$.isFunction(callback)) callback = null;

			let arg = {};
			flag.split(" ").forEach(d => arg[d] = true);

			if (arg.memory && !arg.limit) arg.fire = true;

			return new TCallback(
				{
					once:   arg.once === true,
					memory: arg.memory === true,
					limit:  arg.limit === true,
					unique: arg.unique === true,
					fire:   arg.fire === true
				},
				arg.simple === true ? 1 : parseInt(limit),
				callback
			);
		},
		/**
		 * Create Async observer object
		 *
		 * @WARN: opt type is number as TDeferred
		 *
		 * @param {boolean|number|object} opt <option>
		 *    @param {boolean} [opt=true] <is simple mode>
		 *    @param {number} [opt=50] <callback list limit>
		 * @param {function} [callback] <callback list after function>
		 * @returns {object}
		 */
		Deferred (opt, callback = opt) {
			let func = callback;

			if (!$.isFunction(func)) func = null;

			switch (typeof(opt)) {
				default:
				case "boolean":
					return Promise.create(opt === true, func);
				case "number":
					let num = Number(opt);

					if (isNaN(num) || num < 1) num = 50;

					return TDeferred.create(num, func);
			}
		},
		/**
		 * Create Async object, extension Promise object
		 *
		 */
		Promise (callback) {
			return Promise.create(callback);
		},
		/**
		 * Generator function to Promise object
		 *
		 * @param {Generator} gen <function body, must generator function>
		 * @param {object} [opt] <option>
		 *    @param {*} [opt.data] <transmit data>
		 *    @param {*} [opt.owner] <transmit owner>
		 * @returns {object}
		 */
		Async (gen, opt) {
			if (!$.isGenerator(gen)) throw new Error("callback is not Generator");

			let {
					data  = null,
					owner = null
				} = opt;

			if ($.isNull(data)) data = [];
			if (!$.isArray(data)) data = [data];
			if (!$.isObject(owner)) owner = null;

			const isFunc    = $.isFunction;
			const isPromise = $.isPromise;
			const isGen     = $.isGenerator;
			const toPromise = function (gen, data, owner, first) {
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
					};
					const then = (own, ok, fail) => own.then(ok || step(), fail || step(1));
					const next = rev => {
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
		},
		/**
		 * Normal function to async function
		 *
		 * @WARN: async function as done status output
		 *
		 * @param {function} callback <normal function>
		 * @returns {Promise<*>}
		 */
		async Done (callback) {
			const dtd = Promise.create();

			let func = callback;

			if ($.isFunction(func)) func = Promise.create(func);

			func.always(() => dtd.resolve());

			return dtd.promise();
		}
	};

	jShow = {...owner, ...api};
})(jShow);
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
(owner => {
	const $ = global.jShow;

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

	jShow = {...owner, ...api};

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

})(jShow);
/**
 * ==========================================
 * Name:           jShow's Load Module
 * Author:         j-show
 * CreTime:        2019-03-14
 * Description:    Node.js Load Module
 * Log:
 * 2019-03-14    Init Class
 * 2019-05-20    Format Code to jShow Style Guide
 * ==========================================
 */
(owner => {
	const $ = global.jShow;

	if ($.mode !== $.MODE.Node) return;

	const _require = (url, tag, owner) => owner[tag || url] = require(url);
	const _define = (alias, deps = alias, factory = deps, owner = factory, exec = owner) => {
		let modules = $.isArray(deps) ? [...deps] : [];
		let func = factory;

		modules.forEach((d, i) => {
			modules[i] = $[d] || require(d);
		});

		if ($.isFunction(func) && exec !== false) {
			func = func(require, owner, ...modules);
			if (func === void(0)) func = owner.exports;
		}

		owner.exports = func;

		return owner.exports;
	};

	const api = {
		__require: _require,
		require:   _require,
		__define:  _define,
		define:    _define
	};

	jShow = {...owner, ...api};

	if (!global.define) global.define = api.define;
})(jShow);

	/**
 * ==========================================
 * Name:           jShow's Loading
 * Author:         j-show
 * CreTime:        2019-03-14
 * Description:    Node.js Tools Loading
 * Log:
 * 2019-03-14    Init Class
 * ==========================================
 */
($ => {
	$.__require("./lib/regexp", "RegExp");
	$.__require("./lib/security", "Security");
	$.__require("./lib/conver", "Conver");
	$.__require("./lib/string", "String");
	$.__require("./lib/date", "Date");
	$.__require("./lib/check", "Check");
	// $.__require("./lib/task", "Task");
})(this);

});