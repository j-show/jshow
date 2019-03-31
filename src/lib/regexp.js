/**
 * ==========================================
 * Name:           RegExp
 * Author:         jShow
 * CreTime:        2014-11-20
 * Description:    正则处理
 * Log
 * 2015-06-09    优化模块结构
 * ==========================================
 */
jShow.define(function (module, exports, require) {
	"use strict";
	let api;

	/**
	 * 正则处理扩展
	 *
	 * @namespace RegExp
	 */
	api = {
		/**
		 * 正则敏感过滤
		 *
		 * @param {string|Array} value
		 * @param {object} [opt]
		 *    @param {boolean} [opt.single=false] 是否作为单条处理
		 *    @param {boolean} [opt.obj=true] 是否返回RegExp对象
		 *    @param {string} [opt.type=g] RegExp对象类型
		 * @returns {string}
		 */
		Filter: (value, opt) => {
			let result = "",
				single, obj, type;

			switch (typeof(opt)) {
				case "object":
					if (opt) {
						single = opt.single;
						obj = opt.obj;
						type = opt.type;
					}
					break;
				case "boolean":
					obj = opt;
					break;
				case "string":
					type = opt;
					obj = true;
					break;
			}
			single = single === true;
			obj = obj !== false;
			type = obj && jShow.has(type, ["g", "i"]) ? type : "g";

			if (!jShow.isString(value)) single = false;
			else {
				result = value;
				value = value.split("");
			}

			if (!single) {
				result = "";

				jShow.each(value, (d, i, s) => {
					switch (d) {
						case "\\":
							s = "\\\\";
							break;
						case "(":
						case ")":
						case "{":
						case "}":
						case "[":
						case "]":
						case "-":
						case "|":
						case "+":
						case "*":
						case "?":
						case "^":
						case "$":
						case ".":
							s = "\\" + value[i];
							break;
						default:
							s = value[i];
					}

					result += i + 1 < value.length ? s + "|" : s;
				}, {force: true});
			}

			return obj ? new RegExp(result, type) : result;
		},
		/**
		 * 获取html中内容
		 *
		 * @param {string} value
		 * @param {string} [tag]
		 *    @param tag=* 过滤全部标签，并去除所有不可见字符（空格除外）
		 *    @param tag=title 获取标题
		 *    @param tag=a|href 获取所有A标签
		 *    @param tag=img|image 获取所有img标签
		 *    @param tag=video 获取所有video标签
		 *    @param tag=audio 获取所有audio标签
		 *    @param tag=link|css|icon 获取所有link标签
		 *    @param tag=script|js 获取所有脚本标签
		 * @returns {string|Array}
		 */
		Html:   (value, tag) => {
			switch (String(tag)) {
				default:
					return String(value);
				case "*":
					return String(value).replace(/<[^>]+>/g, "").replace(/[\f\n\r\t\v]/g, "");
				case "title":
					return this.Title(value);
				case "a":
				case "href":
					return this.Href(value);
				case "img":
				case "image":
					return this.Image(value);
				case "video":
					return this.Video(value);
				case "audio":
					return this.Audio(value);
				case "link":
				case "css":
					return this.Link(value, "stylesheet");
				case "icon":
					return this.Link(value, "icon");
				case "script":
				case "js":
					return this.Script(value);
			}
		},
		/**
		 * 获取html中标题
		 *
		 * @param {string} value
		 * @returns {string}
		 */
		Title:  value => {
			let result = /<title>([\S\s\t]*?)<\/title>/.exec(String(value));

			return result != null ? result[1] : "";
		},
		/**
		 * 获取html中的链接地址
		 *
		 * @param {string} value
		 * @returns {Array} {value: 链接内容, href: 链接地址, title: 标签}
		 */
		Href:   value => {
			let result = [],
				rxp    = [
					/<a([^>]*)>(.*?)<\/a>/g,
					/href=(?:(?:'([^']+)')|(?:"([^"]+)"))/i,
					/title=(?:(?:'([^']+)')|(?:"([^"]+)"))/i
				],
				val1, val2, val3;

			value = String(value);
			while ((val1 = rxp[0].exec(value)) != null) {
				val2 = val1[1].match(rxp[1]);
				val3 = val1[1].match(rxp[2]);

				result.push({
					value: this.Html(val1[2], "*"),
					url:   val2 ? (val2[1] || val2[2]) : "",
					title: val3 ? (val3[1] || val3[2]) : ""
				});
			}

			return result;
		},
		/**
		 * 获取html中的图片地址
		 *
		 * @param {string} value
		 * @returns {Array} {href: 链接地址, title: 标签}
		 */
		Image:  value => {
			let result = [],
				rxp    = [
					/<img([^>]*)>/g,
					/href=(?:(?:'([^']+)')|(?:"([^"]+)"))/i,
					/title=(?:(?:'([^']+)')|(?:"([^"]+)"))/i
				],
				val1, val2, val3;

			value = String(value);
			while ((val1 = rxp[0].exec(value)) != null) {
				val2 = val1[1].match(rxp[1]);
				val3 = val1[1].match(rxp[2]);

				result.push({
					url:   val2 ? (val2[1] || val2[2]) : "",
					title: val3 ? (val3[1] || val3[2]) : ""
				});
			}

			return result;
		},
		/**
		 * 获取html中的视频地址
		 *
		 * @param {string} value
		 * @returns {Array} {src: 链接地址, type: MIME类型}
		 */
		Video:  value => {
			let result = [],
				rxp    = [
					/<video([^>]*)>(.*?)<\/video>/g,
					/<source([^>]*)>/i,
					/src=(?:(?:'([^']+)')|(?:"([^"]+)"))/i,
					/type=(?:(?:'([^']+)')|(?:"([^"]+)"))/i
				],
				val1, val2, val3;

			value = String(value);
			while ((val1 = rxp[0].exec(value)) != null) {
				if (val1[2].test(rxp[1])) val1 = rxp[1].exec(val1[2]);

				val2 = val1[1].match(rxp[2]);
				val3 = val1[1].match(rxp[3]);

				result.push({
					url:  val2 ? (val2[1] || val2[2]) : "",
					type: val3 ? (val3[1] || val3[2]) : ""
				});
			}

			return result;
		},
		/**
		 * 获取html中的音频地址
		 *
		 * @param {string} value
		 * @returns {Array} {src: 链接地址, type: MIME类型}
		 */
		Audio:  value => {
			let result = [],
				rxp    = [
					/<audio([^>]*)>(.*?)<\/audio>/g,
					/<source([^>]*)>/i,
					/src=(?:(?:'([^']+)')|(?:"([^"]+)"))/i,
					/type=(?:(?:'([^']+)')|(?:"([^"]+)"))/i
				],
				val1, val2, val3;

			value = String(value);
			while ((val1 = rxp[0].exec(value)) != null) {
				if (val1[2].test(rxp[1])) val1 = rxp[1].exec(val1[2]);

				val2 = val1[1].match(rxp[2]);
				val3 = val1[1].match(rxp[3]);

				result.push({
					url:  val2 ? (val2[1] || val2[2]) : "",
					type: val3 ? (val3[1] || val3[2]) : ""
				});
			}

			return result;
		},
		Link:   (value, type) => {
			let result = [],
				rxp    = [
					/<link([^>]*)>/g,
					/href=(?:(?:'([^']+)')|(?:"([^"]+)"))/i,
					/rel=(?:(?:'([^']+)')|(?:"([^"]+)"))/i
				],
				val1, val2, val3;

			value = String(value);
			while ((val1 = rxp[0].exec(value)) != null) {
				val2 = val1[1].match(rxp[1]);
				val3 = val1[1].match(rxp[2]);
				val3 = val3 ? (val3[1] || val3[2]) : "";

				if (type !== val3) continue;

				result.push({
					url:  val2 ? (val2[1] || val2[2]) : "",
					type: type,
				});
			}

			return result;
		},
		CSS:    value => this.Link(value, "stylesheet"),
		ICON:   value => this.Link(value, "icon"),
		Script: value => {
			let result = [],
				rxp    = [
					/<script([^>]*)>(.*?)<\/script>/g,
					/src=(?:(?:'([^']+)')|(?:"([^"]+)"))/i,
					/async(?:=(?:"async")|(?:('async')))?/i
				],
				val1, val2;

			value = String(value);
			while ((val1 = rxp[0].exec(value)) != null) {
				val2 = val1[1].match(rxp[1]);

				result.push({
					url:   val2 ? (val2[1] || val2[2]) : "",
					async: rxp[2].test(val1[1]),
				});
			}

			return result;
		},
		JS:     value => this.Script(value)
	};

	return api;
}, {module: module, exports: this}, [], "RegExp");