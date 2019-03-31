/**
 * ==========================================
 * Name:           Date
 * Author:         jShow
 * CreTime:        2014-11-20
 * Description:    时间计算
 * Log
 * 2015-06-09    优化模块结构
 * 2017-02-10    去除函数默认参数,增加适配
 * ==========================================
 */
jShow.define(function (module, exports, require) {
	"use strict";
	let api;

	/**
	 * 时间日期计算
	 *
	 * @namespace Date
	 */
	api = {
		/**
		 * 获取日期部分时间
		 *
		 * @param {date} value
		 * @returns {date}
		 */
		DateOf:         value => {
			value = jShow.isDate(value) ? value : new Date();

			return new Date(value.getFullYear(), value.getMonth(), value.getDate());
		},
		/**
		 * 获取时间部分时间
		 *
		 * @param {date} value
		 * @returns {date}
		 */
		TimeOf:         value => {
			value = jShow.isDate(value) ? value : new Date();

			return new Date(0, 0, 0, value.getHours(), value.getMinutes(), value.getSeconds(), value.getMilliseconds());
		},
		/**
		 * 获得格式化时间内容
		 *
		 * @param {number|date} value 毫秒数
		 * @param {object|boolean|string} [opt]
		 *    @parma {string|boolean} [opt.fmt=all] 格式化参数
		 *    @param {boolean} [opt.surplus=false] 剩余模式
		 * @returns {object}
		 */
		ValueOf:        (value, opt) => {
			let result = {year: 0, month: 0, week: 0, day: 0, hour: 0, minute: 0, second: 0, millisecond: 0},
				max    = {value: 0, unit: "millisecond"},
				fmt, surplus;

			switch (typeof(opt)) {
				case "object":
					if (opt) {
						fmt = opt.fmt;
						surplus = opt.surplus;
					}
					break;
				case "boolean":
					surplus = opt;
					break;
				case "string":
					fmt = opt;
					break;
			}
			surplus = surplus === true;

			if (jShow.isDate(value)) value = value.getTime();
			if (!jShow.isNumber(value)) return 0;

			jShow.each([
				["millisecond", 1000],
				["second", 60],
				["minute", 60],
				["hour", 24],
				["day", 7],
				["week", 4],
				["month", 13],
				["year", 1]
			], d => {
				result[d[0]] = surplus ? value % d[1] : value;
				if (result[d[0]] > 0) max.value = result[max.unit = d[0]];
				value = parseInt(value / d[1]);
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
		 * 昨天
		 *
		 * @param {date|number} value
		 * @param {boolean} [day=true] 是否取天整
		 * @returns {date}
		 */
		Yesterday:      (value, day) => {
			value = api.IncDay(-1, value);
			return day !== false ? api.DateOf(value) : value;
		},
		/**
		 * 明天
		 *
		 * @param {date|number} value
		 * @param {boolean} [day=true] 是否取天整
		 * @returns {date}
		 */
		Tomorrow:       (value, day) => {
			value = api.IncDay(1, value);
			return day !== false ? api.DateOf(value) : value;
		},
		/**
		 * 是否是闰年
		 *
		 * @param {number|date} value
		 * @returns {date}
		 */
		IsLeapYear:     value => {
			if (jShow.isNumber(value)) value = new Date(value);
			if (!jShow.isDate(value)) return false;

			value = new Date(value.getFullYear(), 1, 29);

			return value.getMonth() == 1 && value.getDate() == 29;
		},
		/**
		 * 本月有多少天
		 *
		 * @param {number|date} year 当参数为1时,接受时间类型
		 * @param {number} month
		 * @returns {date}
		 */
		MonthOfDay:     function (month, year) {
			let date = arguments.length == 1 && jShow.isDate(month) ? month : new Date();

			if (!jShow.isNumber(month, {min: 0})) month = date.getMonth() + 1;
			if (!jShow.isNumber(year, {min: 1})) year = date.getFullYear();

			if (month == 2) return api.IsLeapYear(year) ? 29 : 28;

			return ([31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31])[month - 1] || 30;
		},
		/**
		 * 本年有多少天
		 *
		 * @param {number|date} value
		 * @returns {date}
		 */
		YearOfDay:      value => api.IsLeapYear(value) ? 366 : 365,
		/**
		 * 本月第几天
		 *
		 * @param {date} value
		 * @returns {date}
		 */
		DayOfMonth:     value => api.DateOf(value).getDate(),
		/**
		 * 本年第几天
		 *
		 * @param {date} value
		 * @returns {date}
		 */
		DayOfYear:      value => {
			value = api.DateOf(value);

			return api.DecMillisecond(value, new Date(value.getFullYear(), 0, 1)) / 86400000 + 1;
		},
		/**
		 * 本月的第几周
		 *
		 * @param {date} value
		 * @returns {date}
		 */
		WeekOfMonth:    value => parseInt(api.DayOfMonth(value) / 7),
		/**
		 * 本年的第几周
		 *
		 * @param {date} value
		 * @returns {date}
		 */
		WeekOfYear:     value => parseInt(api.DayOfYear(value) / 7),
		/**
		 * 时间增量
		 *
		 * @param {number|object} value 增加量
		 * @param {object|string|date} [date]
		 *    @param {date} [date.date=now] 基准时间
		 *    @param {string} [date.type=d] 增加类型，默认是天数
		 * @param {string} [type=d] 增加类型，默认是天数
		 * @returns {date}
		 */
		Inc:            (value, date, type) => {
			let result, dt;

			switch (jShow.type(date, true)) {
				case "object":
					if (date) {
						dt = date.date;
						type = date.type;
					}
					break;
				case "string":
					type = date;
					break;
				case "date":
					dt = date;
					break;
			}
			if (!jShow.isString(type)) type = "d";

			switch (jShow.type(value, true)) {
				default:
					value = 1;
				case "number":
					result = {};
					result[type] = value;
					break;
				case "object":
					result = value;
					break;
			}
			value = result;

			jShow.each(value, (d, k, t) => {
				if (t != "number") return;

				switch (k) {
					case "millisecond":
					case "ms":
						result = api.IncMillisecond(d, dt);
						break;
					case "minute":
					case "n":
						result = api.IncMinute(d, dt);
						break;
					case "hour":
					case "h":
						result = api.IncHour(d, dt);
						break;
					case "second":
					case "s":
						result = api.IncSecond(d, dt);
						break;
					case "day":
					case "d":
						result = api.IncDay(d, dt);
						break;
					case "week":
					case "w":
						result = api.IncWeek(d, dt);
						break;
					case "month":
					case "m":
						result = api.IncMonth(d, dt);
						break;
					case "year":
					case "y":
						result = api.IncYear(d, dt);
						break;
				}
			}, true);

			return result;
		},
		/**
		 * 毫秒增量
		 *
		 * @param {number} value 增加量
		 * @param {date} [date] 基准时间
		 * @returns {date}
		 */
		IncMillisecond: (value, date) => {
			value = jShow.isNumber(value) ? value : 1;
			date = jShow.isDate(date) ? new Date(date) : new Date();

			date.setTime(date.getTime() + value);

			return date;
		},
		/**
		 * 秒增量
		 *
		 * @param {number} value 增加量
		 * @param {date} [date] 基准时间
		 * @returns {date}
		 */
		IncSecond:      (value, date) => api.IncMillisecond(value * 1000, date),
		/**
		 * 分钟增量
		 *
		 * @param {number} value 增加量
		 * @param {date} [date] 基准时间
		 * @returns {date}
		 */
		IncMinute:      (value, date) => api.IncMillisecond(value * 60000, date),
		/**
		 * 小时增量
		 *
		 * @param {number} value 增加量
		 * @param {date} [date] 基准时间
		 * @returns {date}
		 */
		IncHour:        (value, date) => api.IncMillisecond(value * 3600000, date),
		/**
		 * 天增量
		 *
		 * @param {number} value 增加量
		 * @param {date} [date] 基准时间
		 * @returns {date}
		 */
		IncDay:         (value, date) => api.IncMillisecond(value * 86400000, date),
		/**
		 * 周增量，以7天为单位
		 *
		 * @param {number} value 增加量
		 * @param {date} [date] 基准时间
		 * @returns {date}
		 */
		IncWeek:        (value, date) => api.IncDay(value * 7, date),
		/**
		 * 月增量
		 *
		 * @param {number} value 增加量
		 * @param {date} [date] 基准时间
		 * @returns {date}
		 */
		IncMonth:       (value, date) => {
			value = jShow.isNumber(value) ? value : 1;
			date = jShow.isDate(date) ? new Date(date) : new Date();

			let obj = {y: date.getFullYear(), m: date.getMonth() + value, d: date.getDate()};

			obj.y = obj.y + parseInt(obj.m / 12);
			obj.m = obj.m % 12;

			date.setDate(1);
			if (obj.m >= 0) {
				date.setFullYear(obj.y);
				date.setMonth(obj.m);
			}
			else {
				date.setFullYear(obj.y - 1);
				date.setMonth(12 - obj.m);
			}
			date.setDate(obj.d);

			return date;
		},
		/**
		 * 年增量
		 *
		 * @param {number} value 增加量
		 * @param {date} [date] 基准时间
		 * @returns {date}
		 */
		IncYear:        (value, date) => {
			date = jShow.isDate(date) ? new Date(date) : new Date();
			date.setFullYear(date.getFullYear() + (jShow.isNumber(value) ? value : 1));

			return date;
		},
		/**
		 * 时间间隔
		 *
		 * @param {date} dt1
		 * @param {date} dt2
		 * @param {string} [type=d] 间隔类型，默认是毫秒
		 * @returns {number}
		 */
		Dec:            (dt1, dt2, type) => {
			type = type === void(0) ? dt2 : type;

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
		 * 毫秒间隔
		 *
		 * @param {date} dt1
		 * @param {date} dt2
		 * @returns {number}
		 */
		DecMillisecond: (dt1, dt2) => (jShow.isDate(dt1) ? dt1 : new Date()).getTime() - (jShow.isDate(dt2) ? dt2 : new Date()).getTime(),
		/**
		 * 秒间隔
		 *
		 * @param {date} dt1
		 * @param {date} dt2
		 * @returns {number}
		 */
		DecSecond:      (dt1, dt2) => parseInt(api.DecMillisecond(dt1, dt2) / 1000),
		/**
		 * 分钟间隔
		 *
		 * @param {date} dt1
		 * @param {date} dt2
		 * @returns {number}
		 */
		DecMinute:      (dt1, dt2) => parseInt(api.DecMillisecond(dt1, dt2) / 60000),
		/**
		 * 小时间隔
		 *
		 * @param {date} dt1
		 * @param {date} dt2
		 * @returns {number}
		 */
		DecHour:        (dt1, dt2) => parseInt(api.DecMillisecond(dt1, dt2) / 3600000),
		/**
		 * 天间隔
		 *
		 * @param {date} dt1
		 * @param {date} dt2
		 * @param {boolean} [ms=false] 是否按实际毫秒算
		 * @returns {number}
		 */
		DecDay:         (dt1, dt2, ms) => {
			if (ms === true) {
				dt1 = api.DateOf(dt1);
				dt2 = api.DateOf(dt2);
			}

			return parseInt((dt1.getTime() - dt2.getTime()) / 86400000);
		},
		/**
		 * 周间隔
		 *
		 * @param {date} dt1
		 * @param {date} dt2
		 * @param {boolean} [day=false] 是否按实际天数算
		 * @returns {number}
		 */
		DecWeek:        (dt1, dt2, day) => {
			let result = api.DecDay(dt1, dt2);

			if (day === true) result -= api.DateOf(dt1).getDay() - api.DateOf(dt2).getDay();

			return parseInt(result / 7);
		},
		/**
		 * 月间隔
		 *
		 * @param {date} dt1
		 * @param {date} dt2
		 * @param {boolean} [day=false] 是否按实际天数算
		 * @returns {number}
		 */
		DecMonth:       (dt1, dt2, day) => {
			let result;

			if (day === true) result = parseInt(api.DecDay(dt1, dt2) / 30);
			else {
				dt1 = api.DateOf(dt1);
				dt2 = api.DateOf(dt2);

				result = dt1.getFullYear() - dt2.getFullYear() - 1;
				result = result * 12 + dt1.getMonth() + dt2.getMonth();
			}

			return result;
		},
		/**
		 * 年间隔
		 *
		 * @param {date} dt1
		 * @param {date} dt2
		 * @param {boolean} [day=false] 是否按实际天数算
		 * @returns {number}
		 */
		DecYear:        (dt1, dt2, day) => {
			let result;

			if (day === true) result = parseInt(api.DecDay(dt1, dt2) / 365);
			else result = api.DateOf(dt1).getFullYear() - api.DateOf(dt2).getFullYear();

			return result;
		}
	};

	return api;
}, {module: module, exports: this}, [], "Date");