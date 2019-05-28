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
		ver: "@version",
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

	"@Code";
	"@Loading";
});