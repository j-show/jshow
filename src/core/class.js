/**
 * ==========================================
 * Name:           jShow's Class Extensions
 * Author:         j-show
 * CreTime:        2019-02-14
 * Description:    Class Extensions
 * Log:
 * 2019-02-14    Init Class
 * ==========================================
 */
($ => {
	/*
	 ====================================
	 = 类名: TObject
	 = 功  能: 基类
	 = 类函数：
	 =   create    = 初始化函数
	 = 对象属性：
	 =   className  = 函数名
	 =   errorMax   = 记录错误上限
	 =   lastError  = 最后次错误记录
	 = 对象函数：
	 =   free       = 注销
	 =   on         = 事件绑定
	 =   off        = 事件移除
	 =   call       = 事件调用
	 =   getError   = 获得指定错误记录
	 =   setError   = 设置错误记录
	 =   clearError = 清除错误记录
	 ====================================
	 */
	class TObject {
		constructor () {
			this.__className = "TObject";

			this.__error_list = [];
			this.__error_max = 5;
			this.__event_list = {};
			this.__event_max = 99;
		}

		free () {

		}

		on (key, func) {
			if (!$.isString(key)) return this;

			let list = this.__event_list[key] || (this.__event_list[key] = []),
				max  = this.__event_max,
				each = (o, l, n, m) => {
					for (let i = n, f; i < l.length; i++) {
						switch ($.type(f = l[i], true)) {
							case "function":
								o.push(f);
								if (o.length > m) o.pop();
								break;
							case "array":
								each(o, f, 0, m);
								break;
						}
					}
				};

			each(list, arguments, 1, max);

			return this;
		}

		off (key, func) {
			if (arguments.length < 1) this.__event_list = {};
			else if (typeof(func) !== "function") this.__event_list[key] = [];
			else {
				let list = this.__event_list[key] || [];

				for (let i = 0; i < list.length;) {
					if (Object.is(func, list[i])) list.splice(i, 1);
					else i++;
				}
			}

			return this;
		}

		async call (key, arg) {
			const dtd  = $.Deferred(true),
				  list = this.__event_list[key] || [];

			arg = Array.prototype.slice.call(arguments, 1);
			if (arg.length === 1 && $.isArray(arg[0])) arg = arg[0];

			try {
				for (let i = 0, f; i < list.length; i++) {
					switch ($.type(f = list[i], true)) {
						case "function":
							list[i].apply(this, arg);
							break;
						case "asyncfunction":
							await list[i].apply(this, arg);
							break;
					}
				}
			}
			catch (e) {
				dtd.reject(e);
			}

			dtd.resolve(key);

			return dtd.promise();
		}

		getError (index) {
			let list = this.__error_list;

			if (!$.isNumber(index, {min: 0, max: list.length})) return null;

			return index < list.length ? list[index] : null;
		}

		setError (level, code = level, msg = code) {
			if (!$.has(level, ["log", "info", "error"])) level = "log";
			if (!$.isNumber(code)) code = -1;
			if (!$.isString(msg)) msg = "";

			let list = this.__error_list,
				max  = this.__error_max,
				err  = {level, code, msg};

			while (list.length > max) list.shift();
			list.push(err);

			this.call("error", [err]);

			return list[list.length - 1];
		}

		clearError () {
			this.__error_list = [];

			return this;
		}

		get className () {
			return this.__className;
		}

		get errorMax () {
			return this.__error_max;
		}

		set errorMax (value) {
			if (!$.isNumber(value, {min: 1, max: 99})) return;

			this.__error_max = value;

			let list = this.__error_list;

			while (list.length > value) list.shift();
		}

		get lastError () {
			let list = this.__error_list;

			return list.length > 0 ? list[list.length - 1] : null;
		}

		static create () {
			return new TObject();
		}
	}

	/*
	 ====================================
	 = 类名: TSeal
	 = 功  能: 密封类生成
	 = 对象属性：
	 =   className = 函数名
	 = 对象函数：
	 =   clone     = 复制本体
	 =   Create    = 初始化
	 ====================================
	 */
	$.TSeal = (() => {
		const initClassError = function () {
				  if (this.getError || this.setError || this.lastError) return;
				  this.__error__ = [];
				  this.errorMax = 5;
				  this.getError = function (index) {
					  index = $.isNumber(index, {min: 0}) ? index : -1;

					  let list = this.__error__;

					  return list.length < 1 ? null : list[index < 0 ? list.length - 1 : index];
				  };
				  this.setError = function (level, code, msg) {
					  if (arguments.length < 2) code = level;
					  if (arguments.length < 3) msg = code;

					  if (!$.has(level, ["log", "info", "error"])) level = "log";
					  if (!$.isNumber(code)) code = -1;
					  if (!$.isString(msg)) msg = "";

					  let list = this.__error__,
						  err  = {level, code, msg};

					  while (list.length >= this.errorMax) list.shift();
					  list.push(err);

					  this.call("error", [err]);

					  return list[list.length - 1];
				  };
				  this.lastError = function () {
					  let list = this.__error__;

					  return list.length > 0 ? list[list.length - 1] : null;
				  };
			  },
			  initClassEvent = function () {
				  if (this.on || this.off || this.call) return;
				  this.__event__ = {};
				  this.on = function (key, func) {
					  let each = (o, l, n) => {
							  for (let i = n, f; i < l.length; i++) {
								  f = l[i];

								  switch ($.type(f, true)) {
									  case "function":
										  o.push(f);
										  break;
									  case "array":
										  each(o, f, 0);
										  break;
								  }
							  }
						  },
						  list = this.__event__[key] || (this.__event__[key] = []);

					  each(list, arguments, 1);

					  return this;
				  };
				  this.off = function (key, func) {
					  if (arguments.length == 0) this.__event__ = {};
					  else if (typeof(func) != "function") this.__event__[key] = [];
					  else {
						  let list = this.__event__[key];

						  if (list && list.length > 0) {
							  for (let i = 0; i < list.length; i++) {
								  if (func !== list[i]) i++;
								  else list.splice(i, 1);
							  }
						  }
					  }

					  return this;
				  };
				  this.call = function (key, arg) {
					  let list = this.__event__[key];

					  if (list && list.length > 0) {
						  if (arguments.length < 2) arg = [];
						  else if (!$.isArray(arg)) arg = [arg];

						  for (let i = 0; i < list.length; i++) list[i].apply(this, arg);
					  }

					  return this;
				  };
			  };

		function TSeal () {}

		TSeal.extend = function (childAPI) {
			if (!$.isObject(childAPI)) throw new Error(console.error("[TSeal] object is null"));

			const className   = childAPI.className || "TSeal",
				  parentClass = TSeal,
				  initChild   = function () {
					  initClassError.call(this);
					  initClassEvent.call(this);

					  this["create"].apply(this, arguments);

					  return this;
				  };

			let childClass = null;

			eval("childClass=function " + className + "(){return initChild.apply(this,arguments);}");

			childClass.prototype = Object.create(parentClass.prototype);
			childClass.className = className;

			(CLASS => {
				$.each(childAPI, (d, k) => {
					if (Object.is(CLASS[k], d)) return;

					CLASS[k] = $.clone(d, true);
				});
			})(childClass.prototype);

			return childClass;
		};
		TSeal.className = "TSeal";
		TSeal.prototype = {
			className: "TSeal",
			create:    function () { return this; },
			free:      function () {},
			clone:     function () { return $.clone(this, true); }
		};

		return TSeal;
	})();

	/*
	 ====================================
	 = 类名: TCache
	 = 功  能：缓存类，基于Buffer进行缓存循环运用
	 = 继  承：TObject
	 = 类函数：
	 =   create    = 初始化函数
	 = 对象属性：
	 =   max       = 最大缓冲大小
	 =   index     = 当前数据位
	 =   length    = 有效数据长度
	 =   offset    = 空白数据起始位
	 =   surplus   = 剩余缓冲大小
	 = 对象函数：
	 =   valueOf   = 真实数据块
	 =   clear     = 清空缓存
	 =   resize    = 数据整理
	 =   push      = 推入数据
	 =   remove    = 删除数据
	 ====================================
	 */
	class TCache extends TObject {
		constructor (size) {
			super();

			this.__className = "TCache";

			this._max = $.isNumber(size, {min: 32, max: 10240}) ? size : 128;
			this._index = 0;
			this._length = 0;

			this._cache = Buffer.alloc(this._max);
		}

		free () {
			this._cache = null;
		}

		valueOf () {
			return this._cache;
		}

		resize (force) {
			if (force === true) this.clear();
			else {
				if (this._length > 0) this.valueOf().copy(this.valueOf(), 0, this.index, this.offset);

				this._index = 0;
			}

			return this.surplus;
		}

		clear () {
			this._index = 0;
			this._length = 0;

			return this;
		}

		push (buf) {
			let offset = buf.byteOffset,
				count  = buf.byteLength,
				write;

			while (count > 0) {
				write = Math.min(count, (write = this.surplus) > 0 ? write : this.resize());
				if (write < 1) write = this.resize(true);

				buf.copy(this.valueOf(), this.offset, offset, offset + write);

				this._length += write;
				offset += write;
				count -= write;

				if (this.parse) this.parse();
			}

			return this;
		}

		remove (size) {
			size = Math.min(size, this.length);

			this._index += size;
			this._length -= size;

			return this;
		}

		get max () {
			return this._max;
		}

		get index () {
			return this._index;
		}

		get length () {
			return this._length;
		}

		get offset () {
			return this._index + this._length;
		}

		get surplus () {
			return this.max - this.offset;
		}

		static create (size) {
			return new TCache(size);
		}

		static alloc (max) {
			return new TCache(max);
		}
	}

	/*
	 ====================================
	 = 类名: TList
	 = 功  能: 队列类
	 = 继  承：TObject
	 = 对象属性：
	 =   length    = 数据长度
	 =   type      = 数据限定类型
	 =   first     = 首个数据
	 =   last      = 尾端数据
	 = 对象函数：
	 =   clear     = 清空数据
	 =   sort      = 数据排序，接受自定义排序函数
	 =   each      = 数据检索，遍历函数为true时，删除遍历项
	 =   set       = 设置数据，校验数据类型
	 =   del       = 删除数据
	 =   add       = 添加数据，校验数据类型
	 =   addList   = 批量添加数据
	 =   push      = 先进后出，添加数据
	 =   pop       = 先进后出，获取数据
	 =   put       = 先进先出，添加数据
	 =   poll      = 先进先出，获取数据
	 ====================================
	 */
	(function (TObject) {
		const isType   = (obj, type) => {
				  let objType;

				  if (!type || type == "*" || (type == (objType = $.type(obj, true)))) return true;
				  if (type == "object" && (objType == "null" || objType == "undefined")) return false;
				  if (objType != "object") return false;
				  if (type == "date" && obj.className == "TChinaDate") return true;

				  return false;
			  },
			  fmtIndex = (index, def, max) => {
				  index = $.isNumber(index) ? index : def;

				  if (index < 0) index = -1;
				  else if (index >= max) index = max;

				  return index;
			  },
			  setData  = (own, data) => {
				  let i;

				  for (i = 0; i < own.length; i++) delete own[i];
				  for (i = 0; i < data.length; i++) own[i] = data[i];

				  if ((own.length = data.length) > 0) {
					  own.first = own[0];
					  own.last = own[own.length - 1];
				  }
				  else {
					  own.first = null;
					  own.last = null;
				  }
			  };

		class TList extends TObject {
			constructor (type) {
				super();

				this.__className = "TList";

				this._data = [];
				this._type = $.isString(type) ? type : "*";
				this._length = 0;
			}

			free () {
				super.free();

				this.clear();
			}

			valueOf () {
				return this._data;
			}

			clear () {
				this._data = [];
				this._length = 0;

				setData(this, this._data);

				this.call("clear");

				return this;
			}

			sort (func) {
				func = $.isFunction(func, true) ? func : null;

				let list = this.valueOf();

				list.sort.apply(this, func || []);

				setData(this, list);

				this.call("sort");

				return this;
			}

			each (func) {
				if (!$.isFunction(func, true)) return this;

				let list = this.valueOf();

				for (let i = 0, r; i < this.length;) {
					r = func(list[i]);

					if (r === true) this.del(i);
					else if (r === false) break;
					else i++;
				}

				return this;
			}

			set (index, data) {
				index = fmtIndex(index, -1, this.length);

				if (!isType(data, this.type)) return -1;

				this._data[index] = data;

				this.call("set", {index: index, data: data});

				return index;
			}

			del (index) {
				if (this.length === 0) return null;

				index = fmtIndex(index, 0, this.length - 1);

				let list = this.valueOf(),
					result;

				if (index <= 0) result = list.shift();
				else if (index >= this.length - 1) result = list.pop();
				else {
					result = list[index];

					list.splice(index, 1);
				}

				setData(this, list);

				this.call("del", {index: index});

				return result;
			}

			add (data, index) {
				index = fmtIndex(index, this.length, this.length);

				if (!isType(data, this.type)) return -1;

				let list = this.valueOf();

				if (index <= 0) {
					list.unshift(data);

					index = 0;
				}
				else if (index >= this.length) list.push(data);
				else list.splice(index, 0, data);

				setData(this, list);

				this.call("add", {index: index, data: data});

				return index;
			}

			addList (data, index) {
				if ($.isArray(data) && data.length > 0) {
					index = fmtIndex(index, this.length, this.length);

					let _this = this;

					$.each(data, function (d, i) {
						_this.add(d, index + i);
					});
				}

				return this;
			}

			push (data) {
				return this.add(data, this.length);
			}

			pop () { return this.del(this.length); }

			put (data) { return this.add(data, 0); }

			poll () { return this.del(0); }

			get length () {
				return this._length;
			}

			get type () {
				return this._type;
			}
		}

		$.TList = TList;
	})(TObject);

	/*
	 ====================================
	 = 类名: TChinaDate
	 = 功  能: 中文日期类
	 = 类函数：
	 =   toString   = 转换为字符串
	 = 对象属性：
	 =   Year,Month,Day,Term,Zodiac  = 年，月，日，节气，星座
	 =   CYear,CMonth,CDay           = 农历年，农历月，农历日
	 =   IsLeapYear                  = 是否是闰年
	 = 对象函数：
	 =   getTime    = 获取当前毫秒数
	 =   setTime    = 设置当前时间
	 =   toString   = 转换为字符串
	 ====================================
	 */
	(function (TObject) {
		const ct          = {
				  monthInfoDt: new Date(1900, 0, 31),
				  monthInfo:   [
					  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
					  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
					  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
					  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
					  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
					  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0,
					  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
					  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6,
					  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
					  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
					  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
					  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
					  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
					  0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
					  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0
				  ],
				  termInfo:    [
					  0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551, 218072, 240693,
					  263343, 285989, 308563, 331033, 353350, 375494, 397447, 419210, 440795, 462224, 483532, 504758
				  ],
				  tianGan:     ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"],
				  diZhi:       ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"],
				  monthStr:    ["月", "正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"],
				  dayStr:      [
					  ["日", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"],
					  ["初", "十", "廿", "卅", "　"]
				  ],
				  termStr:     [
					  "小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨", "立夏", "小满", "芒种", "夏至",
					  "小暑", "大暑", "立秋", "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至"
				  ],
				  zodiacStr:   ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"]
			  },
			  getTGDZ     = num => {
				  num = $.isNumber(num) ? num : 0;

				  return ct.tianGan[num % 10] + ct.diZhi[num % 12];
			  },
			  getZodiac   = num => ct.zodiacStr[(num - 4) % 12],
			  getTermDate = (year, month) => {
				  return (new Date((31556925974.7 * (year - 1900) + ct.termInfo[month % ct.termInfo.length] * 60000) + Date.UTC(1900, 0, 6, 2, 5))).getUTCDate();
			  },
			  getTerm     = (year, month, date) => {
				  let term = [getTermDate(year, month * 2), getTermDate(year, month * 2 + 1)];

				  for (let i = 0; i < term.length; i++) {
					  if (term[i] == date) return ct.termStr[(month * 2 + i) % ct.termStr.length];
				  }

				  return "";
			  },
			  getYear     = num => getTGDZ(num - 1864),
			  getMonth    = (num, leap) => {
				  return (leap ? "闰" : "") + ct.monthStr[num % ct.monthStr.length];
			  },
			  getDay      = num => {
				  return ct.dayStr[1][(num - num % 10) / 10] + ct.dayStr[0][num % 10 + (num % 10 ? 0 : 10)];
			  };

		class TChinaDate extends TObject {
			constructor (dt) {
				super();

				this.__className = "TChinaDate";

				this._nt = {year: 0, month: 0, day: 0};
				this._dt = new Date();

				this._Year = "";
				this._Month = "";
				this._Day = "";
				this._Term = "";
				this._Zodiac = "";
				this._cYear = "";
				this._cMonth = "";
				this._cDay = "";
				this._IsLeapYear = false;

				this.setTime(dt);
			}

			get Year () {
				return this._Year;
			}

			get Month () {
				return this._Month;
			}

			get Day () {
				return this._Day;
			}

			get Term () {
				return this._Term;
			}

			get Zodiac () {
				return this._Zodiac;
			}

			get CYear () {
				return this._cYear;
			}

			get CMonth () {
				return this._cMonth;
			}

			get CDay () {
				return this._cDay;
			}

			get IsLeapYear () {
				return this._IsLeapYear;
			}

			valueOf () {
				return this.getTime();
			}

			getTime () {
				return this._dt.getTime();
			}

			setTime (dt) {
				const getLeapYearMonth = year => {
						  return ct.monthInfo[year - ct.monthInfoDt.getFullYear()] & 0xf;
					  },
					  getLeapYearDay   = year => {
						  return getLeapYearMonth(year) ? ((ct.monthInfo[year - ct.monthInfoDt.getFullYear()] & 0x10000) ? 30 : 29) : 0;
					  },
					  getTotalYearDay  = year => {
						  let sum   = 348,
							  minfo = ct.monthInfo[year - ct.monthInfoDt.getFullYear()];

						  for (let i = 0x8000; i > 0x8; i >>= 1) sum += (minfo & i) ? 1 : 0;

						  return sum + getLeapYearDay(year);
					  },
					  getTotalMonthDay = (year, month) => {
						  return (ct.monthInfo[year - ct.monthInfoDt.getFullYear()] & (0x10000 >> month)) ? 30 : 29;
					  };

				switch ($.type(dt, true)) {
					case "date":
						this._dt.setTime(dt.getTime());
						break;
					case "number":
						this._dt.setTime(dt);
						break
				}

				let temp   = 0,
					leap   = 0,
					offset = parseInt((this._dt - ct.monthInfoDt) / 86400000),
					nt     = this._nt,
					i;

				nt.year = 0;
				nt.month = 14;
				nt.day = offset + 40;

				for (i = ct.monthInfoDt.getFullYear(); i < ct.monthInfoDt.getFullYear() + ct.monthInfo.length && offset > 0; i++) {
					temp = getTotalYearDay(i);

					offset -= temp;
					nt.month += 12;
				}

				if (offset < 0) {
					offset += temp;
					i--;
					nt.month -= 12;
				}

				nt.year = i;
				this._IsLeapYear = false;

				leap = getLeapYearMonth(i);

				for (i = 1; i < 13 && offset > 0; i++) {
					if (leap > 0 && i == (leap + 1) && !this._IsLeapYear) {
						i--;
						this._IsLeapYear = true;
						temp = getLeapYearDay(nt.year);
					}
					else
						temp = getTotalMonthDay(nt.year, i);

					if (this._IsLeapYear && i == (leap + 1)) this._IsLeapYear = false;

					offset -= temp;

					if (!this._IsLeapYear) nt.month++;
				}

				if (offset < 0) {
					offset += temp;

					i--;
					nt.month--;
				}
				else if (offset == 0 && leap > 0 && i == leap + 1) {
					if (!this._IsLeapYear) {
						i--;
						nt.month--;
					}

					this._IsLeapYear = !this._IsLeapYear;
				}

				this._cYear = getTGDZ(nt.year - 1864);
				this._cMonth = getTGDZ(nt.month);
				this._cDay = getTGDZ(nt.day);

				nt.month = i;
				nt.day = offset + 1;

				this._Year = getYear(nt.year);
				this._Month = getMonth(nt.month, this._IsLeapYear);
				this._Day = getDay(nt.day);
				this._Term = getTerm(nt.year, nt.month, this._dt.getDate());
				this._Zodiac = getZodiac(this._dt.getFullYear());

				return this;
			}

			toString (fmt) {
				let result = $.isString(fmt) ? fmt : "Y年(Z) M月 D T";

				if (/((CY|CM|Y|M|D|T|Z)+)/.test(result)) {
					fmt = {
						"CY+": this.cYear,
						"CM+": this.cMonth,
						"CD+": this.cDay,
						"Y+":  this.Year,
						"M+":  this.Month,
						"D+":  this.Day,
						"T+":  this.Term,
						"Z+":  this.Zodiac
					};

					$.each(fmt, function (d, k) {
						let rxp = new RegExp("(" + k + ")", "g");

						if (rxp.test(result)) result = result.replace(rxp, d + "");
					});
				}

				return result.trim();
			}

			static toString (fmt, date = fmt) {
				if (!$.isDate(date)) date = new Date();

				return (new TChinaDate(date)).toString(fmt);
			}
		}

		$.TChinaDate = TChinaDate;
	})(TObject);

	/*
	 ====================================
	 = 类名: TGuid
	 = 功  能: Guid类
	 = 对象函数：
	 =   New          = 获取新Guid
	 =   toString     = 获取字符串
	 =   toByteArray  = 获取字节数据
	 ====================================
	 */
	class TGuid extends TObject {
		constructor (data) {
			super();

			this.__className = "TGuid";

			this._value = [0, 0, 0, 0, 0];
			this._gd = [4, 2, 2, 2, 6];

			switch ($.type(data, true)) {
				case "string":
					data = data.replace(/^(\{)|(\})$/g, "").split("-");
					break;
				case "array":
					if (data.length === this._gd.length) break;
				default:
					data = [];
					break;
			}

			if (data.length !== this._gd.length) return;

			let fmt = (d, i, t, list) => {
				switch (t) {
					case "string":
						d = "0x" + d;
						break;
					case "number":
						if (!isNaN(d = parseInt(d))) break;
					default:
						return false;
				}

				if (d < 0 || d >= Math.pow(2, 8 * gd[i])) return false;

				list[i] = d;
			};

			if ($.each(data, fmt)) this._value = data;
		}

		valueOf () {
			return this.toString();
		}

		toString () {
			const com   = (s, l) => {
					  while (s.length < l * 2) s = "0" + s;

					  return s;
				  },
				  value = this._value,
				  gd    = this._gd;

			let result = [];

			for (let i = 0; i < value.length; i++) result.push(com(value[i].toString(16), gd[i]));

			return result.join("-");
		}

		toByteArray () {
			const des   = (r, d) => {
					  d.reverse();
					  for (let i = 0; i < d.length; i++) if (d[i].length > 0) r.push(parseInt("0x" + d[i]));
				  },
				  value = this._value;

			let result = [];

			for (let i = 0; i < value.length; i++) des(result, value[i].toString(16).split(/(\w{2})/g));

			return result;
		}

		New () {
			const rmd = l => Math.round(Math.random() * (Math.pow(2, 8 * l) - 1)),
				  gd  = this._gd;

			let result = [];

			for (let i = 0; i < gd.length; i++) result.push(rmd(gd[i]));

			return this;
		}

		static toString () {
			return (new TGuid()).New().toString();
		}

		static toByteArray () {
			return (new TGuid()).New().toByteArray();
		}

		static New () {
			return (new TGuid()).New();
		}
	}

	$.TObject = TObject;
	$.TCache = TCache;
	$.TGuid = TGuid;

	/**
	 * 队列函数
	 *
	 * @param {string} [type=*] 限定类型，对输入内容进行过滤
	 * @returns {object}
	 */
	$.List = type => (new $.TList(type));
	/**
	 * 中文日期函数
	 *
	 * @param {date} [dt=now]
	 * @returns {object}
	 */
	$.ChinaDate = dt => (new $.TChinaDate(dt));
	/**
	 * New Guid
	 *
	 * @returns {object}
	 */
	$.NewGuid = () => (new $.TGuid()).New();
	/**
	 * Empty Guid
	 *
	 * @returns {object}
	 */
	$.EmptyGuid = () => (new $.TGuid());
})(this);