/**
 * ==========================================
 * Name:           Conver
 * Author:         jShow
 * CreTime:        2014-11-20
 * Description:    Conver function
 * Log
 * 2015-06-08    Optimize module structure
 * 2019-05-25    Format Code to jShow Style Guide
 * ==========================================
 */
define("Conver", ["String", "RegExp"], function (require, module, STRING, REGEXP) {
	"use strict";

	const $ = jShow;

	/**
	 * @namespace Conver
	 */
	const api = {
		/**
		 * Any to boolean
		 *
		 * @param {*} value <target>
		 * @returns {boolean}
		 */
		toBool (value) {
			switch ($.type(value, true)) {
				case "boolean":
					return value;
				case "number":
					return value !== 0;
				case "string":
					return value.toLowerCase() === "true";
				case "null":
				case "undefined":
					return false;
				case "array":
					return value.length > 0;
				case "object":
					return !$.is(value, {}, false);
				default:
					return false;
			}
		},
		/**
		 * Any to Integer
		 *
		 * @param {*} value <target>
		 * @param {number|object} [opt] <option>
		 *    @param {number} [opt.def=0] <default value>
		 * @param {function} [callback]
		 * @returns {number}
		 */
		toInteger (value, opt = 0, callback = opt) {
			let data = Number(value);
			let {
					def = 0
				}    = opt;

			if (typeof(opt) === "number") def = opt;

			if (!$.isNumber(def)) def = 0;
			if (isNaN(data)) data = def;

			return $.isFunction(callback) ? callback(data, value, def) : data;
		},
		toUInteger (value, opt = 0, callback = opt) {
			let {
					def = 0
				} = opt;

			if (typeof(opt) === "number") def = opt;

			if (!$.isNumber(def, {min: 0})) def = 0;

			return api.toInteger(value, def, (result, value, def) => {
				if (result < 0) result = def;

				return $.isFunction(callback) ? callback(result, value, def) : result;
			});
		},
		/**
		 * Any to float number
		 * ignore the decimals and round them up
		 *
		 * @param {*} value <target>
		 * @param {number|object} [opt] <option>
		 *    @param {number} [opt.len=2] <decimal number length>
		 *    @param {number} [opt.def=0] <default value>
		 * @param {function} [callback]
		 * @returns {number}
		 */
		toFloat (value, opt, callback = opt) {
			let data = Number(value);

			let {
					def = 0,
					len = 2
				} = opt;

			if (typeof(opt) === "number") def = opt;

			if (!$.isNumber(def, {int: false})) def = 0;
			if (!$.isNumber(len, {min: 0})) len = 2;
			if (isNaN(data)) data = def;

			let temp = 10 ** len;
			data     = parseInt((data * temp) + (0.5 * (data > 0 ? 1 : -1))) / temp;

			return $.isFunction(callback) ? callback(data, value, def) : data;
		},
		toUFloat (value, opt, callback = opt) {
			let {
					def = 0,
					len = 2
				} = opt;

			if (typeof(opt) === "number") def = opt;

			if (!$.isNumber(def, {int: false, min: 0})) def = 0;

			return api.toFloat(value, {def, len}, (result, value, def) => {
				if (result < 0) result = def;

				return $.isFunction(callback) ? callback(result, value, def) : result;
			});
		},
		/**
		 * Any to string
		 *
		 * @param {*} value <target>
		 * @param {object} [opt] <option, different types have different parameters>
		 * @param {function} callback
		 * @returns {string}
		 */
		toString (value, opt, callback = opt) {
			let data = value;

			const func = $.isFunction(callback) ? callback : null;

			switch ($.type(data, true)) {
				default:
					return "";
				case "boolean":
					data = data ? "true" : "false";
					return func ? func(data, value) : data;
				case "number": {
					/**
					 * @param {number} value
					 * @param {object} [opt]
					 *    @param {number} [opt.len=0] <decimal number length>
					 *    @param {number} [opt.def=0] <default value>
					 *    @param {boolean} [opt.chs=false] <is conver chinese number>
					 *    @param {Array} [opt.bit] <chinese number format code>
					 * @param {function} [callback=null]
					 */
					let {
							len = 0,
							def = 0,
							chs = false,
							bit
						} = opt;

					switch ($.type(opt, true)) {
						case "number":
							def = opt;
							break;
						case "boolean":
							chs = opt;
							break;
						case "array":
							bit = opt;
							break;
					}

					if (!$.isNumber(len, {min: 0})) len = 0;
					if (!$.isNumber(def)) def = 0;

					data = len === 0 ? api.toInteger(data, def) : api.toFloat(data, {len, def});
					data = data.toString();

					if (chs === true) {
						data = data.split(".").concat("");
						if (!$.isArray(bit, {min: 3})) {
							bit = [
								["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "点"],
								["", "十", "百", "千"],
								["", "万", "亿", "兆"]
							];
						}

						let int = [...data[0]].reverse();
						let dec = [...data[1]];

						dec.forEach((d, i) => dec[i] = bit[0][parseInt(d)]);

						int = ((b0, b1, b2) => {
							let p = "";

							for (let i = 0, j = -1, o = "", d; i < int.length; i++) {
								d = int[i];
								if (i % 4 === 0) {
									j += 1;
									p = `${b2[j]}${p}`;
									o = "";
								}

								if (d !== "0") {
									p = `${b1[parseInt(d)]}${b1[i % 4]}${p}`;
								}
								else {
									if ((i % 4 !== 0) && (int[i - 1] !== "0")) o = b0[0];

									p = `${o}${p}`;
									o = "";
								}
							}

							if (p.indexOf(b0[0]) === 0) p = p.substr(1);

							int = p.split("");

							for (let i = 0, o = false, d; i < int.length;) {
								d = int[i];
								if (o) {
									if (d === b1[1]) {
										int.splice(i - 1, 1);
										continue;
									}
									else o = false;
								}
								else if (d === b0[1]) o = true;

								i++;
							}

							for (let i = 0, o = false, j, d; i < int.length;) {
								d = int[i];
								for (j = 0; j < b2.length; j++) {
									if (d === b2[j]) {
										if (o) int.splice(i, 1);
										o = true;
										break;
									}
								}

								if (o && j >= b2.length) o = false;
								else i += 1;
							}

							return int.join("");
						})(...bit);

						dec = dec.length > 0 ? `${bit[0][10]}${dec.join("")}` : "";

						data = `${int}${dec}`;
					}

					return func ? func(data, value) : data;
				}
				case "string": {
					/**
					 * @param {string} value
					 * @param {object} [opt]
					 *    @param {string} [opt.filter=text] <filter type>
					 *        @param {string} opt.filter=text <filter normal text>
					 *            @param {boolean} [opt.html] <is conver html tag>
					 *        @param {string} opt.filter=html <filter html tag>
					 * @param {function} [callback=null]
					 */
					let {
							filter = "text",
							html   = false
						} = opt;

					switch (typeof(opt)) {
						case "boolean":
							html   = opt;
							filter = "text";
							break;
						case "string":
							filter = opt;
							break;
					}

					switch (filter) {
						default:
						case "text":
							if (html === true) data = api.toHtml(data, {tab: false, rev: false});
							break;
						case "html":
							data = REGEXP.Html(data, "*");
							break;
					}

					return func ? func(data, value) : data;
				}
				case "undefined":
				case "null":
					return func ? func("null", data) : "null";
				case "date": {
					/**
					 * @param {date} value
					 * @param {object|string} opt
					 *    @param {string} [opt.fmt=yyyy-m-d hh:nn:ss] <format code>
					 * @param {function} [callback]
					 */
					let {
							fmt = "yyyy-mm-dd hh:nn:ss",
							bit = []
						} = opt;

					switch ($.type(opt, true)) {
						case "string":
							fmt = opt;
							break;
						case "array":
							bit = opt;
							break;
					}

					if (!$.isArray(bit)) bit = ["日", "一", "二", "三", "四", "五", "六"];
					if (!$.isString(fmt)) fmt = "yyyy-mm-dd hh:nn:ss";
					if (fmt === "iso") fmt = "yyyy-mm-ddThh:nn:ssZ";

					if ($.TChinaDate && /((CY|CM|CD|CT|CZ|Y|M|D)+)/.test(fmt)) fmt = $.TChinaDate.toString(fmt, data);

					if (/((y|m|d|w|W|h|H|n|N|s|S|q|Q|z|f)+)/.test(fmt)) {
						$.each(
							{
								"y+":    data.getFullYear(), //年份
								"m+":    data.getMonth() + 1,//月份
								"d+":    data.getDate(),//日
								"w+":    data.getDay(),//周
								"W+":    bit[data.getDay()],//中文周
								"[hH]+": data.getHours(),//小时
								"[nN]+": data.getMinutes(),//分
								"[sS]+": data.getSeconds(),//秒
								"[qQ]+": Math.floor((data.getMonth() + 3) / 3),//季度
								"[zf]+": data.getMilliseconds()//毫秒
							},
							(d, k) => {
								let str = "";
								let rxp = new RegExp(`(${k})`, "g");

								if (!rxp.test(fmt)) return;

								let len = RegExp.$1.length;

								switch (k) {
									case "y+":
										str = String(d);
										if (len >= 2 && len < 4) str = str.substr(-2);
										break;
									case "w+":
									case "W+":
										str = d;
										break;
									default:
										str = String(d);

										if (len > str.length) {
											for (let i = str.length; i < len; i++) str = `0${str}`;
										}
										break;
								}

								fmt = fmt.replace(rxp, str);
							}
						);
					}

					data = fmt;

					return func ? func(data, value) : data;
				}
				case "array": {
					/**
					 * @param {Array} value
					 * @param {number|object} opt
					 *    @param {number} [opt.tab=0] <tab conver blank space>
					 *    @param {number} [opt.level] <tab level>
					 *    @param {boolean} [opt.buf=false] <is parse as buffer>
					 *    @param {boolean} [opt.str=false] <is conver to string>
					 *    @param {string} [opt.char= ] <char>
					 *    @param {number} [opt.offset=0] <offset data>
					 *    @param {number} [opt.count=value.length] <count data>
					 * @param {function} [callback]
					 */
					let {
							buf = false,
							tab = 0,
							char
						} = opt;

					switch (typeof(opt)) {
						case "number":
							tab = opt;
							break;
						case "boolean":
							buf = opt;
							break;
						case "string":
							char = opt;
							break;
					}

					let list = [];

					if (buf === true) {
						let {
								str    = false,
								offset = 0,
								count  = data.length
							} = opt;

						str = str === true;
						if (!$.isString(char)) char = " ";
						if (!$.isNumber(offset)) offset = 0;
						if (!$.isNumber(count)) count = value.length;
						if (!$.isString(char)) char = "";
						if (str) char = "";

						if (offset < 0) offset += data.length;
						if (offset < 0) offset = 0;
						if (count < 1) count = 0;

						count = Math.min(data.length, offset + count) - 1;

						for (let i = count, d, c; i >= offset; i--) {
							d = data[i];

							if (str) {
								list.unshift(String.fromCharCode(d));
							}
							else {
								let n;

								do {
									c = d & 0xff;
									n = c < 0x10 ? "0" : "";

									list.unshift(`${n}${c.toString().toUpperCase()}`);

									d >>>= 8;
								}
								while (d);
							}
						}

						data = list.join(char);
					}
					else {
						let {
								level
							} = opt;

						if (!$.isNumber(tab, {min: 0})) tab = 0;
						if (!$.isNumber(level, {min: 0})) level = 0;

						let fmt = ["", "[", "]", ",", ""];

						if (tab > 0) {
							let d = tab * level;

							for (let i = 0; i < tab; i++) fmt[4] = ` ${fmt[4]}`;
							for (let i = 0; i < d; i++) fmt[0] = `${fmt[0]} `;
							fmt[1] = `${fmt[0]}${fmt[1]}\n`;
							fmt[2] = `\n${fmt[0]}${fmt[2]}`;
							fmt[3] = `${fmt[3]}\n`;
							fmt[4] = `${fmt[0]}${fmt[4]}`;
						}

						level += 1;

						if ($.isObject(opt)) opt = {};
						opt.tab   = tab;
						opt.level = level;

						for (let i = 0, d, o, t; i < data.length; i++) {
							d = data[i];
							t = $.type(d, true);
							o = opt[i] || opt[t] || opt;

							switch (t) {
								default:
									d = api.toString(d, o).trim();
									break;
								case "number":
									d = o.len ? api.toFloat(d, o) : api.toInteger(d, o);
									break;
								case "string":
									d = api.toString(d, o);
									d = `\"${d}\"`;
									break;
							}

							list.push(`${fmt[4]}${d}`);
						}

						data = list.join(fmt[3]);
						data = `${fmt[1]}${data}${fmt[2]}`;
					}

					return func ? func(data, value) : data;
				}
				case "object": {
					/**
					 * @param {object} value
					 * @param {number|object} opt
					 *    @param {number} [opt.tab=0] <tab conver blank space>
					 *    @param {number} [opt.level] <tab level>
					 *    @param {boolean} [opt.form=false] <parse form-data>
					 * @param {function} [callback]
					 */
					let {
							tab   = 0,
							level = 0,
							form  = false
						} = opt;

					switch (typeof(opt)) {
						case "number":
							tab = opt;
							break;
						case "boolean":
							form = opt;
							break;
					}

					if (form === true) {
						let list = [];
						let d;

						for (let k in data) {
							d = data[k];

							switch ($.type(d, true)) {
								case "boolean":
								case "string":
								case "number":
									list.push(`${k}=${d}`);
									break;
								case "array":
									d.forEach(v => list.push(`${k}=${v}`));
									break;
							}
						}

						data = list.join("&");
					}
					else {
						if (typeof(opt) === "number") tab = opt;

						if (!$.isNumber(tab, {min: 0})) tab = 0;
						if (!$.isNumber(level, {min: 0})) level = 0;

						let list = [];
						let fmt  = ["", "{", "}", ",", "\"", "\":"];

						if (tab > 0) {
							let d = tab * level;

							for (let i = 0; i < tab; i++) fmt[4] = ` ${fmt[4]}`;
							for (let i = 0; i < d; i++) fmt[0] = `${fmt[0]} `;
							fmt[1] = `${fmt[0]}${fmt[1]}\n`;
							fmt[2] = `\n${fmt[0]}${fmt[2]}`;
							fmt[3] = `${fmt[3]}\n`;
							fmt[4] = `${fmt[0]}${fmt[4]}`;
							fmt[5] = `${fmt[5]} `;
						}

						level += 1;

						if (!$.isObject(opt)) opt = {};
						opt.tab   = tab;
						opt.level = level;

						let d,
							o,
							t;

						for (let k in data) {
							d = data[k];
							t = $.type(d, true);
							o = opt[k] || opt[t] || opt;

							switch (t) {
								default:
									d = api.toString(d, o).trim();
									break;
								case "number":
									d = o.len ? this.toFloat(d, o) : this.toInteger(d, o);
									break;
								case "string":
									d = api.toString(d, o);
									d = `\"${d}\"`;
									break;
							}

							list.push(`${fmt[4]}${k}${fmt[5]}${d}`);
						}

						data = list.join(fmt[3]);
						data = `${fmt[1]}${data}${fmt[2]}`;
					}

					return func ? func(data, value) : data;
				}
				case "uint8array": {
					/**
					 * @param {Uint8Array} value
					 * @param {string|number|object} opt
					 *    @param {boolean} [opt.str=false] <is conver string>
					 *    @param {string} [opt.char= ] <char>
					 *    @param {number} [opt.offset=0] <offset data>
					 *    @param {number} [opt.count=value.length] <count data>
					 * @param {function} [callback]
					 */
					let {
							str    = false,
							char   = "",
							offset = 0,
							count  = data.length
						} = opt;

					switch (typeof(opt)) {
						case "string":
							char = opt;
							break;
						case "number":
							offset = opt;
							break;
					}

					data = [...data];

					str = str === true;
					if (!$.isString(char)) char = "";
					if (!$.isNumber(offset, {min: 0})) offset = 0;
					if (!$.isNumber(count, {min: 0})) count = data.length;

					return api.toString(data, {buf: true, str, char, offset, count}, func);
				}
			}
		},
		/**
		 * Any to date
		 *
		 * @param {*} value
		 * @param {date|object} [opt]
		 *    @param {date} [opt.def=NOW] <default is now>
		 * @param {function} [callback=null]
		 * @returns {*}
		 */
		toDate (value, opt, callback = opt) {
			let data = value;

			let {
					def = 0
				} = opt;

			if ($.type(opt, true) === "date") def = opt;

			if (!$.isDate(def)) def = new Date();

			switch ($.type(data, true)) {
				default:
					data = new Date(0);
					break;
				case "date":
					data = new Date(data.getTime());
					break;
				case "number":
					if (isNaN(data)) data = 0;
					data = new Date(data);
					break;
				case "string": {
					if (/\d/g.test(data)) {
						data = api.toDate(Number(data), def);
						break;
					}

					data = (data || "").replace("T", " ").replace("Z", "");
					data = data.replace(/,|-/g, "/").replace(/\./g, ":");
					data = data.split(" ");

					if (data.length > 2) {
						data = api.toDate(def, def);
						break;
					}

					const rDate = [def.getFullYear(), def.getMonth() + 1, def.getDate()];
					const rTime = [0, 0, 0, 0];

					let _date;
					let _time;

					data.forEach(d => {
						if (d.indexOf("/") > 0) _date = d;
						else if (d.indexOf(":") > 0) _time = d;
					});

					_date = api.isDate(_date, true) ? _date.split("/").map(d => Number(d)) : rDate;
					_time = api.isTime(_time, true) ? _time.split(":").map(d => Number(d)) : rTime;

					data = new Date(_date[0], _date[1] - 1, _date[2], _time[0], _time[1], _time[2], _time[3]);
					break;
				}
			}

			return $.isFunction(callback) ? callback(data, value, def) : data;
		},
		/**
		 * Any to Object
		 *
		 * @Deprecated: no safe, will remove this function
		 *
		 * @param {*} value
		 * @returns {object}
		 */
		toObject (value) {
			if (!$.isString(value, {min: 2})) return null;

			try {
				let hf = [value.charAt(0), value.charAt(value.length - 1), value];

				if (hf[0] === "{" && hf[1] === "}") hf[2] = "(" + value + ")";

				return eval(hf[2]);
			}
			catch (e) {
				console.error("String to Object is Error ", e.message);
			}

			return null;
		},
		/**
		 * Any to array with arguments
		 *
		 * @param {*} value
		 * @returns {array}
		 */
		toArray (...value) {
			let data;

			if (value.length === 1) {
				switch ($.type(value, true)) {
					default:
						data = [value];
						break;
					case "array":
					case "arguments":
					case "set":
						data = [...value];
						break;
				}
			}
			else {
				data = [];

				value.forEach(d => {
					data = [...data, ...api.toArray(d)];
				});
			}

			return data;
		},
		/**
		 * String to json object
		 *
		 * @param {string} value
		 * @param {object|boolean} [opt]
		 *    @param {boolean} [opt.form=false]
		 * @param {function} [callback=null] <custom function, key/vale oper by every time>
		 * @returns {object|Array}
		 */
		toJSON (value, opt, callback = opt) {
			let data = String(value).trim();
			let func = $.isFunction(callback) ? callback : null;

			let {
					form = false
				} = opt;

			switch (typeof(opt)) {
				case "boolean":
					form = opt;
					break;
			}

			let result;

			if (form === true) {
				result = {};

				let k,
					v,
					i;
				data.split("&").forEach(d => {
					i = d.indexOf("=");

					if (i < 0) {
						k = d;
						v = undefined;
					}
					else {
						k = d.substring(0, i);
						v = d.substring(i + 1);
					}

					result[k] = result[k] ? [...result[k], v] : v;
				});
			}
			else {
				const parseTag    = (type, value, REGEXP) => {
					if (type < 0 || type > 2) return value;

					let i = 0,
						d = "";

					for (let l = 0, c = 0; i < value.length; i++) {
						c = value[i];
						d += c;
						c = c.charCodeAt();

						if (type === 0) {
							//字符串
							if (!l) l = c;
							else if (c === 92 || (l & 64)) l ^= 64;
							else if (l === c) break;
						}
						else if (type === 1) {
							//对象
							if (c === 39 || c === 34) {
								d += parseTag(0, value.substr(i)).substr(1);
								i = d.length - 1;
							}
							else if (c === 123) {
								l += 1;
							}
							else if (c === 125) {
								l -= 1;
								if (!l) break;
							}
						}
						else if (type === 2) {
							//数组
							if (c === 39 || c === 34) {
								d += parseTag(0, value.substr(i)).substr(1);
								i = d.length - 1;
							}
							else if (c === 91) {
								l += 1;
							}
							else if (c === 93) {
								l -= 1;
								if (!l) break;
							}
						}
					}

					if (REGEXP && i < value.length) REGEXP.lastIndex -= value.length - d.length;

					return d;
				};
				const parseSimple = (parent, key, value, callback, STRING, REGEXP) => {
					let str = value[0];

					if (str === "'" || str === "\"") value = parseTag(0, value, REGEXP);

					str = STRING.Trim(value, ["\"", "'"]);

					if (str !== value) {
						parent[key] = str;
					}
					else {
						switch (str) {
							case "true":
								parent[key] = true;
								break;
							case "false":
								parent[key] = false;
								break;
							case "null":
							case "undefined":
								parent[key] = null;
								break;
							default:
								if (/^function\s*\(.*?\)\s*\{\s\S*?\}$/i.test(str)) {
									delete parent[key];
								}
								else {
									parent[key] = $.isNumber(str, {nan: false, str: true}) ? Number(str) : str;
								}
								break;
						}
					}

					if (callback) callback(parent, key, parent[key]);
				};
				const parseObject = (parent, value, callback, STRING, REGEXP) => {
					const rxp = [
						/["']?(\w{1}[\w\-\.]*)["']?\s*:\s*((?:\{[\s\S]*\})|(?:\[[\s\S]*\])|(?:[ef]?\-?\d+\.?\d*)|(?:true|false|null|undefined)|(?:["'][\s\S]*["'])|(?:function\s*\(.*?\)\s*\{[\s\S]*?\})){1},/g,
						/^\{[\s\S]*\}$/,
						/^\[[\s\S]*\]$/
					];

					if (REGEXP) value = parseTag(1, value, REGEXP);

					value = value.replace(/\]\s*\}$/g, "]}").replace(/\}\s*\}$/g, "}}").replace(/\s*\}$/g, "}");
					value = value.replace(/\}$/g, ",}").replace(/^\s*/, "");

					let r,
						v;
					while (r = rxp[0].exec(value)) {
						if (r.length !== 3) continue;

						r[1] = STRING.Trim(r[1].trim(), ["\"", "'"]).trim();
						r[2] = String(r[2]).trim();

						if (rxp[1].test(r[2])) {
							v            = {};
							parent[r[1]] = v;
							parseObject(v, r[2], callback, STRING, rxp[0]);
						}
						else if (rxp[2].test(r[2])) {
							v            = [];
							parent[r[1]] = v;
							parseArray(v, r[2], callback, STRING, rxp[0]);
						}
						else {
							parseSimple(parent, r[1], r[2], callback, STRING, rxp[0]);
						}
					}
				};
				const parseArray  = (parent, value, callback, STRING, REGEXP) => {
					const rxp = [
						[/^["']/, /["']\s*,/g, "\", ", /"[\s\S]*",/g, ""],
						[/^\{/, /\}\s*,/g, "}, ", /\{[\s\S]*\},/g, ["{", "}"]],
						[/^\[/, /\]\s*,/g, "], ", /\[[\s\S]*\],/g, ["{", "}"]],
						[/^[ef]?\-?\d+\.?\d*\s*,/, /\s*,/g, ", ", /[ef]?\-?\d+\.?\d*/g, ""],
						[/^(?:true|false|null|undefined)\s*,/, /\s*,/g, ", ", /true|false|null|undefined/g, ""]
					];

					if (REGEXP) value = parseTag(2, value, REGEXP);

					value = value.replace(/\[\s*\{$/g, "[{").replace(/\[\s*\[$/g, "[[").replace(/\[\s*$/g, "[");
					value = value.replace(/\}\s*\]$/g, "}]").replace(/\]\s*\]$/g, "]]").replace(/\s*\]$/g, "]");
					value = value.replace(/\]$/g, ",]");

					value = STRING.Trim(value, ["[", "]"]).replace(/^\s*/, "");

					for (let i = 0, r, v; i < rxp.length; i++) {
						if (!rxp[i][0].test(value)) continue;

						value = value.replace(rxp[i][1], rxp[i][2]);

						while (r = rxp[i][3].exec(value)) {
							r[0] = parseTag(i, r[0], rxp[i][3]);

							if (rxp[i][4]) {
								parent.push(i === 1 ? {} : []);
								v = parent[parent.length - 1];

								if (i === 1) parseObject(v, r[0], callback, STRING);
								else parseArray(v, r[0], callback, STRING);
							}
							else {
								parseSimple(parent, parent.length, r[0], callback, STRING);
							}
						}

						break;
					}
				};

				if (/^\[[\s\S]*\]$/.test(data)) {
					result = [];

					parseArray(result, data, func, STRING);
				}
				else {
					if (!/^\{[\s\S]*\}$/.test(data)) data = `{${data}}`;

					result = {};

					parseObject(result, data, func, STRING);
				}
			}

			return result;
		},
		/**
		 * String to html tag / Html tag to string
		 *
		 * @param {string} value
		 * @param {boolean|object} [opt]
		 *    @param {boolean} [opt.tab=true] <is parse tab tag>
		 *    @param {boolean} [opt.rev=false] <is reverse conver like html tag to string>
		 * @returns {string}
		 */
		toHtml (value, opt) {
			let {
					tab = true,
					rev = false
				} = opt;

			if (typeof(opt) === "boolean") rev = opt;

			tab = tab === true;

			const tHT = [
				{reg: "&", text: "&amp;"},
				{reg: "<", text: "&lt;"},
				{reg: ">", text: "&gt;"},
				{reg: "\"", text: "&quot;"},
				{reg: "\'", text: "&apos;"},
				{reg: "\r\n", text: "<br>"},
				{reg: "\n", text: "<br>"},
				{reg: " ", text: tab ? "&nbsp;" : "　"},
				{reg: "\t", text: tab ? "&nbsp;&nbsp;" : "　　"}
			];
			const fHT = [
				{reg: "&lt;", text: "<"},
				{reg: "&gt;", text: ">"},
				{reg: "&quot;", text: "\""},
				{reg: "&apos;", text: "\'"},
				{reg: "<br>", text: "\n"},
				{reg: tab ? "&nbsp;&nbsp;" : "　　", text: "\t"},
				{reg: "&nbsp;", text: " "},
				{reg: "&amp;", text: "&"}
			];

			return STRING.Filter(value, rev === true ? fHT : tHT);
		},
		/**
		 * Number to conver chinese money code
		 *
		 * @param {number} value
		 * @param {number|array|object} [opt]
		 *    @param {number} [opt.def=0] <default value>
		 *    @param {array} [opt.bit] <chinese format code>
		 * @returns {string}
		 */
		toMoney (value, opt) {
			let {
					def = 0,
					bit
				} = opt;

			switch ($.type(opt, true)) {
				case "number":
					def = opt;
					break;
				case "array":
					bit = opt;
					break;
			}

			if (!$.isArray(bit, {min: 4})) {
				bit = [
					["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"],
					["", "拾", "佰", "千"],
					["", "万", "亿", "兆"],
					["分", "角", "", ""]
				];
			}

			let data = [api.toFloat(value, {def, len: 2}), 0];

			data[1] = parseInt(data[0] * 100 - parseInt(data[0]) * 100);

			data[0] = api.toString(data[0], {chs: true, bit: [bit[0], bit[1], bit[2]]});
			data[1] = data[1] ? api.toString(data[1], {chs: true, bit: [bit[0], bit[3], ["", "", "", ""]]}) : "整";

			return `${data[0]}元${data[1]}`;
		},
		/**
		 * String format url
		 *
		 * @param {string} value
		 * @returns {string}
		 */
		toUrl (value) {
			let data = $.isString(value) ? value.trim() : "";

			if (data) {
				if (!/^[A-Za-z][A-Za-z0-9]*:\/\//.test(data)) data = `http://${data}`;

				data = data.replace(/\/\.\//g, "/").replace(/^([A-Za-z][A-Za-z0-9]*:\/\/[\w\.-]+)\:(80)?\//g, "$1/").replace(/([^:/])\/+\//g, "$1/");

				let DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//;
				while (data.match(DOUBLE_DOT_RE)) data = data.replace(DOUBLE_DOT_RE, "/");
			}

			return data;
		},
		/**
		 * Any to unit8array
		 *
		 * @WARN: if type not string, conver string oper
		 *
		 * @param {string} value
		 * @param {boolean|number|object} [opt]
		 *    @param {string} [opt.encoding=ansi] <output encoding mode>
		 *    @param {boolean} [opt.buf=false] <is output arraybuffer>
		 *    @param {boolean} [opt.str=false] <is output string>
		 *    @param {number} [opt.len=1] <only str = true>
		 * @returns {Array|Uint8Array}
		 */
		toHex (value, opt) {
			let result = [],
				be     = false,
				func;

			const toFill  = (value, len, be) => {
				be = be !== false;

				if (len > 1) {
					len = Math.ceil(value.length / len) * len;

					while (value.length < len) {
						if (be) value.unshift(0);
						else value.push(0);
					}
				}

				return value;
			};
			const toArray = (value, len) => {
				if (len <= 1) return value;

				let r = [];

				for (let i = 0, j, l; i < value.length;) {
					j = len;
					l = r.push(0);
					l -= 1;

					do {
						if (r[l]) r[l] <<= 8;
						r[l] |= value[i++];

						j -= 1;
					}
					while (j && i < value.length);
				}

				return r;
			};
			const toBasic = (value, r, i) => {
				value = value.charCodeAt(i++);

				let l = [];

				while (value) {
					l.unshift(value & 0xFF);
					value >>>= 8;
				}

				r.push(...l);

				return i;
			};
			const toUTF8  = (value, r, i) => {
				if (!r) r = [];

				value = value.charCodeAt(i++);

				if (value < 0x80) r.push(value);
				else if (value < 0x800) {
					r.push(
						0xC0 | (value >>> 6),
						0x80 | (value & 0x3F)
					);
				}
				else if (value < 0x10000) {
					r.push(
						0xE0 | (value >>> 12),
						0x80 | ((value >>> 6) & 0x3F),
						0x80 | (value & 0x3F)
					);
				}
				else {
					r.push(
						0xF0 | (value >>> 18),
						0x80 | ((value >>> 12) & 0x3F),
						0x80 | ((value >>> 6) & 0x3F),
						0x80 | (value & 0x3F)
					);
				}

				return i;
			};
			const toUTF16 = (value, r, i, m) => {
				let c = [value.charCodeAt(i++), 0, 0, 0];

				m = m ? "push" : "unshift";

				c[3] = c[0] >> 4;
				if (c[3] < 0) return;

				switch (c[3]) {
					case 0x0E:
						c[1] = value.charCodeAt(i++);
						c[2] = value.charCodeAt(i++);

						r[m]((c[0] & 0x0F) << 12 | ((c[1] & 0x3F) << 6) | ((c[2] & 0x3F) << 0));
						break;
					case 0x0C:
					case 0x0D:
						c[1] = value.charCodeAt(i++);

						r[m](((c[0] & 0x1F) << 6) | (c[1] & 0x3F));
						break;
					default:
						if (c[3] < 0) return;
						else if (c[3] < 8) r[m](c[0]);
						break;
				}

				return i;
			};
			const toUTF32 = (value, r, i, m) => {
				let l = [];

				i = toBasic(value, l, i);
				l = toFill(l, 4);

				if (!m) l.reverse();

				r.push(...l);

				return i;
			};

			let {
					encoding = "ansi",
					len      = 1,
					buf      = false,
					str      = false
				} = opt;

			switch (typeof (opt)) {
				case "boolean":
					buf = opt;
					break;
				case "string":
					encoding = opt;
					break;
				case "number":
					len = opt;
					break;
			}

			if (!$.isString(encoding)) encoding = "ansi";
			if (!$.has(len, [1, 2, 4, 8])) len = 1;
			buf = ($.mode === $.MODE.Node) && (buf === true);
			str = !buf && str === true;

			let data = String(value);

			switch (encoding.toUpperCase()) {
				default:
				case "ANSI":
					func = toBasic;
					break;
				case "8":
				case "UTF8":
					func = toUTF8;
					break;
				case "16":
				case "UTF16":
				case "UTF16BE":
					be = true;
				case "UTF16LE":
					func = toUTF16;
					break;
				case "32":
				case "UTF32":
				case "UTF32BE":
					be = true;
				case "UTF32LE":
					func = toUTF32;
					break;
			}

			for (let i = 0; i < data.length;) i = func(data, result, i, be);

			if (buf) return Buffer.from(result);

			result = toArray(toFill(result, len, be), len);

			if (str) {
				func = [];
				len *= 2;

				for (let i = 0, d; i < result.length; i++) {
					d = result[i].toString(16).toUpperCase();
					while (d.length < len) d = `0${d}`;
					func.push(d);
				}

				result = func;
			}

			return result;
		}
	};

	return api;
}, module);