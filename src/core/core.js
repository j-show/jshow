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