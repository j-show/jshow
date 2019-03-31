/**
 * ==========================================
 * Name:           Conver
 * Author:         jShow
 * CreTime:        2014-11-20
 * Description:    转换函数库
 * Log
 * 2015-06-08    优化模块结构
 * ==========================================
 */
jShow.define(function (module, exports, require) {
	"use strict";
	let api;

	/**
	 * 泛式转换
	 *
	 * @namespace Conver
	 */
	api = {
		/**
		 * 转换Boolean
		 *
		 * @param {*} value
		 * @returns {boolean}
		 */
		toBool:     value => {
			switch (jShow.type(value, true)) {
				case "boolean":
					return value;
				case "number":
					return value != 0;
				case "string":
					return value.toLowerCase() == "true";
				case "null":
				case "undefined":
					return false;
				case "array":
					return value.length > 0;
				case "object":
					return !jShow.is(value, {}, false);
				default:
					return false;
			}
		},
		/**
		 * 转换Integer
		 *
		 * @param {*} value
		 * @param {number} [def=0]
		 * @param {function} [callback=null]
		 * @returns {number}
		 */
		toInteger:  (value, def, callback) => {
			let result = Number(value);

			if (callback === void(0)) callback = def;

			def = parseInt(jShow.isNumber(def) ? def : 0);
			result = parseInt(isNaN(result) ? def : result);

			return jShow.isFunction(callback) ? callback(result, value, def) : result;
		},
		toUInteger: (value, def, callback) => {
			return api.toInteger(value, def, (result, value, def) => {
				if (result < 0) result = def;

				return jShow.isFunction(callback) ? callback(result, value, def) : result;
			});
		},
		/**
		 * 转换Float
		 * 忽略小数部分采取四舍五入
		 *
		 * @param {*} value
		 * @param {number} [len=1] 小数位数
		 * @param {number} [def=0] 默认值
		 * @param {function} [callback=null]
		 * @returns {number}
		 */
		toFloat:    (value, len, def, callback) => {
			let result = Number(value);

			if (callback === void(0)) callback = def;

			len = parseInt(jShow.isNumber(len) && len > 0 ? len : 1);
			def = parseFloat(jShow.isNumber(def) ? def : 0);
			result = isNaN(result) ? def : result;

			result = parseInt(result * Math.pow(10, len) + 0.5 * (result > 0 ? 1 : -1)) / Math.pow(10, len);

			return jShow.isFunction(callback) ? callback(result, value, def) : result;
		},
		toUFloat:   (value, len, def, callback) => {
			return api.toFloat(value, len, def, (result, value, def) => {
				if (result < 0) result = def;

				return jShow.isFunction(callback) ? callback(result, value, def) : result;
			});
		},
		/**
		 * 转换字符串，只进行基础类型转换
		 *
		 * @param {*} value
		 * @param {object} opt
		 * @param {function} callback
		 * @returns {string}
		 */
		toString:   function (value, opt, callback) {
			if (arguments.length < 3) callback = opt;
			if (!jShow.isFunction(callback)) callback = null;

			if (jShow.isObject(opt)) opt = jShow.clone(opt, {}, true);

			switch (jShow.type(value, true)) {
				default:
					return "";
				case "boolean":
					return callback ? callback(value ? "true" : "false", value) : (value ? "true" : "false");
				case "number":
					/**
					 * @param {number} value
					 * @param {object} [opt]
					 *    @param {number} [opt.len=0]
					 *    @param {number} [opt.def=0]
					 *    @param {boolean} [opt.chs=false] 是否按大写中文方式转换
					 *    @param {Array} [opt.bit]
					 * @param {function} [callback=null]
					 */
					return (function (value, opt, callback) {
						let result,
							len, def, chs, bit;

						switch (jShow.type(opt, true)) {
							case "object":
								len = opt.len;
								def = opt.def;
								chs = opt.chs;
								bit = opt.bit;
								break;
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
						if (!jShow.isNumber(len) || len < 0) len = 0;
						if (!jShow.isNumber(def)) def = 0;

						result = len ? this.toFloat(value, len, def) : this.toInteger(value, def);
						result = result.toString();

						if (chs === true) {
							result = ((value, bit) => {
								let int = [],
									dec = [],
									i, j, o, p;

								for (i = value[0].length - 1; i >= 0; i--) int.push(value[0][i]);
								for (i = 0; i < value[1].length; i++) dec.push(bit[0][parseInt(value[1][i])]);
								for (i = 0, j = -1, o = "", p = ""; i < int.length; i++) {
									if (i % 4 == 0) {
										j++;
										p = bit[2][j] + p;
										o = "";
									}

									if (int[i] != "0") p = bit[0][parseInt(int[i])] + bit[1][i % 4] + p;
									else {
										if (i % 4 && int[i - 1] != "0") o = bit[0][0];

										p = o + p;
										o = "";
									}
								}

								if (p.indexOf(bit[0][0]) == 0) p = p.substr(1);

								int = p.split("");

								for (i = 0, o = false; i < int.length;) {
									if (o) {
										if (int[i] == bit[1][1]) {
											int.splice(i - 1, 1);
											continue;
										}
										else o = false;
									}
									else if (int[i] == bit[0][1]) o = true;

									i++;
								}
								for (i = 0, o = false; i < int.length;) {
									for (j = 0; j < bit[2].length; j++) {
										if (int[i] == bit[2][j]) {
											if (o) int.splice(i, 1);
											o = true;
											break;
										}
									}

									if (o && j >= bit[2].length) o = false;
									else i++;
								}

								int = int.join("");
								dec = dec.length > 0 ? bit[0][10] + dec.join("") : "";

								return int + dec;
							})(result.split(".").concat(""), jShow.isArray(bit) ? bit : [
								["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "点"],
								["", "十", "百", "千"],
								["", "万", "亿", "兆"]
							]);
						}

						return callback ? callback(result, value) : result;
					}).apply(api, [value, opt, callback]);
				case "string":
					/**
					 * @param {string} value
					 * @param {object} [opt]
					 *    @param {string} [opt.filter=text] 过滤类型
					 *        @param {string} opt.filter=text 文本过滤
					 *            @param {boolean} [opt.html] 是否转义html
					 *        @param {string} opt.filter=html html标签过滤
					 * @param {function} [callback=null]
					 */
					return (function (value, opt, callback) {
						let result = value,
							filter;

						switch (jShow.type(opt, true)) {
							default:
								opt = {};
								break;
							case "object":
								filter = opt.filter;
								break;
							case "boolean":
								opt = {
									html: opt
								};
								filter = "text";
								break;
						}

						switch (filter) {
							default:
							case "text":
								if (opt.html === true) result = this.toHtml(result, false, false);
								break;
							case "html":
								result = jShow.RegExp.Html(result, "*");
								break;
						}

						return callback ? callback(result, value) : result;
					}).apply(api, [value, opt, callback]);
				case "undefined":
				case "null":
					return jShow.isFunction(callback) ? callback("null", value) : "null";
				case "date":
					/**
					 * @param {date} value
					 * @param {object|string} opt
					 *    @param {string} [opt.fmt=yyyy-m-d hh:nn:ss] 格式化字符串
					 * @param {function} [callback]
					 */
					return (function (value, opt, callback) {
						let result = "yyyy-m-d hh:nn:ss",
							fmt;

						switch (typeof(opt)) {
							case "object":
								fmt = opt.fmt;
								break;
							case "string":
								fmt = opt;
								break;
						}
						if (jShow.isString(fmt)) result = fmt;

						if (result.toLowerCase() === "iso") result = "yyyy-mm-ddThh:nn:ssZ";
						else if (jShow.TChinaDate && /((CY|CM|Y|M|D|T|Z)+)/.test(result)) result = (new jShow.TChinaDate(value)).toString(result);

						if (/((y|m|d|w|W|h|H|n|N|s|S|q|Q|z|f)+)/.test(result)) {
							jShow.each(
								{
									"y+":    value.getFullYear(), //年份
									"m+":    value.getMonth() + 1,//月份
									"d+":    value.getDate(),//日
									"w+":    value.getDay(),//周
									"W+":    (["日", "一", "二", "三", "四", "五", "六"])[value.getDay()],//中文周
									"[hH]+": value.getHours(),//小时
									"[nN]+": value.getMinutes(),//分
									"[sS]+": value.getSeconds(),//秒
									"[qQ]+": Math.floor((value.getMonth() + 3) / 3),//季度
									"[zf]+": value.getMilliseconds()//毫秒
								},
								(d, k, str, rxp) => {
									str = "";
									rxp = new RegExp("(" + k + ")", "g");

									if (!rxp.test(result)) return;

									switch (k) {
										case "y+":
											str = RegExp.$1.length >= 4 || RegExp.$1.length < 2 ? d : (d + "").substr(-2);
											break;
										case "w+":
										case "W+":
											str = d;
											break;
										default:
											str = d + "";

											if (RegExp.$1.length > str.length) {
												for (let i = str.length; i < RegExp.$1.length; i++) str = "0" + str;
											}
											break;
									}

									result = result.replace(rxp, str);
								}
							);
						}

						return callback ? callback(result, value) : result;
					}).apply(api, [value, opt, callback]);
				case "array":
					/**
					 * @param {Array} value
					 * @param {number|object} opt 参数
					 *    @param {number} [tab=0] 缩进空格数
					 *    @param {number} [level] 缩进级别
					 *    @param {boolean} [opt.buf=false] 是否作为字节数据处理
					 *    @param {boolean} [opt.str=false] 是否转换成字符串内容
					 *    @param {string} [opt.char= ] 字节间隔
					 *    @param {number} [opt.offset=0] 偏移量
					 *    @param {number} [opt.count=value.length] 总长度
					 * @param {function} [callback]
					 */
					return (function (value, opt, callback) {
						let result = [],
							buf, char, offset, count, str,
							tab, level;

						switch (typeof(opt)) {
							case "object":
								if (opt) {
									tab = opt.tab;
									level = opt.level;
									char = opt.char;
									buf = opt.buf;
									offset = opt.offset;
									count = opt.count;
									str = opt.str;
								}
								break;
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

						if (buf === true) {
							if (!jShow.isString(char)) char = " ";
							if (!jShow.isNumber(offset)) offset = 0;
							else if (offset < 0) offset += value.length;
							if (!jShow.isNumber(count)) count = value.length;
							else if (count < 1) count = 0;
							if (offset < 0) offset = 0;
							count = Math.min(value.length, offset + count) - 1;
							if (str = str === true) char = "";

							for (let i = count, d, c; i >= offset; i--) {
								d = value[i];

								if (str) result.unshift(String.fromCharCode(d));
								else {
									do {
										c = d & 0xFF;
										result.unshift((c < 0x10 ? "0" : "") + c.toString(16).toUpperCase());

										d >>>= 8;
									}
									while (d);
								}
							}

							result = result.join(char);
						}
						else {
							tab = parseInt(jShow.isNumber(tab) && tab >= 0 ? tab : 0);
							level = parseInt(jShow.isNumber(level) && level >= 0 ? level : 0);

							let fmt = ["", "[", "]", ",", ""],
								o, d, i;

							if (tab > 0) {
								d = tab * level;

								for (i = 0; i < tab; i++) fmt[4] = " " + fmt[4];
								for (i = 0; i < d; i++) fmt[0] += " ";
								fmt[1] = fmt[0] + fmt[1] + "\n";
								fmt[2] = "\n" + fmt[0] + fmt[2];
								fmt[3] = fmt[3] + "\n";
								fmt[4] = fmt[0] + fmt[4];
							}

							level++;

							if (!jShow.isObject(opt)) opt = {};
							opt.tab = tab;
							opt.level = level;

							for (i = 0; i < value.length; i++) {
								d = value[i];
								o = opt[i] || opt;
								switch (jShow.type(d, true)) {
									case "object":
									case "array":
										result.push(fmt[4] + this.toString(d, o).trim());
										break;
									case "string":
										result.push(fmt[4] + "\"" + this.toString(d, o) + "\"");
										break;
									case "number":
										d = o.len ? this.toFloat(d, o.len, o.def || 0) : this.toInteger(d, o.def || 0);
										result.push(fmt[4] + d);
										break;
									default:
										result.push(fmt[4] + this.toString(d, o));
										break;
								}
							}

							result = fmt[1] + result.join(fmt[3]) + fmt[2];
						}

						return jShow.isFunction(callback) ? callback(result, value) : result;
					}).apply(api, [value, opt, callback]);
				case "object":
					/**
					 * @param {object} value
					 * @param {number|object} opt 参数
					 *    @param {number} [opt.tab=0] 缩进空格数
					 *    @param {number} [opt.level] 缩进级别
					 * @param {function} [callback]
					 */
					return (function (value, opt, callback) {
						let tab, level;

						if (callback === void(0)) callback = opt;
						switch (typeof(opt)) {
							case "object":
								if (opt) {
									tab = opt.tab;
									level = opt.level;
								}
								break;
							case "number":
								tab = opt;
								break;
						}
						tab = parseInt(jShow.isNumber(tab) && tab >= 0 ? tab : 0);
						level = parseInt(jShow.isNumber(level) && level >= 0 ? level : 0);

						let result = [],
							fmt    = ["", "{", "}", ",", "\"", "\":"],
							o, d, i;

						if (tab > 0) {
							d = tab * level;

							for (i = 0; i < tab; i++) fmt[4] = " " + fmt[4];
							for (i = 0; i < d; i++) fmt[0] += " ";
							fmt[1] = fmt[0] + fmt[1] + "\n";
							fmt[2] = "\n" + fmt[0] + fmt[2];
							fmt[3] = fmt[3] + "\n";
							fmt[4] = fmt[0] + fmt[4];
							fmt[5] = fmt[5] + " ";
						}

						level++;

						if (!jShow.isObject(opt)) opt = {};
						opt.tab = tab;
						opt.level = level;

						for (i in value) {
							d = value[i];
							o = opt[i] || opt;
							switch (jShow.type(d, true)) {
								case "object":
								case "array":
									result.push(fmt[4] + i + fmt[5] + this.toString(d, o).trim());
									break;
								case "string":
									result.push(fmt[4] + i + fmt[5] + "\"" + this.toString(d, o) + "\"");
									break;
								case "number":
									d = o.len ? this.toFloat(d, o.len, o.def || 0) : this.toInteger(d, o.def || 0);
									result.push(fmt[4] + i + fmt[5] + d);
									break;
								default:
									result.push(fmt[4] + i + fmt[5] + this.toString(d, o));
									break;
							}
						}

						result = fmt[1] + result.join(fmt[3]) + fmt[2];

						return jShow.isFunction(callback) ? callback(result, value) : result;
					}).apply(api, [value, opt, callback]);
				case "uint8array":
					/**
					 * @param {Uint8Array} value
					 * @param {string|number|object} opt 参数
					 *    @param {boolean} [opt.str=false] 是否转换成字符串内容
					 *    @param {string} [opt.char= ] 字节间隔
					 *    @param {number} [opt.offset=0] 偏移量
					 *    @param {number} [opt.count=value.length] 总长度
					 * @param {function} [callback]
					 */
					return (function (value, opt, callback) {
						let result = [],
							char, offset, count, str;

						switch (typeof(opt)) {
							case "object":
								if (opt) {
									char = opt.char;
									offset = opt.offset;
									count = opt.count;
									str = opt.str;
								}
								break;
							case "string":
								char = opt;
								break;
							case "number":
								offset = opt;
								break;
						}

						for (const v of value.values()) result.push(v);

						return api.toString(result, {
							buf:    true,
							str:    str,
							char:   char,
							offset: offset,
							count:  count
						}, callback);
					}).apply(api, [value, opt, callback]);
			}
		},
		/**
		 * 转换日期
		 *
		 * @param {*} value
		 * @param {date} [def=NOW]
		 * @param {function} [callback=null]
		 * @returns {*}
		 */
		toDate:     (value, def, callback) => {
			let result;

			if (callback === void(0)) callback = def;

			def = jShow.isDate(def) ? new Date(def.getTime()) : new Date(2000, 0, 1);

			switch (jShow.type(value, true)) {
				default:
					result = new Date(0);
					break;
				case "date":
					result = new Date(value.getTime());
					break;
				case "number":
					result = new Date(isNaN(value) ? 0 : value);
					break;
				case "string":
					if (/\D/g.test(value)) {
						result = (function (value, def) {
							const safeDate = i => {
									  return (v, n, d) => {
										  switch (i) {
											  case 0:
												  return v;
											  case 1:
												  return v < 1 || v > 12 ? d : v;
											  case 2:
												  return v < 1 || v > 31 ? d : v;
											  default:
												  return d;
										  }
									  }
								  },
								  safeTime = i => {
									  return (v, n, d) => {
										  switch (i) {
											  case 0:
												  return v < 1 || v > 23 ? d : v;
											  case 1:
											  case 2:
												  return v < 0 || v > 59 ? d : v;
											  case 3:
												  return v < 0 || v > 999 ? d : v;
											  default:
												  return d;
										  }
									  };
								  };

							let sdt   = [value.split(" "), [], []],
								rDate = [def.getFullYear(), def.getMonth() + 1, def.getDate()],
								rTime = [def.getHours(), def.getMinutes(), def.getSeconds(), def.getMilliseconds()],
								tmp;

							jShow.each(sdt[0], (d, i) => {
								tmp = sdt[0][i];

								if (tmp.indexOf("-") > 0) {
									if (sdt[1].length == 0) sdt[1] = tmp.split("-");
								}
								else if (tmp.indexOf(":") > 0) {
									if (sdt[2].length == 0) sdt[2] = tmp.split(":");
								}
							});

							if (sdt[1].length != 3) sdt[1] = [def.getFullYear(), def.getMonth() + 1, def.getDate()];
							if (sdt[2].length < 3 || sdt[2].length > 4) sdt[2] = [def.getHours(), def.getMinutes(), def.getSeconds(), def.getMilliseconds()];
							else if (sdt[2].length == 3) sdt[2].push(0);

							jShow.each(sdt[1], (d, i) => rDate[i] = this.toInteger(d, rDate[i], safeDate(i)));
							jShow.each(sdt[2], (d, i) => rTime[i] = this.toInteger(d, rTime[i], safeTime(i)));

							tmp = new Date(rDate[0], rDate[1] - 1, rDate[2], rTime[0], rTime[1], rTime[2]);
							tmp.setMilliseconds(rTime[3]);

							return tmp;
						}).call(api, (value || "").replace("T", " ").replace("Z", "").replace(/,|-|\//g, "-").replace(/\./g, ":"), def);
					}
					else {
						value = Number(value);
						result = new Date(isNaN(value) ? 0 : value);
					}
					break;
			}

			return jShow.isFunction(callback) ? callback(result, value, def) : result;
		},
		/**
		 * 转换成对象，强制转换
		 *
		 * @param {*} value
		 * @returns {object}
		 */
		toObject:   value => {
			if (jShow.isString(value) && value >= 2) {
				try {
					let hf = [value.charAt(0), value.charAt(value.length - 1), value];

					if (hf[0] == "{" && hf[1] == "}") hf[2] = "(" + value + ")";

					return eval(hf[2]);
				}
				catch (e) {
					console.error("String to Object is Error ", e.message);
				}
			}

			return null;
		},
		/**
		 * 转换成数组，将所有参数拼接成数组
		 *
		 * @param {*} value
		 * @param {boolean} [deep=true] 是否深度拼接
		 * @returns {array}
		 */
		toArray:    function (value, deep) {
			let result = [];

			if (deep !== false) {

			}
			else {
				result = Array.prototype.push.apply(result, value);
			}

			jShow.each(arguments, (d, i, t) => {
				if (t == "array") Array.prototype.push.apply(result, api.toArray.apply(null, d));
				else result.push(d);
			}, true);

			return result;
		},
		/**
		 * 转换成JSON对象
		 *
		 * @param {string} value
		 * @param {function} [callback=null] 处理函数，对每次键值对转换进行处理
		 * @returns {object|Array}
		 */
		toJSON:     (value, callback) => {
			const parseSimple = (parent, key, value, callback, STRING, REGEXP) => {
					  let str;

					  if (value[0] == "'" || value[0] == "\"") value = parseTag(0, value, REGEXP);

					  str = STRING.Trim(value, ["\"", "'"]);

					  if (str != value) parent[key] = str;
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
								  if (/^function\s*\(.*?\)\s*\{\s\S*?\}$/i.test(str)) delete parent[key];
								  else parent[key] = jShow.isNumber(str, {nan: false, str: true}) ? Number(str) : str;
								  break;
						  }
					  }

					  if (callback) callback(parent, key, parent[key]);
				  },
				  parseObject = (parent, value, callback, STRING, REGEXP) => {
					  let rxp = [
							  /["']?(\w{1}[\w\-\.]*)["']?\s*:\s*((?:\{[\s\S]*\})|(?:\[[\s\S]*\])|(?:[ef]?\-?\d+\.?\d*)|(?:true|false|null|undefined)|(?:["'][\s\S]*["'])|(?:function\s*\(.*?\)\s*\{[\s\S]*?\})){1},/g,
							  /^\{[\s\S]*\}$/,
							  /^\[[\s\S]*\]$/
						  ],
						  tmp;

					  if (REGEXP) value = parseTag(1, value, REGEXP);

					  value = value
						  .replace(/\]\s*\}$/g, "]}").replace(/\}\s*\}$/g, "}}").replace(/\s*\}$/g, "}")
						  .replace(/\}$/g, ",}").replace(/^\s*/, "");

					  while (tmp = rxp[0].exec(value)) {
						  if (tmp.length != 3) continue;

						  tmp[1] = STRING.Trim(tmp[1].trim(), ["\"", "'"]).trim();
						  tmp[2] = String(tmp[2]).trim();
						  if (rxp[1].test(tmp[2])) parseObject(parent[tmp[1]] = {}, tmp[2], callback, STRING, rxp[0]);
						  else if (rxp[2].test(tmp[2])) parseArray(parent[tmp[1]] = [], tmp[2], callback, STRING, rxp[0]);
						  else parseSimple(parent, tmp[1], tmp[2], callback, STRING, rxp[0]);
					  }
				  },
				  parseArray  = (parent, value, callback, STRING, REGEXP) => {
					  let rxp = [
						  [/^["']/, /["']\s*,/g, "\", ", /"[\s\S]*",/g, ""],
						  [/^\{/, /\}\s*,/g, "}, ", /\{[\s\S]*\},/g, ["{", "}"]],
						  [/^\[/, /\]\s*,/g, "], ", /\[[\s\S]*\],/g, ["{", "}"]],
						  [/^[ef]?\-?\d+\.?\d*\s*,/, /\s*,/g, ", ", /[ef]?\-?\d+\.?\d*/g, ""],
						  [/^(?:true|false|null|undefined)\s*,/, /\s*,/g, ", ", /true|false|null|undefined/g, ""]
					  ];

					  if (REGEXP) value = parseTag(2, value, REGEXP);

					  value = STRING.Trim(
						  value
							  .replace(/\[\s*\{$/g, "[{").replace(/\[\s*\[$/g, "[[").replace(/\[\s*$/g, "[")
							  .replace(/\}\s*\]$/g, "}]").replace(/\]\s*\]$/g, "]]").replace(/\s*\]$/g, "]")
							  .replace(/\]$/g, ",]"), ["[", "]"]).replace(/^\s*/, "");

					  for (let i = 0, tmp, val; i < rxp.length; i++) {
						  if (!rxp[i][0].test(value)) continue;

						  value = value.replace(rxp[i][1], rxp[i][2]);

						  while (tmp = rxp[i][3].exec(value)) {
							  tmp[0] = parseTag(i, tmp[0], rxp[i][3]);

							  if (!rxp[i][4]) parseSimple(parent, parent.length, tmp[0], callback, STRING);
							  else {
								  parent.push(i == 1 ? {} : []);
								  val = parent[parent.length - 1];

								  if (i == 1) parseObject(val, tmp[0], callback, STRING);
								  else parseArray(val, tmp[0], callback, STRING);
							  }
						  }

						  break;
					  }
				  },
				  parseTag    = (type, value, REGEXP) => {
					  if (type < 0 || type > 2) return value;

					  let i = 0,
						  d = "";

					  for (let l = 0, c = 0; i < value.length; i++) {
						  d += (c = value[i]);
						  c = c.charCodeAt();

						  if (type == 0) {
							  //字符串
							  if (!l) l = c;
							  else if (c == 92 || l & 64) l ^= 64;
							  else if (l == c) break;
						  }
						  else if (type == 1) {
							  //对象
							  if (c == 39 || c == 34) i = (d += parseTag(0, value.substr(i)).substr(1)).length - 1;
							  else if (c == 123) l++;
							  else if (c == 125 && !(--l)) break;
						  }
						  else if (type == 2) {
							  //数组
							  if (c == 39 || c == 34) i = (d += parseTag(0, value.substr(i)).substr(1)).length - 1;
							  else if (c == 91) l++;
							  else if (c == 93 && !(--l)) break;
						  }
					  }

					  if (REGEXP && i < value.length) REGEXP.lastIndex -= value.length - d.length;

					  return d;
				  };

			let result = null;

			value = String(value).trim();
			if (!jShow.isFunction(callback)) callback = null;

			if (/^\[[\s\S]*\]$/.test(value)) parseArray(result = [], value, callback, jShow.String);
			else parseObject(result = {}, /^\{[\s\S]*\}$/.test(value) ? value : ("{" + value + "}"), callback, jShow.String);

			return result;
		},
		/**
		 * 转换成HTML标签
		 *
		 * @param {string} value
		 * @param {boolean} [tab=true] tab识别
		 * @param {boolean} [rev=false] 反向转换
		 * @returns {string}
		 */
		toHtml:     (value, tab, rev) => {
			tab = tab !== false;

			return jShow.String.Filter(value,
				rev === true ? [
					{reg: "&lt;", text: "<"},
					{reg: "&gt;", text: ">"},
					{reg: "&quot;", text: "\""},
					{reg: "&apos;", text: "\'"},
					{reg: "<br>", text: "\n"},
					{reg: tab ? "&nbsp;&nbsp;" : "　　", text: "\t"},
					{reg: "&nbsp;", text: " "},
					{reg: "&amp;", text: "&"}
				] : [
					{reg: "&", text: "&amp;"},
					{reg: "<", text: "&lt;"},
					{reg: ">", text: "&gt;"},
					{reg: "\"", text: "&quot;"},
					{reg: "\'", text: "&apos;"},
					{reg: "\r\n", text: "<br>"},
					{reg: "\n", text: "<br>"},
					{reg: " ", text: tab ? "&nbsp;" : "　"},
					{reg: "\t", text: tab ? "&nbsp;&nbsp;" : "　　"}
				]);
		},
		/**
		 * 转换中文金额
		 *
		 * @param {number} value
		 * @param {number} [def=0]
		 * @returns {string}
		 */
		toMoney:    (value, def) => {
			value = [api.toFloat(value, 2, def), 0];
			value[1] = parseInt(value[0] * 100 - parseInt(value[0]) * 100);

			value[0] = api.toString(value[0], {
				chs: true, bit: [
					["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"],
					["", "拾", "佰", "千"],
					["", "万", "亿", "兆"]
				]
			});
			value[1] = value[1] ? api.toString(value[1], {
				chs: true, bit: [
					["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"],
					["分", "角", "", ""],
					["", "", "", ""]
				]
			}) : "整";

			return value[0] + "元" + value[1];
		},
		/**
		 * 格式化url，返回直接访问网址
		 *
		 * @param {string} value
		 * @returns {string}
		 */
		toUrl:      value => {
			value = jShow.isString(value) ? value.trim() : "";
			if (value) {
				if (!/^[A-Za-z][A-Za-z0-9]*:\/\//.test(value)) value = "http://" + value;
				value = value.replace(/\/\.\//g, "/").replace(/^([A-Za-z][A-Za-z0-9]*:\/\/[\w\.-]+)\:(80)?\//g, "$1/").replace(/([^:/])\/+\//g, "$1/");

				let DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//;
				while (value.match(DOUBLE_DOT_RE)) value = value.replace(DOUBLE_DOT_RE, "/");
			}

			return value;
		},
		/**
		 * 转换Bin 字符串转bin数组
		 *
		 * @param {string} value 非string类型强制转换成string处理
		 * @param {boolean|number|object} [opt] 参数
		 *    @param {string} [opt.encoding=ansi] 输出编码方式
		 *    @param {boolean} [opt.buf=false] 是否输出为ArrayBuffer
		 *    @param {boolean} [opt.str=false] 是否输出为字符串，与buf参数互斥
		 *    @param {number} [opt.len=1] 数据补足位数，str=true时生效
		 * @returns {Array|Uint8Array}
		 */
		toHex:      (value, opt) => {
			let result = [],
				be     = false,
				func;

			const toFill  = (value, len, be) => {
					  be = be !== false;
					  if (len > 1) {
						  len = Math.ceil(value.length / len) * len;
						  while (value.length < len) value[be ? "unshift" : "push"](0);
					  }

					  return value;
				  },
				  toArray = (value, len) => {
					  if (len <= 1) return value;

					  let r = [];
					  for (let i = 0, j, l; i < value.length;) {
						  j = len;
						  l = r.push(0);
						  l--;
						  do {
							  if (r[l]) r[l] <<= 8;
							  r[l] |= value[i++];
						  }
						  while (--j && i < value.length);
					  }
					  return r;
				  },
				  toBasic = (value, r, i) => {
					  value = value.charCodeAt(i++);

					  let l = [];

					  while (value) {
						  l.unshift(value & 0xFF);
						  value >>>= 8;
					  }

					  Array.prototype.push.apply(r, l);

					  return i;
				  },
				  toUTF8  = (value, r, i) => {
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
						  )
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
				  },
				  toUTF16 = (value, r, i, m) => {
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
				  },
				  toUTF32 = (value, r, i, m) => {
					  let l = [];

					  i = toBasic(value, l, i);
					  l = toFill(l, 4);

					  if (!m) l.reverse();

					  Array.prototype.push.apply(r, l);

					  return i;
				  };

			let encoding, len,
				buf, str;

			switch (typeof (opt)) {
				case "object":
					if (opt) {
						buf = opt.buf;
						encoding = opt.encoding;
						len = opt.len;
						str = opt.str;
					}
					break;
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
			encoding = (encoding + "").toUpperCase();
			buf = jShow.mode == jShow.MODE.Node && buf === true;
			str = !buf && str === true;
			if (!jShow.has(len, [1, 2, 4, 8])) len = 1;

			value = String(value);
			switch (encoding) {
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

			for (let i = 0; i < value.length;) i = func(value, result, i, be);

			if (buf) return Buffer.from(result);

			result = toArray(toFill(result, len, be), len);

			if (str) {
				func = [];
				len *= 2;
				for (let i = 0, d; i < result.length; i++) {
					d = result[i].toString(16).toUpperCase();
					while (d.length < len) d = "0" + d;
					func.push(d);
				}

				result = func;
			}

			return result;
		}
	};

	return api;
}, {module: module, exports: this}, ["String", "RegExp"], "Conver");