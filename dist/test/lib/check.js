/**
 * ==========================================
 * Name:           Check
 * Author:         jShow
 * CreTime:        2014-11-20
 * Description:    内容校验
 * Log
 * 2015-06-08    优化模块结构
 * ==========================================
 */
jShow.define(function (module, exports, require) {
	"use strict";
	let api;

	/**
	 * 泛式校验
	 *
	 * @namespace Check
	 */
	api = {
		/**
		 * 泛式校验
		 *
		 * @public
		 * @param {string|jquery} obj
		 * @param {string|regexp} rxp 正则字符串
		 * @param {string} def 默认匹配值
		 * @returns {boolean}
		 */
		Check:    (obj, rxp, def) => {
			let val = obj,
				jq  = jShow.isjQuery(obj);

			if (!jShow.isString(def)) def = "^\\S{0,}$";

			if (jq) {
				rxp = typeof(obj.attr("chk")) != "undefined" ? obj.attr("chk") : rxp;
				val = obj.val();
			}

			if (val) {
				switch (jShow.type(rxp, true)) {
					case "regexp":
						break;
					case "string":
						if (rxp.length >= 2) {
							rxp = new RegExp(rxp, "i");
							break;
						}
					default:
						rxp = new RegExp(def, "i");
						break;
				}

				if (rxp.test(val)) return true;
				if (jq) obj.focus();
			}

			return false;
		},
		/**
		 * Input校验
		 *
		 * @public
		 * @param {string} obj
		 * @param {number} [min=0] 最小值
		 * @param {number} [max=1024] 最大值
		 * @returns {boolean}
		 */
		Input:    (obj, min, max) => {
			if (!jShow.isNumber(min) || min < 0) min = 0;
			if (!jShow.isNumber(max) || max <= min) max = 1024;

			return api.Check(obj, "^\\S{" + min + "," + max + "}$");
		},
		/**
		 * 宽泛内容校验
		 *
		 * @public
		 * @param {string|jquery} obj
		 * @param {number} [min=0] 最小值
		 * @param {number} [max=1024] 最大值
		 * @returns {boolean}
		 */
		Info:     (obj, min, max) => {
			if (!jShow.isNumber(min) || min < 0) min = 0;
			if (!jShow.isNumber(max) || max <= min) max = 1024;

			return api.Check(obj, "^[\\S\\s]{" + min + "," + max + "}$");
		},
		/**
		 * Select校验
		 *
		 * @public
		 * @param {jquery} obj
		 * @param {string|regexp} rxp 正则字符串
		 * @returns {boolean}
		 */
		Select:   (obj, rxp) => api.Check(obj, rxp, "\\S{1,}"),
		/**
		 * CheckBox校验
		 *
		 * @public
		 * @param {jquery} obj
		 * @param {string|regexp} rxp 正则字符串
		 * @returns {boolean}
		 */
		CheckBox: (obj, rxp) => api.Check(obj, rxp, "\\S{1,}"),
		/**
		 * 账号校验
		 *
		 * @public
		 * @param {string} obj
		 * @param {number} [min=6] 最小值
		 * @param {number} [max=32] 最大值
		 * @returns {boolean}
		 */
		UID:      (obj, min, max) => {
			if (!jShow.isNumber(min) || min < 0) min = 6;
			if (!jShow.isNumber(max) || max <= min) max = 32;

			return api.Check(obj, "^[a-z]{1}[a-z0-9_]{" + (min - 1) + "," + (max - 1) + "}$");
		},
		/**
		 * 密码校验
		 *
		 * @public
		 * @param {string} obj
		 * @param {number} [min=6] 最小值
		 * @param {number} [max=32] 最大值
		 * @returns {boolean}
		 */
		PWD:      (obj, min, max) => {
			if (!jShow.isNumber(min) || min < 0) min = 6;
			if (!jShow.isNumber(max) || max <= min) max = 32;

			return api.Check(obj, "^[a-z0-9~!@#$%^&*-_=\+]{" + min + "," + max + "}$");
		},
		/**
		 * 邮箱校验
		 *
		 * @public
		 * @param {string} obj
		 * @returns {boolean}
		 */
		Mail:     obj => api.Check(obj, "^[a-z0-9]{1}[\\w-]*(\\.[a-z0-9]{1}[\\w-]*)*@[a-z0-9]{1}[\\w-]*(\\.[a-z0-9]{1}[\\w-]*)*\\.[a-z0-9]+$"),
		/**
		 * GPS校验
		 *
		 * @public
		 * @param {string} obj
		 * @returns {boolean}
		 */
		GPS:      obj => api.Check(obj, "^([0-9]{1,})(([/\\s:-][0-9]{1,}){2})$"),
		/**
		 * IP校验
		 *
		 * @public
		 * @param {string} obj
		 * @returns {boolean}
		 */
		IP:       obj => api.Check(obj, "^((1?\\d?\\d|(2([0-4]\\d|5[0-5])))\\.){3}(1?\\d?\\d|(2([0-4]\\d|5[0-5])))$"),
		/**
		 * MAC校验
		 *
		 * @public
		 * @param {string} obj
		 * @returns {boolean}
		 */
		MAC:      obj => api.Check(obj, "^([0-9a-f]{2})(([/\\s:-][0-9a-f]{2}){5})$"),
		/**
		 * 手机校验
		 *
		 * @public
		 * @param {string} obj
		 * @returns {boolean}
		 */
		Mobile:   obj => api.Check(obj, "^(1[3|4|5|7|8])[\\d]{9}$"),
		/**
		 * 昵称码校验
		 * 中文占2个字符
		 *
		 * @public
		 * @param {string} obj
		 * @param {number} [min=2] 最小值
		 * @param {number} [max=6] 最大值
		 * @param {boolean} [all=true] 是否允许全部内容
		 * @returns {boolean}
		 */
		Name:     (obj, min, max, all) => {
			if (!jShow.isNumber(min) || min < 0) min = 2;
			if (!jShow.isNumber(max) || max <= min) max = 6;
			all = all !== false ? "^[a-z\u2E80-\u9FFF]{1}([a-z0-9\u2E80-\u9FFF]|[_])" : "^[\u2E80-\u9FFF]{1}([0-9\u2E80-\u9FFF])";
			all += "{" + (min - 1) + "," + (max - 1) + "}$";

			if (!api.Check(obj, all)) return false;

			if (jShow.isjQuery(obj)) obj = obj.val();

			all = obj.match(/[^ -~]/g);
			obj = (all ? all.length : 0) + obj.length;

			return obj <= max;
		},
		/**
		 * 身份证校验
		 *
		 * @public
		 * @param {string} obj
		 * @returns {boolean}
		 */
		CID:      obj => {
			let val = obj,
				jq  = jShow.isjQuery(obj);

			const wi          = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1],
				  vc          = ["1", "0", "x", "9", "8", "7", "6", "5", "4", "3", "2"],
				  chkBirthday = value => {
					  let year, month, day;

					  switch (value.length) {
						  case 15:
							  year = parseInt("19" + value.substring(6, 8));
							  month = parseInt(value.substring(8, 10)) - 1;
							  day = parseInt(value.substring(10, 12));
							  break;
						  case 18:
							  year = parseInt(value.substring(6, 10));
							  month = parseInt(value.substring(10, 12)) - 1;
							  day = parseInt(value.substring(12, 14));
							  break;
						  default:
							  return false;
					  }

					  let dt = new Date(year, month, day);

					  if (dt.getFullYear() != year || dt.getMonth() != month || dt.getDate() != day) return false;

					  year = (new Date()).getFullYear() - year;

					  return year >= 1 && year <= 100;
				  },
				  chkParity   = (value, type, wi, vc) => {
					  let sum = 0;

					  if (!type) value = value.substr(0, 6) + "19" + value.substr(6, value.length - 6);

					  for (let i = 0; i < 17; i++) sum += wi[i] * parseInt(value[i]);

					  sum = vc[sum % 11];

					  return type ? (value[17].toLowerCase() == sum) : (value + sum);
				  };

			if (jq) val = obj.val().trim();

			if (/(^\d{15}$)|(^\d{17}(\d|X)$)/.test(val)) {
				if (val.length == 15) val = chkParity(val, false, wi, vc);

				if (chkBirthday(val) && chkParity(val, true, wi, vc)) return true;
			}

			if (jq) obj.focus();

			return false;
		}
	};

	return api;
}, {module: module, exports: this}, [], "Check");