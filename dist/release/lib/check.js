/**
 * ==========================================
 * Name:           Check
 * Author:         jShow
 * CreTime:        2014-11-20
 * Description:    Check Function
 * Log
 * 2015-06-08    Optimize module structure
 * 2019-05-25    Format Code to jShow Style Guide
 * ==========================================
 */
define("Check", [], function (require, module) {
	"use strict";

	const $ = jShow;

	/**
	 * @namespace Check
	 */
	const api = {
		/**
		 * Check obj with Regexp
		 *
		 * @public
		 * @param {string|jquery} obj <target>
		 * @param {string|regexp} rxp <regexp string>
		 * @param {string} def <default regexp string>
		 * @returns {boolean}
		 */
		Check (obj, rxp, def) {
			let val  = obj;
			let jq   = $.isjQuery(obj);
			let _rxp = rxp;

			if (jq) {
				_rxp = typeof(obj.attr("chk")) !== "undefined" ? obj.attr("chk") : _rxp;
				val  = obj.val();
			}

			if (!val) return false;

			switch ($.type(_rxp, true)) {
				case "regexp":
					break;
				case "string":
					if (_rxp.length > 1) {
						_rxp = new RegExp(_rxp, "i");
						break;
					}
				default:
					_rxp = new RegExp($.isString(def) ? def : "^\\S{0,}$", "i");
					break;
			}

			if (_rxp.test(val)) return true;

			if (jq) obj.focus();

			return false;
		},
		/**
		 * Check Select Node
		 *
		 * @param {jquery} obj <target, must jquery object>
		 * @param {string|regexp} rxp <regexp string>
		 * @returns {boolean}
		 */
		Select (obj, rxp) {
			return api.Check(obj, rxp, "\\S{1,}");
		},
		/**
		 * Check CheckBox Node
		 *
		 * @param {jquery} obj <target, must jquery object>
		 * @param {string|regexp} rxp <regexp string>
		 * @returns {boolean}
		 */
		CheckBox (obj, rxp) {
			return api.Check(obj, rxp, "\\S{1,}");
		},
		/**
		 * Check Input Node
		 *
		 * @param {string|jquery} obj <target>
		 * @param {number} [min=0] <min number allow by obj's value>
		 * @param {number} [max=1024] <max number allow by obj's value>
		 * @returns {boolean}
		 */
		Input (obj, min, max) {
			let _min = Number(min);
			let _max = Number(max);
			let _rxp = "\\S";

			if (isNaN(_min) || _min < 1) _min = "";
			if (isNaN(_max) || _max <= _min) _max = "";
			if (_min || _max) _rxp = `^${_rxp}{${_min},${_max}}$`;

			return api.Check(obj, _rxp);
		},
		/**
		 * Check Info
		 *
		 * @param {string|jquery} obj <target>
		 * @param {number} [min=0] <min number allow by obj's value>
		 * @param {number} [max=1024] <max number allow by obj's value>
		 * @returns {boolean}
		 */
		Info (obj, min, max) {
			let _min = Number(min);
			let _max = Number(max);
			let _rxp = "[\\S\\s]";

			if (isNaN(_min) || _min < 1) _min = "";
			if (isNaN(_max) || _max <= _min) _max = "";
			if (_min || _max) _rxp = `^${_rxp}{${_min},${_max}}$`;

			return api.Check(obj, _rxp);
		},
		/**
		 * Check UID
		 *
		 * @param {string|jquery} obj <target>
		 * @param {number} [min=6] <min number allow by obj's value>
		 * @param {number} [max=32] <max number allow by obj's value>
		 * @returns {boolean}
		 */
		UID (obj, min, max) {
			let _min = min;
			let _max = max;

			if (!$.isNumber(_min, {min: 2})) _min = 6;
			if (!$.isNumber(_max, {min: _min})) _max = 32;

			return api.Check(obj, `^[a-z]{1}[a-z0-9_]{${_min - 1},${_max - 1}}$`);
		},
		/**
		 * Check password
		 *
		 * @param {string|jquery} obj <target>
		 * @param {number} [min=6] <min number allow by obj's value>
		 * @param {number} [max=32] <max number allow by obj's value>
		 * @returns {boolean}
		 */
		PWD (obj, min, max) {
			let _min = min;
			let _max = max;

			if (!$.isNumber(_min, {min: 2})) _min = 6;
			if (!$.isNumber(_max, {min: _min})) _max = 32;

			return api.Check(obj, `^[a-z0-9~!@#$%^&*-_=\+]{${_min},${_max}}$`);
		},
		/**
		 * Check Name
		 *
		 * @WARN: chinese text is 2 word
		 *
		 * @param {string|jquery} obj <target>
		 * @param {number} [min=2] <min number allow by obj's value>
		 * @param {number} [max=6] <max number allow by obj's value>
		 * @param {boolean} [all=true] <is all check>
		 * @returns {boolean}
		 */
		Name (obj, min, max) {
			let _min = min;
			let _max = max;
			// let _rxp = "\u2E80-\u9FFF";
			let _rxp = "\u4e00-\u9fa5";

			if (!$.isNumber(_min, {min: 2})) _min = 2;
			if (!$.isNumber(_max, {min: _min})) _max = 6;

			_rxp = `^[a-z${_rxp}]{1}[a-z0-9_\-${_rxp}]{${_min - 1},${_max - 1}}$`;

			if (!api.Check(obj, _rxp)) return false;

			if ($.isjQuery(obj)) obj = obj.val();

			let _num = obj.match(/[^ -~]/g);
			_num     = (_num ? _num.length : 0) + obj.length;

			return _num <= _max;
		},
		/**
		 * Check Mail
		 *
		 * @param {string|jquery} obj <target>
		 * @returns {boolean}
		 */
		Mail (obj) {
			return api.Check(obj, "^[a-z0-9]{1}[\\w-]*(\\.[a-z0-9]{1}[\\w-]*)*@[a-z0-9]{1}[\\w-]*(\\.[a-z0-9]{1}[\\w-]*)*\\.[a-z0-9]+$");
		},
		/**
		 * Check GPS
		 *
		 * @param {string|jquery} obj <target>
		 * @returns {boolean}
		 */
		GPS (obj) {
			return api.Check(obj, "^([0-9]{1,})(([/\\s:-][0-9]{1,}){2})$");
		},
		/**
		 * Check IP
		 *
		 * @param {string|jquery} obj <target>
		 * @returns {boolean}
		 */
		IP (obj) {
			return api.Check(obj, "^((1?\\d?\\d|(2([0-4]\\d|5[0-5])))\\.){3}(1?\\d?\\d|(2([0-4]\\d|5[0-5])))$");
		},
		/**
		 * Check mac address
		 *
		 * @param {string|jquery} obj <target>
		 * @returns {boolean}
		 */
		MAC (obj) {
			return api.Check(obj, "^([0-9a-f]{2})(([/\\s:-][0-9a-f]{2}){5})$");
		},
		/**
		 * Check mobile number
		 *
		 * @param {string|jquery} obj <target>
		 * @param {boolean} [chs=true] <only parse chinese mobile number>
		 * @returns {boolean}
		 */
		Mobile (obj, chs = true) {
			return api.Check(obj, chs ? "^1[\\d]{10}$" : "\\d{6,}");
		},
		/**
		 * Check chinese identity card
		 *
		 * @public
		 * @param {string|jquery} obj <target>
		 * @returns {boolean}
		 */
		CID (obj) {
			let val = obj;
			let jq  = $.isjQuery(obj);

			const wi          = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1];
			const vc          = ["1", "0", "x", "9", "8", "7", "6", "5", "4", "3", "2"];
			const chkBirthday = value => {
				let year,
					month,
					day;

				switch (value.length) {
					case 15:
						year  = parseInt("19" + value.substring(6, 8));
						month = parseInt(value.substring(8, 10)) - 1;
						day   = parseInt(value.substring(10, 12));
						break;
					case 18:
						year  = parseInt(value.substring(6, 10));
						month = parseInt(value.substring(10, 12)) - 1;
						day   = parseInt(value.substring(12, 14));
						break;
					default:
						return false;
				}

				let dt = new Date(year, month, day);

				if (dt.getFullYear() !== year || dt.getMonth() !== month || dt.getDate() !== day) return false;

				year = (new Date()).getFullYear() - year;

				return year >= 1 && year <= 100;
			};
			const chkParity   = (value, type, wi, vc) => {
				let val = value;
				let sum = 0;

				if (!type) val = `${val.substr(0, 6)}19${val.substr(6, val.length - 6)}`;

				for (let i = 0; i < 17; i++) sum += wi[i] * parseInt(val[i]);

				sum = vc[sum % 11];

				return type ? (val[17].toLowerCase() === sum) : (val + sum);
			};

			if (jq) val = obj.val().trim();

			if (/(^\d{15}$)|(^\d{17}(\d|X)$)/.test(val)) {
				if (val.length === 15) val = chkParity(val, false, wi, vc);

				if (chkBirthday(val) && chkParity(val, true, wi, vc)) return true;
			}

			if (jq) obj.focus();

			return false;
		}
	};

	return api;
}, module);