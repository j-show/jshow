"use strict";
(function (global, factory) {
	if (global.jShow) return;

	factory.call(
		{ver: "@version"},
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

"@Code";
"@Loading";
});