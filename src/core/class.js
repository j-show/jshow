/**
 * ==========================================
 * Name:           jShow's Class Extensions
 * Author:         j-show
 * CreTime:        2019-02-14
 * Description:    Class Extensions
 * Log:
 * 2019-02-14    Init Class
 * 2019-05-20    Format Code to jShow Style Guide
 * ==========================================
 */
($ => {
	/*
	 ====================================
	 = Name: TObject
	 = Info: 基类
	 = Static Method：
	 =   create     = static create function
	 = Object Property:
	 =   className  = get className (readonly)
	 =   errorMax   = error messag limit
	 =   eventMax   = event function limit
	 = Object Method:
	 =   free       = class object free
	 =   on         = bind function by key
	 =   off        = unbind function by key
	 =   call       = call function
	 =   getError   = get error message by index
	 =   setError   = set error message by data
	 =   lastError  = get last error message
	 =   clearError = clear error message
	 ====================================
	 */
	class TObject {
		constructor () {
			this.__className = "TObject";

			this.__error__    = [];
			this.__errorMax__ = 5;
			this.__event__    = {};
			this.__eventMax__ = 99;

			if (this.create) this.create(...arguments);
		}

		create () {}

		free () {
			this.__error__ = null;
			this.__event__ = null;
		}

		valueOf () {
			return this;
		}

		toString () {
			return `${this.className} Object`;
		}

		addListenEvent (key, ...func) {
			if (!$.isString(key)) return this;
			if (!$.isArray(func, true)) return this;

			const each = (own, list, num, max) => {
				for (let i = num, f; i < list.length; i++) {
					f = list[i];

					switch ($.type(f, true)) {
						case "function":
							own.push(f);
							if (own.length > max) own.pop();
							break;
						case "array":
							each(own, f, 0, max);
							break;
					}
				}
			};

			let list = this.__event__[key];

			if (!list) {
				list                = [];
				this.__event__[key] = list;
			}

			each(list, func, 1, this.eventMax);

			return this;
		}

		removeListenEvent (key, func) {
			try {
				if (arguments.length < 1) {
					this.__event__ = {};
					return;
				}

				if (!$.isString(key)) return;

				if (!$.isFunction(func)) {
					this.__event__[key] = [];
					return;
				}

				let list = this.__event__[key] || [];

				for (let i = 0; i < list.length;) {
					if (Object.is(func, list[i])) list.splice(i, 1);
					else i += 1;
				}
			}
			finally {
				return this;
			}
		}

		on (key, ...func) {
			return this.addListenEvent(key, ...func);
		}

		off (key, func) {
			return this.removeListenEvent(key, ...func);
		}

		async call (key, ...arg) {
			const dtd  = $.Deferred(true);
			const list = this.__event__[key] || [];

			try {
				let owner = arg.length > 0 ? arg[0] : this;

				for (let i = 0, f; i < list.length; i++) {
					f = list[i];
					switch ($.type(f, true)) {
						case "function":
							list[i].apply(owner, arg);
							break;
						case "asyncfunction":
							await list[i].apply(owner, arg);
							break;
					}
				}

				dtd.resolve(key);
			}
			catch (e) {
				dtd.reject(e);
			}

			return dtd.promise();
		}

		getError (index) {
			const list = this.__error__;

			if (list.length < 1) return null;
			if (!$.isNumber(index, {min: 0, max: list.length - 1})) return null;

			return list[index];
		}

		setError (level, code = level, msg = code) {
			if (!$.has(level, ["log", "info", "error"])) level = "log";
			if (!$.isNumber(code)) code = -1;
			if (!$.isString(msg)) msg = "";

			const list = this.__error__;
			const max  = this.errorMax;

			let err = {level, code, msg};

			while (list.length > max) list.shift();
			list.push(err);

			this.call("error", err);

			return err;
		}

		lastError () {
			const list = this.__error__;

			if (list.length < 1) return null;

			return list[list.length - 1];
		}

		clearError () {
			this.__error__ = [];

			return this;
		}

		get [Symbol.toStringTag] () {
			return this.className;
		}

		get className () {
			return this.__className;
		}

		get errorMax () {
			return this.__errorMax__;
		}

		set errorMax (value) {
			if (!$.isNumber(value, {min: 1, max: 99})) return;
			if (value === this.errorMax) return;

			this.__errorMax__ = value;

			const list = this.__error__;

			while (list.length > value) list.shift();
		}

		get eventMax () {
			return this.__eventMax__;
		}

		set eventMax (value) {
			if (!$.isNumber(value, {min: 1, max: 99})) return;
			if (value === this.__eventMax__) return;

			this.__eventMax__ = value;

			const list = this.__event__;

			$.each(list, d => {
				while (d.length > value) d.shift();
			});
		}

		static create () {
			return new TObject();
		}
	}

	/*
	 ====================================
	 = Name: TSeal
	 = Info: The sealed class is mounted in prototype way, and the method of sealing is not in accordance with the specification
	 =
	 = @WARN: this class like TObject
	 =
	 = Object Method:
	 =   clone     = copy this object
	 =   create    = create object, like constructor
	 ====================================
	 */
	const TSeal = (() => {
		const clsError = function initClassError () {
			if (this.getError || this.setError || this.lastError) return;

			this.__error__ = [];
			this.errorMax  = 5;
			this.getError  = function getError (index = -1) {
				const list = this.__error__;
				let num    = Number(index);

				if (list.length < 1) return null;

				if (!$.isNumber(num, {min: 0, max: list.length - 1})) num = list.length - 1;

				return list[num];
			};
			this.setError  = function setError (level, code = level, msg = code) {
				if (!$.has(level, ["log", "info", "error"])) level = "log";
				if (!$.isNumber(code)) code = -1;
				if (!$.isString(msg)) msg = "";

				const list = this.__error__;
				const max  = this.errorMax;

				let err = {level, code, msg};

				while (list.length >= max) list.shift();
				list.push(err);

				this.call("error", [err]);

				return err;
			};
			this.lastError = function () {
				const list = this.__error__;

				if (list.length < 1) return null;

				return list[list.length - 1];
			};
		};
		const clsEvent = function initClassEvent () {
			if (this.on || this.off || this.call) return;

			this.__event__ = {};
			this.eventMax  = 99;
			this.on        = function (key, ...func) {
				if (!$.isString(key)) return this;
				if (!$.isArray(func, true)) return this;

				const each = (own, list, num, max) => {
					for (let i = num, f; i < list.length; i++) {
						f = list[i];

						switch ($.type(f, true)) {
							case "function":
								own.push(f);
								if (own.length > max) own.pop();
								break;
							case "array":
								each(own, f, 0, max);
								break;
						}
					}
				};

				let list = this.__event__[key];

				if (!list) {
					list                = [];
					this.__event__[key] = list;
				}

				each(list, func, 1, this.eventMax);

				return this;
			};
			this.off       = function (key, func) {
				try {
					if (arguments.length < 1) {
						this.__event__ = {};
						return;
					}

					if (!$.isString(key)) return;

					if (!$.isFunction(func)) {
						this.__event__[key] = [];
						return;
					}

					let list = this.__event__[key] || [];

					for (let i = 0; i < list.length;) {
						if (Object.is(func, list[i])) list.splice(i, 1);
						else i += 1;
					}
				}
				finally {
					return this;
				}
			};
			this.call      = async function (key, ...arg) {
				const dtd  = $.Deferred(true);
				const list = this.__event__[key] || [];

				try {
					let owner = arg.length > 0 ? arg[0] : this;

					for (let i = 0, f; i < list.length; i++) {
						f = list[i];
						switch ($.type(f, true)) {
							case "function":
								list[i].apply(owner, arg);
								break;
							case "asyncfunction":
								await list[i].apply(owner, arg);
								break;
						}
					}

					dtd.resolve(key);
				}
				catch (e) {
					dtd.reject(e);
				}

				return dtd.promise();
			};
		};

		function TSeal () {}

		TSeal.extend    = function (childAPI) {
			if (!$.isObject(childAPI)) throw new Error(console.error("[TSeal] object is null"));

			const className   = childAPI.className || "TSeal";
			const parentClass = TSeal;
			const initChild   = function initClass (...arg) {
				clsError.call(this);
				clsEvent.call(this);

				if (this.create) this.create.apply(this, arg);

				return this;
			};

			let childClass = null;

			eval(`childClass=function ${className}(...arg){return initChild.apply(this,arg);}`);

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
			create () { return this; },
			free () {},
			clone () { return $.clone(this, true); },
			valueOf () { return this; },
			toString () { return `${this.className} Object`; },
			get [Symbol.toStringTag] () { return this.className; }
		};

		return TSeal;
	})();

	/*
	 ====================================
	 = Name:   TCache
	 = Info：  Perform cache looping by Buffer
	 = Extend：TObject
	 = Static Method:
	 =   create    = static create function
	 = Object Property:
	 =   max       = cache buffer limit
	 =   index     = real data start position of cache
	 =   length    = real data length
	 =   offset    = block cache start position of cache
	 =   surplus   = surplus block length
	 = Object Method:
	 =   valueOf   = cache buffer
	 =   clear     = clear data
	 =   resize    = resize data position
	 =   push      = push data to cache
	 =   remove    = remove data to cache
	 =   parse     = parse real data, extend must rewrite this method
	 = Object Event:
	 =   data      = output data event
	 =   discard   = discard data event
	 ====================================
	 */
	class TCache extends TObject {
		/**
		 * 缓存初始化，可以设置最大缓存
		 *
		 * @param {number} [size=128] 最大缓存，单位字节(取值32 <= size <= 10K)
		 */
		create (size = 128) {
			this.__className = "TCache";

			this._max    = $.isNumber(size, {min: 32, max: 10240}) ? size : 128;
			this._index  = 0;
			this._length = 0;

			this._cache = Buffer.alloc(this._max);
		}

		free () {
			this._cache = null;

			super.free();
		}

		valueOf () {
			return this._cache;
		}

		/**
		 * 返回缓存内容
		 *
		 * @param {string} [encoding=utf8] 返回字符串编码形式
		 * @returns {string}
		 */
		toString (encoding = "utf8") {
			return this._cache.toString(encoding, this.index, this.offset);
		}

		/**
		 * 调准数内容，返回可用剩余空间大小
		 *
		 * @param {number} [len=0] 调整数字，=0 时进行数据移动，<surplus 时移动index
		 * @returns {number}
		 */
		resize (len = 0) {
			let val = $.isNumber(len, {min: 0}) ? len : 0;

			if (val === 0) {
				const data = this._cache;

				if (this.length > 0) data.copy(data, 0, this.index, this.offset);

				this._index = 0;
			}
			else if (val < this.surplus) {
				this._index += len;
				this._length -= len;
			}
			else {
				this._index  = 0;
				this._length = 0;
			}

			return this.surplus;
		}

		clear () {
			this._index  = 0;
			this._length = 0;

			return this;
		}

		/**
		 * 循环读取数据buf，并同步调用parse函数进行数据识别及输出
		 *
		 * @param {buffer} buf
		 * @returns {TCache}
		 */
		push (buf) {
			const data = this._cache;

			let offset = buf.byteOffset;
			let count  = buf.byteLength;
			let write  = 0;

			while (count > 0) {
				write = this.surplus;
				if (write < 1) write = this.resize();

				write = Math.min(count, write);
				if (write < 1) {
					this.call("discard", data.slice(this.index, this.offset), true);
					write = this.resize(this.max);
				}

				buf.copy(data, this.offset, offset, offset + write);
				this._length += write;

				offset += write;
				count -= write;

				write = this.parse();
				if (write > 0) {
					this.call("data", data.slice(this.index, write + this.index));
					this.resize(write);
				}
				else if (write < 0) {
					this._index += -(write);
				}
			}

			return this;
		}

		/**
		 * 删除数据，允许删除数据中段
		 *
		 * @param {object|number} opt
		 *    @param {number} [opt.start] 删除起始位置
		 *    @param {number} [opt.size] 删除长度
		 * @returns {TCache}
		 */
		remove (opt) {
			let {
					start = 0,
					len   = this.length
				} = opt;

			if ($.isNumber(opt, {min: 0})) len = opt;

			start = Number(start);
			len   = Number(len);

			if (isNaN(len) || len < 1) return this;

			if (isNaN(start)) start = 0;

			if (start < 0) start += this.length;
			if (start < 0 || start >= this.length) return this;

			if (start > 0) {
				let end = start + len;

				if (this.length - end > 0) {
					let data = this._cache;

					data.copy(data, start + this.index, end + this.index, this.length - end);
				}

				this._length -= len;
			}
			else {
				this.resize(len);
			}

			if (size !== 0) this.resize(size);

			return this;
		}

		/**
		 * 数据解析，需要在子类中改下，否则输出所有数据内容，不需要处理时，返回0
		 * >0 时，输出返回数量的数据，触发data事件
		 * <0 时，删除返回数量的数据
		 *
		 * @returns {number}
		 */
		parse () {
			return this.length;
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
	 = Name:   TList
	 = Info:   Queue class by Array, you must limit type when init class
	 = Extend：TObject
	 = Object Propertry：
	 =   length    = data length
	 =   type      = limit tyoe
	 =   first     = first data
	 =   last      = last data
	 = Object Method：
	 =   clear     = clear data
	 =   sort      = sort data，can custom sort function
	 =   each      = each data, if callback return is false, delete item
	 =   set       = set data, check data type
	 =   del       = delete data
	 =   add       = add data, check data type
	 =   addList   = add datas by list
	 =   push      = add data, from list tail
	 =   pop       = get and delete data, from list tail
	 =   put       = add data from list head
	 =   poll      = get and delete data, from list head
	 ====================================
	 */
	const TList = (function (TObject) {
		const isType   = (obj, type) => {
			if (!type || type === "*") return true;

			let otype = $.type(obj, true);

			if (type === otype) return true;

			switch (type) {
				case "date":
					if (otype === "TChinaDate" || obj.className === "TChinaDate") return true;
					break;
			}

			return false;
		};
		const fmtIndex = (index, def, max) => {
			let num = $.isNumber(index) ? index : def;

			if (num < 0) num = -1;
			else if (num >= max) num = max;

			return num;
		};
		const addData  = (own, value, index) => {
			const len = own.length - 1;

			if (index !== len) {
				for (let i = len; i >= index; i--) own[i] = own[i - 1];
			}

			own[index] = value;
		};
		const delData  = (own, index, old) => {
			const len = own.length - 1;

			if (index !== len) {
				for (let i = index; i <= len; i++) own[i] = own[i + 1];
			}

			delete own[old];
		};

		class TList extends TObject {
			create (type) {
				this.__className = "TList";

				this._value = [];
				this._type  = "*";

				if ($.isString(type)) this._type = type;
			}

			free () {
				this._value = null;

				super.free();
			}

			valueOf () {
				return this._value;
			}

			toString () {
				return this._value.toString();
			}

			[Symbol.iterator] () {
				const data = this._value;

				return (function* () {
					for (let i = 0; i < data.length; i++) {
						yield data[i];
					}
				})();
			}

			get length () {
				return this._value.length;
			}

			get type () {
				return this._type;
			}

			get first () {
				const data = this._value;

				if (data.length < 1) return null;

				return data[0];
			}

			get last () {
				const data = this._value;

				if (data.length < 1) return null;

				return data[data.length - 1];
			}

			clear () {
				const data = this._value;

				for (let i = 0; i < data.length; i++) delete this[i];

				this._value = [];

				this.call("clear");

				return this;
			}

			sort (callback) {
				let func = callback;

				if (!$.isFunction(func)) func = null;

				const data = this._value;

				data.sort.apply(this, func || []);

				for (let i = 0; i < data.length; i++) this[i] = data[i];

				this.call("sort");

				return this;
			}

			each (func) {
				if (!$.isFunction(func)) return this;

				let list = this.valueOf();

				for (let i = 0, r; i < this.length;) {
					r = func(list[i]);

					if (r === true) this.del(i);
					else if (r === false) break;
					else i++;
				}

				return this;
			}

			set (index, value) {
				if (!isType(value, this.type)) return -1;

				const data = this._value;

				if (!$.isNumber(index, {min: 0, max: data.length - 1})) return -1;

				data[index] = value;
				this[index] = value;

				this.call("set", {index: index, data: value});

				return index;
			}

			del (index) {
				if (this.length === 0) return null;

				const data = this._value;
				let len    = data.length - 1;

				if (!$.isNumber(index, {min: 0, max: len})) return -1;

				let item;

				if (index === len) {
					item = data.pop();
				}
				else if (index === 0) {
					item = data.shift();
				}
				else {
					item = data[inde];
					data.splice(index, 1);
				}

				delData(this, index, len);

				this.call("del", {index: index, data: item});

				return item;
			}

			add (value, index) {
				if (!isType(value, this.type)) return -1;

				let num  = fmtIndex(index, this.length, this.length);
				let data = this._value;
				let len  = data.length;

				if (num <= 0) {
					data.unshift(value);

					num = 0;
				}
				else if (num >= len) {
					data.push(value);

					num = len;
				}
				else {
					data.splice(num, 0, value);
				}

				addData(this, value, num);

				this.call("add", {index: num, data: value});

				return num;
			}

			addList (value, index, desc = false) {
				if (!$.isArray(value, {min: 1})) return this;

				const data = value;
				if (desc === true) data.reverse();

				let num = this.length;
				num     = fmtIndex(index, num, num);

				for (let i = 0; i < data.length; i++) this.add(data[i], num + i);

				return this;
			}

			push (...value) {
				return this.addList(value, this.length);
			}

			pop () { return this.del(this.length); }

			put (...value) { return this.addList(value, 0, true); }

			poll () { return this.del(0); }

			static create (type) {
				return (new TList(type));
			}
		}

		return TList;
	})(TObject);

	/*
	 ====================================
	 = Name:   TChinaDate
	 = Info:   Chinese date
	 = Extend: TObject
	 = Static Method：
	 =   toString   = conver to string
	 = Object Propertry：
	 =   Year        = year
	 =   Month       = month
	 =   Day         = day
	 =   Term        = term of chinese date
	 =   Zodiac      = zodizc of chinese date
	 =   CYear       = year of chinese date
	 =   CMonth      = month of chinese date
	 =   CDay        = day of chinese date
	 =   IsLeapYear  = is leap year
	 = Object Method：
	 =   getTime    = get object millisecond
	 =   setTime    = set time
	 =   toString   = output format string by fmt
	 ====================================
	 */
	const TChinaDate = (function (TObject) {
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
			create (dt) {
				this.__className = "TChinaDate";

				this._nt = {year: 0, month: 0, day: 0};
				this._dt = new Date();

				this._Year       = "";
				this._Month      = "";
				this._Day        = "";
				this._Term       = "";
				this._Zodiac     = "";
				this._cYear      = "";
				this._cMonth     = "";
				this._cDay       = "";
				this._IsLeapYear = false;

				this.setTime(dt);
			}

			free () {
				this._nt = null;

				super.free();
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

			toString (fmt) {
				let result = $.isString(fmt) ? fmt : "Y年(Z) M月 D T";

				if (/((CY|CM|CD|CT|CZ|Y|M|D)+)/.test(result)) {
					fmt = {
						"CY+": this.cYear,
						"CM+": this.cMonth,
						"CD+": this.cDay,
						"CT+": this.Term,
						"CZ+": this.Zodiac,
						"Y+":  this.Year,
						"M+":  this.Month,
						"D+":  this.Day
					};

					$.each(fmt, function (d, k) {
						let rxp = new RegExp("(" + k + ")", "g");

						if (rxp.test(result)) result = result.replace(rxp, d + "");
					});
				}

				return result.trim();
			}

			getTime () {
				return this._dt.getTime();
			}

			setTime (dt) {
				const getLeapYearMonth = year => {
					return ct.monthInfo[year - ct.monthInfoDt.getFullYear()] & 0xf;
				};
				const getLeapYearDay   = year => {
					return getLeapYearMonth(year) ? ((ct.monthInfo[year - ct.monthInfoDt.getFullYear()] & 0x10000) ? 30 : 29) : 0;
				};
				const getTotalYearDay  = year => {
					let sum   = 348,
						minfo = ct.monthInfo[year - ct.monthInfoDt.getFullYear()];

					for (let i = 0x8000; i > 0x8; i >>= 1) sum += (minfo & i) ? 1 : 0;

					return sum + getLeapYearDay(year);
				};
				const getTotalMonthDay = (year, month) => {
					return (ct.monthInfo[year - ct.monthInfoDt.getFullYear()] & (0x10000 >> month)) ? 30 : 29;
				};

				switch ($.type(dt, true)) {
					case "date":
						this._dt.setTime(dt.getTime());
						break;
					case "number":
						this._dt.setTime(dt);
						break;
				}

				let nt     = this._nt;
				let temp   = 0;
				let offset = parseInt((this._dt - ct.monthInfoDt) / 86400000);
				let i      = 0;

				nt.year  = 0;
				nt.month = 14;
				nt.day   = offset + 40;

				(({monthInfoDt, monthInfo}) => {
					let len = monthInfoDt.getFullYear() + monthInfo.length;

					for (i = monthInfoDt.getFullYear(); i < len && offset > 0; i++) {
						temp = getTotalYearDay(i);

						offset -= temp;
						nt.month += 12;
					}

					if (offset < 0) {
						offset += temp;
						i--;
						nt.month -= 12;
					}
				})(ct);

				nt.year          = i;
				this._IsLeapYear = false;

				let leap = getLeapYearMonth(nt.year);
				if (leap < 1) throw "TChinaDate setTime Error";

				this._IsLeapYear = (leap => {
					let _leap = false;

					for (i = 1; i < 13 && offset > 0; i++) {
						if (i === leap && !_leap) {
							i--;
							_leap = true;
							temp  = getLeapYearDay(nt.year);
						}
						else {
							temp = getTotalMonthDay(nt.year, i);
						}

						if (_leap && i === leap) _leap = false;

						offset -= temp;

						if (!_leap) nt.month++;
					}

					if (offset < 0) {
						offset += temp;

						i--;
						nt.month--;
					}
					else if (offset === 0 && i === leap) {
						if (!_leap) {
							i--;
							nt.month--;
						}

						_leap = !_leap;
					}

					return _leap;
				})(leap + 1);

				this._cYear  = getTGDZ(nt.year - 1864);
				this._cMonth = getTGDZ(nt.month);
				this._cDay   = getTGDZ(nt.day);

				nt.month = i;
				nt.day   = offset + 1;

				this._Year   = getYear(nt.year);
				this._Month  = getMonth(nt.month, this._IsLeapYear);
				this._Day    = getDay(nt.day);
				this._Term   = getTerm(nt.year, nt.month, this._dt.getDate());
				this._Zodiac = getZodiac(this._dt.getFullYear());

				return this;
			}

			static toString (fmt, date = fmt) {
				if (!$.isDate(date)) date = new Date();

				return (new TChinaDate(date)).toString(fmt);
			}
		}

		return TChinaDate;
	})(TObject);

	/*
	 ====================================
	 = Name:   TGuid
	 = Info:   simulate guid
	 = Extend: TObject
	 = Static Method:
	 =   toByteArray  = conver to unit8array
	 =   New          = get TGuid object with random value
	 =   Empty        = get TGuid object with fill 0
	 = Object Method：
	 =   New          = set random value
	 =   toString     = conver to string
	 =   toByteArray  = conver to unit8array
	 ====================================
	 */
	class TGuid extends TObject {
		create (value) {
			this.__className = "TGuid";

			this._value = [0, 0, 0, 0, 0];
			this._gd    = [4, 2, 2, 2, 6];

			let data = [];

			switch ($.type(value, true)) {
				case "string":
					data = value.replace(/^\{|\}$/g, "").split("-");
					data = data.map(v => parseInt(`0x${v}`));
					break;
				case "array":
					if (data.length === this._gd.length) data = value;
					break;
			}

			if (data.length !== this._gd.length) return;

			for (let i = 0, gd = this._gd, d; i < data.length; i++) {
				d = data[i];

				if (!$.isNumber(d, {min: 0, max: (2 ** (8 * gd[i])) - 1})) return;
				data[i] = d;
			}

			this._value = data;
		}

		free () {
			this._value = null;
			this._gd    = null;

			super.free();
		}

		valueOf () {
			return this.toString();
		}

		toString () {
			const com  = (s, l) => {
				while (s.length < l * 2) s = "0" + s;

				return s;
			};
			const data = this._value;
			const gd   = this._gd;

			let result = [];

			for (let i = 0, d; i < data.length; i++) {
				d = data[i].toString(16);
				d = com(d, gd[i]);
				result.push(d);
			}

			return result.join("-");
		}

		toByteArray () {
			const des  = (r, d) => {
				d.reverse();
				for (let i = 0; i < d.length; i++) if (d[i].length > 0) r.push(parseInt("0x" + d[i]));
			};
			const data = this._value;

			let result = [];

			for (let i = 0, d; i < data.length; i++) {
				d = data[i].toString(16);

				des(result, d.split(/\w{2}/g));
			}

			return result;
		}

		New () {
			const rmd = l => Math.round(Math.random() * ((2 ** (8 * l)) - 1));
			const gd  = this._gd;

			let result = [];

			for (let i = 0; i < gd.length; i++) result.push(rmd(gd[i]));

			this._value = result;

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

		static Empty () {
			return (new TGuid());
		}
	}

	const api = {
		TObject,
		TSeal,
		TCache,
		TList,
		TChinaDate,
		TGuid,
		/**
		 * 队列函数
		 *
		 * @param {string} [type=*] 限定类型，对输入内容进行过滤
		 * @returns {object}
		 */
		List (type) {
			return new $.TList(type);
		},
		/**
		 * 中文日期函数
		 *
		 * @param {date} [dt=now]
		 * @returns {object}
		 */
		ChinaDate (dt) {
			return new $.TChinaDate(dt);
		},
		/**
		 * New Guid
		 *
		 * @returns {object}
		 */
		NewGuid () {
			return $.TGuid.New();
		},
		/**
		 * Empty Guid
		 *
		 * @returns {object}
		 */
		EmptyGuid () {
			return $.TGuid.Empty();
		}
	};

	jShow = {...$, ...api};
	$     = jShow;
})(jShow);