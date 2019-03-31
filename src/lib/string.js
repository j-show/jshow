/**
 * ==========================================
 * Name:           String
 * Author:         jShow
 * CreTime:        2014-11-20
 * Description:    字符串
 * Log
 * 2015-06-08    优化模块结构
 * ==========================================
 */
jShow.define(function (module, exports, require) {
	"use strict";

	const ULETTER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
		  LLETTER = "abcdefghijklmnopqrstuvwxyz",
		  NUMBER  = "0123456789",
		  SYMBOL  = "!@#$%^&*()",
		  ULL     = ULETTER + LLETTER,
		  ULN     = ULETTER + NUMBER,
		  LLN     = LLETTER + NUMBER,
		  ULLN    = ULETTER + LLETTER + NUMBER,
		  ULLNS   = ULETTER + LLETTER + NUMBER + SYMBOL;

	let api;

	api = {
		ULETTER: ULETTER,
		LLETTER: LLETTER,
		NUMBER:  NUMBER,
		SYMBOL:  SYMBOL,
		ULL:     ULL,
		ULN:     ULN,
		LLN:     LLN,
		ULLN:    ULLN,
		ULLNS:   ULLNS,
		/**
		 * 截取文字
		 *
		 * @public
		 * @param {string} value
		 * @param {number|object} [opt]
		 *    @param {number} [opt.start=0] 开始字符数，0开始
		 *    @param {number} [opt.len=value.length] 截取长度
		 * @returns {string}
		 */
		Mid:     (value, opt) => {
			let start, len;

			switch (typeof(opt)) {
				case "object":
					if (opt) {
						start = opt.start;
						len = opt.len;
					}
					break;
				case "number":
					start = opt;
					break;
			}
			value = String(value || "");
			start = parseInt(jShow.isNumber(start) ? (start < 0 ? value.length : 0) + start : 0);
			len = parseInt(jShow.isNumber(len) && len > 0 ? len : value.length) + start;

			return value.substring(start, Math.min(len, value.length));
		},
		/**
		 * 左截
		 *
		 * @public
		 * @param {string} value
		 * @param {number} len 截取长度
		 * @returns {string}
		 */
		Left:    (value, len) => api.Mid(value, {len: len}),
		/**
		 * 右截
		 *
		 * @public
		 * @param {string} value
		 * @param {number} len 截取长度
		 * @returns {string}
		 */
		Right:   (value, len) => api.Mid(value, {start: 0 - len}),
		/**
		 * 两端过滤
		 *
		 * @public
		 * @param {string} value
		 * @param {Array|string|number|object} [opt]
		 *    @param {Array|string} [opt.char] 过滤内容，默认过滤空格
		 *    @param {number} [opt.mode=0] 过滤模式，0=两端，1=左，2=右
		 * @returns {string}
		 */
		Trim:    (value, opt) => {
			let char, mode,
				rxp;

			switch (jShow.type(opt, true)) {
				case "object":
					if (opt) {
						char = opt.char;
						mode = opt.mode;
					}
					break;
				case "string":
				case "array":
					char = opt;
					break;
				case "number":
					mode = opt;
					break;
			}
			value = String(value || "");

			switch (jShow.type(char, true)) {
				default:
					rxp = "(\\s+)";
					break;
				case "string":
					if (char.length == 0) return value;
					char = [char];
				case "array":
					if (char.length == 0) return value;

					rxp = "(" + jShow.RegExp.Filter(char, false) + ")";
					break;
			}

			switch (mode) {
				case 1:
					rxp = "^" + rxp;
					break;
				case 2:
					rxp = rxp + "$";
					break;
				default:
					rxp = "^" + rxp + "|" + rxp + "$";
					break;
			}

			return value.replace(new RegExp(rxp, "g"), "");
		},
		/**
		 * 左端过滤
		 *
		 * @public
		 * @param {string} value
		 * @param {Array|string} char 过滤内容，默认过滤空格
		 * @returns {string}
		 */
		LTrim:   (value, char) => api.Trim(value, {char: char, mode: 1}),
		/**
		 * 右端过滤
		 *
		 * @public
		 * @param {string} value
		 * @param {Array|string} char 过滤内容，默认过滤空格
		 * @returns {string}
		 */
		RTrim:   (value, char) => api.Trim(value, {char: char, mode: 2}),
		/**
		 * 字符串格式化
		 *
		 * @public
		 * @param {string} value 格式规则
		 * @param {*} param 格式内容
		 * @returns {string}
		 */
		Format:  function (value) {
			if (!(value = String(value || "")) || arguments.length < 2) return value;

			let param = [];
			for (let i = 1; i < arguments.length; i++) param.push(arguments[i]);
			if (param.length == 1 && !jShow.isSimple(param[0])) param = param[0];

			jShow.each(param, (d, k, t) => {
				switch (t) {
					case "array":
						value = api.Format(value, d);
						break;
					case "object":
						value = d.reg && typeof(d.text) == "string" ? value.replace(new RegExp(d.reg, "g"), d.text) : api.Format(value, d);
						break;
					case "null":
					case "undefined":
						d = "";
					default:
						value = value.replace(new RegExp("\{(" + k + ")\}", "g"), d);
						break;
				}
			}, true);

			return value;
		},
		/**
		 * 过滤敏感字符，返回字符串
		 *
		 * @public
		 * @param {string} value
		 * @param {Array|object|string} param 过滤内容
		 * @returns {string}
		 */
		Filter:  function (value) {
			if (!(value = String(value || ""))) return value;

			let param = [];
			for (let i = 1; i < arguments.length; i++) param.push(arguments[i]);
			if (!param.length) param = ["\'", "\"", "<", ">"];

			jShow.each(param, (d, k, t) => {
				switch (t) {
					case "string":
						value = value.replace(jShow.RegExp.Filter(d), "");
						break;
					case "array":
						(d = [].concat(d)).unshift(value);
						value = api.Filter.apply(this, d);
						break;
					case "object":
						if (d.reg && typeof (d.text) == "string") value = value.replace(new RegExp(d.reg, "g"), d.text);
						break;
				}
			}, true);

			return value;
		},
		/**
		 * 字符串长度
		 *
		 * @public
		 * @param {string} value  {String}
		 * @param {boolean} [chs=true] 是否识别中文为2字符
		 * @returns {number}
		 */
		Length:  (value, chs) => {
			let result = 0;

			if (!jShow.isString(value)) return result;

			if (chs !== false) {
				chs = value.match(/[^ -~]/g);
				result = chs ? chs.length : 0;
			}

			return value.length + result;
		},
		/**
		 * 扩展indexOf，无substr为识别是否包含中文，返回特征字符所在位置或首个中文所在位置
		 *
		 * @public
		 * @param {string} value
		 * @param {string|number|object} [opt]
		 *    @param {string} [opt.sub] 检索内容
		 *    @param {number} [opt.start=0] 检索起始点
		 *    @param {number} [opt.len] 检索长度
		 * @returns {number} 不存在返回-1
		 */
		IndexOf: (value, opt) => {
			let sub, start, len;

			switch (typeof(opt)) {
				case "object":
					if (opt) {
						sub = opt.sub;
						start = opt.start;
						len = opt.len;
					}
					break;
				case "string":
					sub = opt;
					break;
				case "number":
					len = opt;
					break;
			}
			value = String(value || "");
			start = parseInt(jShow.isNumber(start) ? (start < 0 ? value.length : 0) + start : 0);

			if (jShow.isString(sub, true)) {
				len = api.Mid(value, {start: start, len: len}).indexOf(sub);

				if (len >= 0) return len + start;
			}
			else {
				len = parseInt(jShow.isNumber(len) && len > 0 ? len : value.length * 2);

				for (let i = 0, n = 0, l = start + len, rxp = /[^ -~]/; i < value.length; i++, n++) {
					if (rxp.test(value[i])) {
						if (n >= start || n < l) return i;
						else n++;
					}
				}
			}

			return -1;
		},
		/**
		 * 扩展substr，返回字符串，中文占2字，遇半字时截取整字
		 *
		 * @public
		 * @param {string} value
		 * @param {number|object} [opt]
		 *    @param {number} [opt.start] 检索起始点
		 *    @param {number} [opt.len] 检索长度
		 * @returns {string}
		 */
		SubStr:  (value, opt) => {
			let result = "",
				start, len;

			switch (typeof(opt)) {
				case "object":
					if (opt) {
						start = opt.start;
						len = opt.len;
					}
					break;
				case "number":
					len = opt;
					break;
			}
			start = parseInt(jShow.isNumber(start) ? (start < 0 ? value.length : 0) + start : 0);
			len = parseInt(jShow.isNumber(len) && len > 0 ? len : value.length * 2);

			for (let i = 0, n = 0, l = start + len, rxp = /[^ -~]/, d; i < value.length && n < l; i++, n++) {
				d = value[i];

				if (n >= start && n < l) result += d;

				if (rxp.test(d)) n++;
			}

			return result;
		},
		/**
		 * 添加后缀，返回内容长度<=len
		 *
		 * @public
		 * @param {string} value
		 * @param {number|string|boolean|object} opt 参数
		 *    @param {number} [opt.start=0] 检索起始点
		 *    @param {number} [opt.len=50] 检索长度
		 *    @param {string} [opt.fix=...] 当长度超过要求时，尾部补充
		 *    @param {boolean} [opt.chs=true] 是否识别中文为2字符
		 * @returns {string}
		 */
		SubFix:  (value, opt) => {
			let result = "",
				len, fix, start, chs;

			switch (typeof(opt)) {
				case "object":
					if (opt) {
						start = opt.start;
						len = opt.len;
						fix = opt.fix;
						chs = opt.chs;
					}
					break;
				case "number":
					len = opt;
					break;
				case "string":
					fix = opt;
					break;
				case "boolean":
					chs = opt;
					break;
			}
			start = parseInt(jShow.isNumber(start) ? (start < 0 ? value.length : 0) + start : 0);
			len = parseInt(jShow.isNumber(len) && len > 0 ? len : 50);
			fix = jShow.isString(fix, true) ? fix : "...";
			chs = chs !== false;

			for (let i = 0, n = 0, l = start + len, rxp = /[^ -~]/, d; i < value.length && n < l; i++, n++) {
				d = value[i];

				if (n >= start && n < l) result += d;
				if (chs && rxp.test(d)) n++;
			}

			return result == value ? result : (result.substr(0, result.length - fix.length) + fix);
		},
		/**
		 * 随机字符
		 *
		 * @public
		 * @param {number|boolean|object} opt 参数
		 *    @param {string|Array} [opt.template] 创建模板
		 *    @param {number} [opt.len=5] 随机字符个数
		 *    @param {boolean} [opt.repeat=false] 是否允许重复
		 * @returns {String}
		 */
		Random:  opt => {
			let rmd    = tpl => {
					let r = Math.ceil(Math.random() * tpl.length);

					if (r < 0) r = 0;
					else if (r >= tpl.length) r = tpl.length - 1;

					return r;
				},
				result = "",
				template, len, repeat;

			switch (jShow.type(opt, true)) {
				case "object":
					if (opt) {
						template = opt.template;
						len = opt.len;
						repeat = opt.repeat;
					}
					break;
				case "string":
				case "array":
					template = opt;
					break;
				case "number":
					len = opt;
					break;
				case "boolean":
					repeat = opt;
					break;
			}
			len = parseInt(jShow.isNumber(len) && len > 0 ? len : 5);
			repeat = repeat === true;
			template = jShow.isString(template) ? template.split("") : template;
			if (!jShow.isArray(template)) template = ULLNS.split("");

			for (let r; len; len--) {
				r = rmd(template);
				result += template[r];
				if (!repeat) template.splice(r, 1);
			}

			return result;
		}
	};

	return api;
}, {module: module, exports: this}, ["RegExp"], "String");