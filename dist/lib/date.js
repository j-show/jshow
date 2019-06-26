/**
 * ==========================================
 * Name:           Date
 * Author:         jShow
 * CreTime:        2014-11-20
 * Description:    Calc Time
 * Log
 * 2015-06-08    Optimize module structure
 * 2017-02-10    Change Function arguments default value
 * 2019-05-25    Format Code to jShow Style Guide
 * ==========================================
 */
define("Date", [], function (require, module) {
	"use strict";

	const $ = jShow;

	/**
	 * @namespace Date
	 */
	const api = {
		/**
		 * Get date part of value
		 *
		 * @param {date|number} value
		 * @returns {date}
		 */
		DateOf (value) {
			let data = value;

			switch ($.type(data, true)) {
				default:
					data = new Date();
					break;
				case "number":
					data = new Date(data);
					break;
				case "date":
					data = new Date(data.getTime());
					break;
			}

			return new Date(data.getFullYear(), data.getMonth(), data.getDate());
		},
		/**
		 * Get time part of value
		 *
		 * @param {date|number} value
		 * @returns {date}
		 */
		TimeOf (value) {
			let data = value;

			switch ($.type(data, true)) {
				default:
					data = new Date();
					break;
				case "number":
					data = new Date(data);
					break;
				case "date":
					data = new Date(data.getTime());
					break;
			}

			return new Date(0, 0, 0, data.getHours(), data.getMinutes(), data.getSeconds(), data.getMilliseconds());
		},
		/**
		 * Get format time object
		 *
		 * @param {number|date} value
		 * @param {object|boolean|string} [opt]
		 *    @parma {string|boolean} [opt.fmt=all] <format code>
		 *    @param {boolean} [opt.surplus=false] <return value is surplus mode>
		 * @returns {object}
		 */
		ValueOf (value, opt) {
			let {
					fmt     = "all",
					surplus = false
				} = opt;

			switch (typeof(opt)) {
				case "boolean":
					surplus = opt;
					break;
				case "string":
					fmt = opt;
					break;
			}

			if (!$.isString(fmt)) fmt = "all";
			surplus = surplus === true;

			let data = value;

			switch ($.type(data, true)) {
				default:
					data = new Date();
					break;
				case "number":
					data = new Date(data);
					break;
				case "date":
					break;
			}

			const result = {year: 0, month: 0, week: 0, day: 0, hour: 0, minute: 0, second: 0, millisecond: 0};
			const list   = [
				["millisecond", 1000],
				["second", 60],
				["minute", 60],
				["hour", 24],
				["day", 7],
				["week", 4],
				["month", 13],
				["year", 1]
			];

			data = data.getTime();

			let max = {value: 0, unit: "millisecond"};
			let num;

			list.forEach(d => {
				num = surplus ? (data % d[1]) : data;

				result[d[0]] = num;

				if (num > 0) max = {unit: d[0], value: num};

				data = parseInt(data / d[1]);
			});

			switch (fmt) {
				default:
					return max;
				case "all":
					return result;
				case "millisecond":
				case "ms":
					return result.millisecond;
				case "second":
				case "s":
					return result.second;
				case "minute":
				case "n":
					return result.minute;
				case "hour":
				case "h":
					return result.hour;
				case "day":
				case "d":
					return result.day;
				case "week":
				case "w":
					return result.week;
				case "month":
				case "m":
					return result.month;
				case "year":
				case "y":
					return result.year;
			}
		},
		/**
		 * Get how manay day of year
		 *
		 * @param {number|date} value
		 * @returns {number}
		 */
		YearOfDay (value) {
			let year = 0;

			switch ($.type(value, true)) {
				default:
					year = (new Date()).getFullYear();
					break;
				case "date":
					year = value.getFullYear();
					break;
				case "number":
					year = value;
					break;
			}

			return $.isLeapYear(year) ? 366 : 365;
		},
		/**
		 * Get how manay day of month
		 *
		 * @param {date|object} value
		 *    @param {number} [value.year]
		 *    @param {number} [value.month]
		 * @returns {number}
		 */
		MonthOfDay (value) {
			let {
					year, month
				} = value;

			const setOpt = value => {
				year  = value.getFullYear();
				month = value.getMonth() + 1;
			};

			switch ($.type(value, true)) {
				default:
					setOpt(new Date());
					break;
				case "number":
					setOpt(new Date(value));
					break;
				case "date":
					setOpt(value);
					break;
				case "object":
					if (!$.isNumber(month, {min: 0}) || !$.isNumber(year, {min: 1})) setOpt(new Date());
					break;
			}

			switch (month) {
				default:
					return 31;
				case 2:
					return $.isLeapYear(year) ? 29 : 28;
				case 4:
				case 6:
				case 9:
				case 11:
					return 30;
			}
		},
		/**
		 * Get day of year
		 *
		 * @param {date} value
		 * @returns {number}
		 */
		DayOfYear (value) {
			let data = api.DateOf(value);

			return parseInt(api.DecMillisecond(data, new Date(data.getFullYear(), 0, 1)) / 86400000) + 1;
		},
		/**
		 * Get day of month
		 *
		 * @param {date} value
		 * @returns {number}
		 */
		DayOfMonth (value) {
			return api.DateOf(value).getDate();
		},
		/**
		 * Get day of week
		 *
		 * @param {date} value
		 * @param {number} day <start day of week, default 1>
		 * @returns {number}
		 */
		DayOfWeek (value, day = 1) {
			let start = $.isNumber(day, {min: 0, max: 6}) ? day : 1;
			let data  = api.DateOf(value).getDay();

			return data + (data < start ? 7 : 0) - start;
		},
		/**
		 * Get week of month
		 *
		 * @param {date} value
		 * @param {number} day <start day of week, default 1>
		 * @returns {number}
		 */
		WeekOfMonth (value, day = 1) {
			let data  = api.DateOf(value);
			let start = api.DayOfWeek(new Date(data.getFullYear(), data.getMonth(), 1), day);

			return parseInt((data.getDate() + start) / 7);
		},
		/**
		 * Get week of year
		 *
		 * @param {date} value
		 * @param {number} day <start day of week, default 1>
		 * @returns {number}
		 */
		WeekOfYear (value, day = 1) {
			let data  = api.DateOf(value);
			let start = api.DayOfWeek(new Date(data.getFullYear(), 0, 1), day);

			return parseInt((api.DayOfYear(data) + start) / 7);
		},
		/**
		 * Inc time dependence in type
		 *
		 * @param {number|object} value
		 * @param {object|string|date} [opt]
		 *    @param {date} [opt.date=now] <reference time>
		 *    @param {string} [opt.type=d] <inc type, default day>
		 * @returns {date}
		 */
		Inc (value, opt) {
			let data = value;

			let {
					date,
					type = "d"
				} = opt;

			switch ($.type(opt, true)) {
				case "string":
					type = opt;
					break;
				case "date":
					date = opt;
					break;
			}

			if (!$.isString(type)) type = "d";

			switch ($.type(data, true)) {
				default:
				case "number":
					data       = {};
					data[type] = value;
					break;
				case "object":
					break;
			}

			for (let k in data) {
				switch (k) {
					case "millisecond":
					case "ms":
						return api.IncMillisecond(data[k], date);
					case "minute":
					case "n":
						return api.IncMinute(data[k], date);
					case "hour":
					case "h":
						return api.IncHour(data[k], date);
					case "second":
					case "s":
						return api.IncSecond(data[k], date);
					case "day":
					case "d":
						return api.IncDay(data[k], date);
					case "week":
					case "w":
						return api.IncWeek(data[k], date);
					case "month":
					case "m":
						return api.IncMonth(data[k], date);
					case "year":
					case "y":
						return api.IncYear(data[k], date);
				}
			}
		},
		/**
		 * Inc time dependence in millisecond
		 *
		 * @param {number} value
		 * @param {date} [date] <reference time>
		 * @returns {date}
		 */
		IncMillisecond (value, date) {
			let num = $.isNumber(value) ? value : 1;
			let val = $.isDate(date) ? new Date(date.getTime()) : new Date();

			val.setTime(val.getTime() + num);

			return val;
		},
		/**
		 * Inc time dependence in second
		 *
		 * @param {number} value
		 * @param {date} [date] <reference time>
		 * @returns {date}
		 */
		IncSecond (value, date) {
			return api.IncMillisecond(value * 1000, date);
		},
		/**
		 * Inc time dependence in minute
		 *
		 * @param {number} value
		 * @param {date} [date] <reference time>
		 * @returns {date}
		 */
		IncMinute (value, date) {
			return api.IncMillisecond(value * 60000, date);
		},
		/**
		 * Inc time dependence in hour
		 *
		 * @param {number} value
		 * @param {date} [date] <reference time>
		 * @returns {date}
		 */
		IncHour (value, date) {
			return api.IncMillisecond(value * 3600000, date);
		},
		/**
		 * Inc time dependence in day
		 *
		 * @param {number} value
		 * @param {date} [date] <reference time>
		 * @returns {date}
		 */
		IncDay (value, date) {
			return api.IncMillisecond(value * 86400000, date);
		},
		/**
		 * Inc time dependence in week
		 *
		 * @param {number} value
		 * @param {date} [date] <reference time>
		 * @returns {date}
		 */
		IncWeek (value, date) {
			return api.IncDay(value * 7, date);
		},
		/**
		 * Inc time dependence in month
		 *
		 * @param {number} value
		 * @param {date} [date] <reference time>
		 * @returns {date}
		 */
		IncMonth (value, date) {
			let num = $.isNumber(value) ? value : 1;
			let val = $.isDate(date) ? new Date(date) : new Date();

			let obj = {y: val.getFullYear(), m: val.getMonth() + num, d: val.getDate()};

			obj.y = obj.y + parseInt(obj.m / 12);
			obj.m = obj.m % 12;

			val.setDate(1);

			if (obj.m >= 0) {
				val.setFullYear(obj.y);
				val.setMonth(obj.m);
			}
			else {
				val.setFullYear(obj.y - 1);
				val.setMonth(12 - obj.m);
			}

			val.setDate(obj.d);

			return val;
		},
		/**
		 * Inc time dependence in year
		 *
		 * @param {number} value
		 * @param {date} [date] <reference time>
		 * @returns {date}
		 */
		IncYear (value, date) {
			let num = $.isNumber(value) ? value : 1;
			let val = $.isDate(date) ? new Date(date) : new Date();

			val.setFullYear(val.getFullYear() + num);

			return val;
		},
		/**
		 * Difference time between dt1 and dt2
		 *
		 * @param {date} dt1
		 * @param {date} dt2
		 * @param {string} [type=d] <dec type>
		 * @returns {number}
		 */
		Dec (dt1, dt2, type = dt2) {
			switch (type) {
				case "millisecond":
				case "ms":
				default:
					return api.DecMillisecond(dt1, dt2);
				case "second":
				case "s":
					return api.DecSecond(dt1, dt2);
				case "minute":
				case "n":
					return api.DecMinute(dt1, dt2);
				case "hour":
				case "h":
					return api.DecHour(dt1, dt2);
				case "day":
				case "d":
					return api.DecDay(dt1, dt2);
				case "week":
				case "w":
					return api.DecWeek(dt1, dt2);
				case "month":
				case "m":
					return api.DecMonth(dt1, dt2);
				case "year":
				case "y":
					return api.DecYear(dt1, dt2);
			}
		},
		/**
		 * Difference time between dt1 and dt2 in millisecond
		 *
		 * @param {date} dt1
		 * @param {date} dt2
		 * @returns {number}
		 */
		DecMillisecond (dt1, dt2) {
			let _dt1 = dt1;
			let _dt2 = dt2;

			if (!$.isDate(_dt1)) _dt1 = new Date();
			if (!$.isDate(_dt2)) _dt2 = new Date();

			return _dt1.getTime() - _dt2.getTime();
		},
		/**
		 * Difference time between dt1 and dt2 in second
		 *
		 * @param {date} dt1
		 * @param {date} dt2
		 * @returns {number}
		 */
		DecSecond (dt1, dt2) {
			return parseInt(api.DecMillisecond(dt1, dt2) / 1000);
		},
		/**
		 * Difference time between dt1 and dt2 in minute
		 *
		 * @param {date} dt1
		 * @param {date} dt2
		 * @returns {number}
		 */
		DecMinute (dt1, dt2) {
			return parseInt(api.DecMillisecond(dt1, dt2) / 60000);
		},
		/**
		 * Difference time between dt1 and dt2 in hour
		 *
		 * @param {date} dt1
		 * @param {date} dt2
		 * @returns {number}
		 */
		DecHour (dt1, dt2) {
			return parseInt(api.DecMillisecond(dt1, dt2) / 3600000);
		},
		/**
		 * Difference time between dt1 and dt2 in day
		 *
		 * @param {date} dt1
		 * @param {date} dt2
		 * @param {boolean} [ms=false] <is calc in millisecond>
		 * @returns {number}
		 */
		DecDay (dt1, dt2, ms = false) {
			let _dt1 = dt1;
			let _dt2 = dt2;

			if (!$.isDate(_dt1)) _dt1 = new Date();
			if (!$.isDate(_dt2)) _dt2 = new Date();

			if (ms !== true) {
				_dt1 = api.DateOf(_dt1);
				_dt2 = api.DateOf(_dt2);
			}

			return parseInt((_dt1.getTime() - _dt2.getTime()) / 86400000);
		},
		/**
		 * Difference time between dt1 and dt2 in week
		 *
		 * @param {date} dt1
		 * @param {date} dt2
		 * @param {boolean} [day=false] <is calc in day>
		 * @returns {number}
		 */
		DecWeek (dt1, dt2, day = false) {
			let _dt1 = dt1;
			let _dt2 = dt2;

			if (!$.isDate(_dt1)) _dt1 = new Date();
			if (!$.isDate(_dt2)) _dt2 = new Date();

			let num = api.DecDay(_dt1, _dt2);

			if (day === true) num -= _dt1.getDay() - _dt2.getDay();

			return parseInt(num / 7);
		},
		/**
		 * Difference time between dt1 and dt2 in month
		 *
		 * @param {date} dt1
		 * @param {date} dt2
		 * @param {boolean} [day=false] <is calc in day>
		 * @returns {number}
		 */
		DecMonth (dt1, dt2, day = false) {
			let _dt1 = dt1;
			let _dt2 = dt2;

			if (!$.isDate(_dt1)) _dt1 = new Date();
			if (!$.isDate(_dt2)) _dt2 = new Date();

			let num;

			if (day === true) {
				num = parseInt(api.DecDay(_dt1, _dt2) / 30);
			}
			else {
				num = _dt1.getFullYear() - _dt2.getFullYear() - 1;
				num = num * 12 + _dt1.getMonth() + _dt2.getMonth();
			}

			return num;
		},
		/**
		 * Difference time between dt1 and dt2 in year
		 *
		 * @param {date} dt1
		 * @param {date} dt2
		 * @param {boolean} [day=false] <is calc in day>
		 * @returns {number}
		 */
		DecYear (dt1, dt2, day = false) {
			let _dt1 = dt1;
			let _dt2 = dt2;

			if (!$.isDate(_dt1)) _dt1 = new Date();
			if (!$.isDate(_dt2)) _dt2 = new Date();

			let num;

			if (day === true) {
				num = parseInt(api.DecDay(_dt1, _dt2) / 365);
			}
			else {
				num = _dt1.getFullYear() - _dt2.getFullYear();
			}

			return num;
		},
		/**
		 * Get yesterday date
		 *
		 * @param {date|number} value
		 * @param {boolean} [day=true] <is abandon time part>
		 * @returns {date}
		 */
		Yesterday (value, day = true) {
			let data = api.IncDay(-1, value);

			return day === true ? api.DateOf(data) : data;
		},
		/**
		 * Get tomorrow date
		 *
		 * @param {date|number} value
		 * @param {boolean} [day=true] <is abandon time part>
		 * @returns {date}
		 */
		Tomorrow (value, day = true) {
			let data = api.IncDay(1, value);

			return day === true ? api.DateOf(data) : data;
		}
	};

	return api;
}, module);