/**
 * ==========================================
 * Name:           RegExp
 * Author:         jShow
 * CreTime:        2014-11-20
 * Description:    Regexp oper
 * Log
 * 2015-06-09    Optimize module structure
 * 2019-05-25    Format Code to jShow Style Guide
 * ==========================================
 */
define("RegExp", [], function (require, module) {
	"use strict";

	const $ = jShow;

	/**
	 * @namespace RegExp
	 */
	const api = {
		/**
		 * Regexp filter
		 *
		 * @param {string|Array} value
		 * @param {object} [opt]
		 *    @param {boolean} [opt.single=false] <is value of single>
		 *    @param {boolean} [opt.obj=true] <is return regexp object>
		 *    @param {string} [opt.type=g] <regexp mode>
		 * @returns {string}
		 */
		Filter (value, opt) {
			let {
					single = false,
					obj    = true,
					type   = "g"
				} = opt;

			switch (typeof(opt)) {
				case "boolean":
					obj = opt;
					break;
				case "string":
					type = opt;
					obj  = true;
					break;
			}

			let data = value;

			type = obj && $.has(type, ["g", "i"]) ? type : "g";

			if (single !== true || $.isString(data)) {
				data = data.split("");

				data = data.map(d => {
					switch (d) {
						default:
							return d;
						case "\\":
							return "\\\\";
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
							return `\\${d}`;
					}
				}).join("|");
			}

			return obj === true ? new RegExp(data, type) : data;
		},
		/**
		 * Get real value of html
		 *
		 * @param {string} value
		 * @param {string} [tag]
		 *    @param tag=* <filter all tag>
		 *    @param tag=title <filter title tag>
		 *    @param tag=a|href <filter a tag>
		 *    @param tag=img|image <filter img tag>
		 *    @param tag=video <filter video tag>
		 *    @param tag=audio <filter audio tag>
		 *    @param tag=link|css|icon <filter link tag>
		 *    @param tag=script|js <filter script tag>
		 * @returns {string|Array}
		 */
		Html (value, tag) {
			let data = String(value);

			switch (String(tag)) {
				default:
					return data;
				case "*":
					return data.replace(/<[^>]+>/g, "").replace(/[\f\n\r\t\v]/g, "");
				case "title":
					return this.Title(data);
				case "a":
				case "href":
					return this.Href(data);
				case "img":
				case "image":
					return this.Image(data);
				case "video":
					return this.Video(data);
				case "audio":
					return this.Audio(data);
				case "link":
				case "css":
					return this.Link(data, "stylesheet");
				case "icon":
					return this.Link(data, "icon");
				case "script":
				case "js":
					return this.Script(data);
			}
		},
		/**
		 * Get value in title tag
		 *
		 * @param {string} value
		 * @returns {string}
		 */
		Title (value) {
			let data = /<title>([\S\s\t]*?)<\/title>/.exec(String(value));

			return data != null ? data[1] : "";
		},
		/**
		 * Get value in a tag
		 *
		 * @param {string} value
		 * @returns {Array} {value: <href value>, href: <href url>, title: <tag>}
		 */
		Href (value) {
			const rxp = [
				/<a([^>]*)>(.*?)<\/a>/g,
				/href=(?:(?:'([^']+)')|(?:"([^"]+)"))/i,
				/title=(?:(?:'([^']+)')|(?:"([^"]+)"))/i
			];

			let val1,
				val2,
				val3;

			let data   = String(value);
			let result = [];

			while ((val1 = rxp[0].exec(data)) != null) {
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
		 * Get value in img tag
		 *
		 * @param {string} value
		 * @returns {Array} {href: <href url>, title: <tag>}
		 */
		Image (value) {
			const rxp = [
				/<img([^>]*)>/g,
				/href=(?:(?:'([^']+)')|(?:"([^"]+)"))/i,
				/title=(?:(?:'([^']+)')|(?:"([^"]+)"))/i
			];

			let val1,
				val2,
				val3;

			let data   = String(value);
			let result = [];

			while ((val1 = rxp[0].exec(data)) != null) {
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
		 * Get value in video tag
		 *
		 * @param {string} value
		 * @returns {Array} {src: <href url>, type: <MIME type>}
		 */
		Video (value) {
			const rxp = [
				/<video([^>]*)>(.*?)<\/video>/g,
				/<source([^>]*)>/i,
				/src=(?:(?:'([^']+)')|(?:"([^"]+)"))/i,
				/type=(?:(?:'([^']+)')|(?:"([^"]+)"))/i
			];

			let val1,
				val2,
				val3;

			let data   = String(value);
			let result = [];

			while ((val1 = rxp[0].exec(data)) != null) {
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
		 * Get value in audio tag
		 *
		 * @param {string} value
		 * @returns {Array} {src: <href url>, type: <MIME type>}
		 */
		Audio (value) {
			const rxp = [
				/<audio([^>]*)>(.*?)<\/audio>/g,
				/<source([^>]*)>/i,
				/src=(?:(?:'([^']+)')|(?:"([^"]+)"))/i,
				/type=(?:(?:'([^']+)')|(?:"([^"]+)"))/i
			];

			let val1,
				val2,
				val3;

			let data   = String(value);
			let result = [];

			while ((val1 = rxp[0].exec(data)) != null) {
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
		 * Get value in link tag
		 *
		 * @param {string} value
		 * @param {string} [type=*] <filter tag type>
		 *     css  <.css/.scss/.sass file>
		 *     icon <.ico file>
		 * @returns {Array} {src: <href url>, type: <MIME type>}
		 */
		Link (value, type) {
			const rxp = [
				/<link([^>]*)>/g,
				/href=(?:(?:'([^']+)')|(?:"([^"]+)"))/i,
				/rel=(?:(?:'([^']+)')|(?:"([^"]+)"))/i
			];

			let val1,
				val2,
				val3;

			let data   = String(value);
			let result = [];

			while ((val1 = rxp[0].exec(data)) != null) {
				val2 = val1[1].match(rxp[1]);
				val3 = val1[1].match(rxp[2]);
				val3 = val3 ? (val3[1] || val3[2]) : "";

				if (type !== val3) continue;

				result.push({
					url:  val2 ? (val2[1] || val2[2]) : "",
					type: type
				});
			}

			return result;
		},
		CSS (value) {
			return this.Link(value, "stylesheet");
		},
		ICON (value) {
			return this.Link(value, "icon");
		},
		Script (value) {
			const rxp = [
				/<script([^>]*)>(.*?)<\/script>/g,
				/src=(?:(?:'([^']+)')|(?:"([^"]+)"))/i,
				/async(?:=(?:"async")|(?:('async')))?/i
			];

			let val1,
				val2;

			let data   = String(value);
			let result = [];

			while ((val1 = rxp[0].exec(data)) != null) {
				val2 = val1[1].match(rxp[1]);

				result.push({
					url:   val2 ? (val2[1] || val2[2]) : "",
					async: rxp[2].test(val1[1])
				});
			}

			return result;
		},
		JS (value) {
			return this.Script(value);
		}
	};

	return api;
}, module);