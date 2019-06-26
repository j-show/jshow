/**
 * ==========================================
 * Name:           String
 * Author:         jShow
 * CreTime:        2014-11-20
 * Description:    String function
 * Log
 * 2015-06-08    Optimize module structure
 * 2019-05-27    Format Code to jShow Style Guide
 * ==========================================
 */
define("String", ["RegExp"], function (require, module, REGEXP) {
	"use strict";

	const $ = jShow;

	const ULETTER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const LLETTER = "abcdefghijklmnopqrstuvwxyz";
	const NUMBER  = "0123456789";
	const SYMBOL  = "!@#$%^&*()";

	const api = {
		ULETTER: ULETTER,
		LLETTER: LLETTER,
		NUMBER:  NUMBER,
		SYMBOL:  SYMBOL,
		ULL:     `${ULETTER}${LLETTER}`,
		ULN:     `${ULETTER}${NUMBER}`,
		LLN:     `${LLETTER}${NUMBER}`,
		ULLN:    `${ULETTER}${LLETTER}${NUMBER}`,
		ULLNS:   `${ULETTER}${LLETTER}${NUMBER}${SYMBOL}`,
		/**
		 * Gets part of string
		 *
		 * @param {string} value
		 * @param {number|object} [opt]
		 *    @param {number} [opt.start=0] <start position>
		 *    @param {number} [opt.len=value.length] <get length>
		 * @returns {string}
		 */
		Mid (value, opt) {
			let data = String(value || "");

			let {
					start = 0,
					len   = data.length
				} = opt;

			if (typeof(opt) === "number") start = opt;

			if (!$.isNumber(start)) start = 0;
			if (!$.isNumber(len, {min: 0})) len = data.length;

			if (start < 0) start += data.length;
			if (start < 0) start = 0;

			len += start;

			return data.substring(start, Math.min(len, data.length));
		},
		/**
		 * Gets part of string from left
		 *
		 * @param {string} value
		 * @param {number} len <get length>
		 * @returns {string}
		 */
		Left (value, len) {
			return api.Mid(value, {len});
		},
		/**
		 * Gets part of string from right
		 *
		 * @param {string} value
		 * @param {number} len <get length>
		 * @returns {string}
		 */
		Right (value, len) {
			let start = $.isNumber(len, {min: 0}) ? -len : 0;

			return api.Mid(value, {start});
		},
		/**
		 * Trim of string
		 *
		 * @param {string} value
		 * @param {Array|string|number|object} [opt]
		 *    @param {Array|string} [opt.char] <trim char, default blank space>
		 *    @param {number} [opt.mode=0] <filter mode>
		 * @returns {string}
		 */
		Trim (value, opt = 0) {
			let data = String(value || "");

			let {
					char,
					mode = 0
				} = opt;

			switch ($.type(opt, true)) {
				case "string":
				case "array":
					char = opt;
					break;
				case "number":
					mode = opt;
					break;
			}

			let rxp;

			switch ($.type(char, true)) {
				default:
					rxp = "(\\s+)";
					break;
				case "string":
					if (char.length === 0) return data;

					char = [char];
				case "array":
					if (char.length === 0) return data;

					rxp = REGEXP.Filter(char, false);
					rxp = `(${rxp})`;
					break;
			}

			switch (mode) {
				default:
					rxp = `^${rxp}|${rxp}$`;
					break;
				case 1:
					rxp = `^${rxp}`;
					break;
				case 2:
					rxp = `${rxp}$`;
					break;
			}

			return data.replace(new RegExp(rxp, "g"), "");
		},
		/**
		 * Trim of string from left
		 *
		 * @param {string} value
		 * @param {Array|string} char <trim char, default blank space>
		 * @returns {string}
		 */
		LTrim (value, char) {
			return api.Trim(value, {char, mode: 1});
		},
		/**
		 * Trim of string from right
		 *
		 * @param {string} value
		 * @param {Array|string} char <trim char, default blank space>
		 * @returns {string}
		 */
		RTrim (value, char) {
			return api.Trim(value, {char, mode: 2});
		},
		/**
		 * Format of string by value
		 *
		 * @param {string} value <format rules>
		 * @param {*} param <fill value>
		 * @returns {string}
		 */
		Format (value, ...param) {
			let data = String(value || "");

			if (!data || param.length === 0) return data;

			if (param.length === 1 && $.isArray(param[0])) param = param[0];

			$.each(param, (d, k, t) => {
				switch (t) {
					case "array":
						data = api.Format(data, d);
						break;
					case "object":
						data = d.reg && typeof(d.text) === "string" ? data.replace(new RegExp(d.reg, "g"), d.text) : api.Format(data, d);
						break;
					case "null":
					case "undefined":
						d = "";
					default:
						data = data.replace(new RegExp(`\{(k)\}`, "g"), d);
						break;
				}
			}, true);

			return data;
		},
		/**
		 * Filter of string
		 *
		 * @param {string} value
		 * @param {Array|object|string} param <filter code>
		 * @returns {string}
		 */
		Filter (value, ...param) {
			let data = String(value || "");

			if (!data) return data;

			if (param.length === 0) param = ["\'", "\"", "<", ">"];

			$.each(param, (d, k, t) => {
				switch (t) {
					case "string":
						data = data.replace(REGEXP.Filter(d), "");
						break;
					case "array":
						d = [].concat(d);
						d.unshift(data);

						data = api.Filter(...d);
						break;
					case "object":
						if (d.reg && typeof (d.text) === "string") data = data.replace(new RegExp(d.reg, "g"), d.text);
						break;
				}
			}, true);

			return data;
		},
		/**
		 * Get length of string
		 *
		 * @param {string} value  {String}
		 * @param {boolean} [chs=true] <is parse chinese as 2 word>
		 * @returns {number}
		 */
		Length (value, chs = true) {
			let result = 0;

			if (!$.isString(value)) return result;

			if (chs !== false) {
				chs    = value.match(/[^ -~]/g);
				result = chs ? chs.length : 0;
			}

			return value.length + result;
		},
		/**
		 * Extension String.indexOf()
		 *
		 * @FIX: logic is not strict
		 *
		 * @param {string} value
		 * @param {string|number|object} [opt]
		 *    @param {string} [opt.sub] <search value>
		 *    @param {number} [opt.start=0] <search start position>
		 *    @param {number} [opt.len] <search length>
		 * @returns {number}
		 */
		IndexOf (value, opt) {
			let {
					sub,
					start = 0,
					len
				} = opt;

			switch (typeof(opt)) {
				case "string":
					sub = opt;
					break;
				case "number":
					len = opt;
					break;
			}

			let data = String(value || "");

			start = parseInt($.isNumber(start) ? (start < 0 ? data.length : 0) + start : 0);

			if ($.isString(sub, true)) {
				len = api.Mid(data, {start: start, len: len}).indexOf(sub);

				if (len >= 0) return len + start;
			}
			else {
				len = parseInt($.isNumber(len) && len > 0 ? len : data.length * 2);

				for (let i = 0, n = 0, l = start + len, rxp = /[^ -~]/; i < data.length; i++, n++) {
					if (rxp.test(data[i])) {
						if (n >= start || n < l) return i;
						else n += 1;
					}
				}
			}

			return -1;
		},
		/**
		 * Extension String.substr()
		 *
		 * @param {string} value
		 * @param {number|object} [opt]
		 *    @param {number} [opt.start] <search start position>
		 *    @param {number} [opt.len=50] <search length>
		 *    @param {boolean} [opt.chs=true] <is parse chinese as 2 word>
		 * @returns {string}
		 */
		SubStr (value, opt) {
			let data = String(value || "");

			let {
					start = 0,
					len   = 50,
					chs   = true
				} = opt;

			switch (typeof(opt)) {
				case "number":
					len = opt;
					break;
			}

			if (!$.isNumber(start)) start = 0;
			if (!$.isNumber(len, {min: 0})) len = 50;
			chs = chs === true;

			if (start < 0) start += data.length;
			if (start < 0) start = 0;

			len += start;

			let rxp    = /[^ -~]/;
			let num    = 0;
			let result = [];

			data = [...data];
			data.forEach(d => {
				if (num >= start && num < len) result.push(d);
				num += 1;
				if (chs && rxp.test(d)) num += 1;
			});

			return result.join("");
		},
		/**
		 * Gets part of string and add suffix
		 *
		 * @param {string} value
		 * @param {number|string|boolean|object} opt
		 *    @param {number} [opt.len=50] <get length>
		 *    @param {string} [opt.fix=...] <suffix code>
		 *    @param {boolean} [opt.chs=true] <is parse chinese as 2 word>
		 * @returns {string}
		 */
		SubFix (value, opt) {
			let data = String(value || "");

			let {
					start = 0,
					len   = 50,
					fix   = "...",
					chs   = true
				} = opt;

			switch (typeof(opt)) {
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

			if (!$.isString(fix, true)) fix = "...";

			let result = api.SubStr(data, {start, len, chs});

			if (result === data || fix.length === 0) return result;

			let rxp = /[^ -~]/;
			let num = 0;

			fix = [...fix];
			fix.forEach(d => {
				num += 1;
				if (chs && rxp.test(d)) num += 1;
			});

			result = [...result];

			result = result.reverse().filter(d => {
				if (num < 1) return true;
				num -= 1;
				if (chs && rxp.test(d)) num -= 1;
			});

			return `${result.reverse().join("")}${fix.join("")}`;
		},
		/**
		 * Get random of string
		 *
		 * @param {number|boolean|object} opt
		 *    @param {string|Array} [opt.template] <string template>
		 *    @param {number} [opt.len=5] <return string length>
		 *    @param {boolean} [opt.repeat=false] <is repeat of string>
		 * @returns {String}
		 */
		Random (opt) {
			let {
					template,
					tpl,
					len    = 5,
					repeat = false
				} = opt;

			switch ($.type(opt, true)) {
				case "boolean":
					repeat = opt;
					break;
				case "number":
					len = opt;
					break;
				case "string":
					template = [...opt];
					break;
				case "array":
					template = opt;
					break;
			}

			if (!$.isArray(template)) {
				if (typeof(tpl) === "string") tpl = [...tpl];
				template = tpl;
			}
			if (!$.isArray(template)) template = api.ULLNS.split("");
			if (!$.isNumber(len, {min: 0})) len = 5;
			repeat = repeat === true;

			const rmd = tpl => {
				let r = Math.ceil(Math.random() * tpl.length);

				if (r < 0) r = 0;
				else if (r >= tpl.length) r = tpl.length - 1;

				return tpl[r];
			};

			let result = [];

			for (let r; len >= 0; len--) {
				r = rmd(template);
				if (repeat || result.indexOf(r) < 0) {
					result.push(d);
					len -= 1;
				}
			}

			return result.join("");
		}
	};

	return api;
}, module);