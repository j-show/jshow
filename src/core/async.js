/**
 * ==========================================
 * Name:           jShow's Async Extensions
 * Author:         j-show
 * CreTime:        2019-02-20
 * Description:    Async Extensions
 * Log:
 * 2019-02-20    Init Async
 * ==========================================
 */
($ => {
	/*
	 ====================================
	 = 类名: TCallback
	 = 功  能: 回调类
	 = 对象函数：
	 =   lock        = 锁定状态
	 =   unlock      = 去除锁定
	 =   add         = 添加函数
	 =   del         = 删除指定函数
	 =   fire        = 触发调用
	 =   fireWith    = 触发调用,改变this指向
	 =   empty       = 清空回调列表
	 =   unique      = 去除重复函数
	 =   has         = 检测是否存在指定函数
	 ====================================
	 */
	class TCallback extends TObject {
		constructor (opt, limit, callback) {
			super();

			this.__className = "TCallback";

			this._locked = false;
			this._limit = limit;
			this._length = 0;

			this.__func = [];
			this.__arg = null;
			this.__opt = opt;
			this.__callback = callback || null;

			const getFuncs  = (list, callback) => {
					  $.each(list, (d, k, t) => {
						  switch (t) {
							  case "function":
								  callback(d);
								  break;
							  case "array":
								  if (d.length > 0) getFuncs(d, callback);
								  break;
						  }
					  }, true);
				  },
				  eachFuncs = (list, callback) => {
					  let i = 0;

					  while (i < list.length) {
						  if (callback(i, list[i]) !== false) i++;
					  }
				  },
				  fireFuncs = (list, data, once, done, prog) => {
					  if (list.length < 1) return done;

					  eachFuncs(list, (i, f) => {
						  f.apply(data[0], data[1]);

						  if (once) list.splice(i, 1);
						  if (prog) prog();
						  if (once) return false;
					  });

					  if (done) done();

					  return null
				  };

			this.__getFuncs = getFuncs;
			this.__eachFuncs = eachFuncs;
			this.__fireFuncs = fireFuncs;
		}

		get limit () {
			return this._limit;
		}

		get length () {
			return this._length;
		}

		get locked () {
			return this._locked;
		}

		lock () {
			return this._locked = true;
		}

		unlock () {
			return this._locked = false;
		}

		on () {
			if (this.locked) return this;

			let opt  = this.__opt,
				func = this.__func,
				arg  = this.__arg;

			this.__getFuncs(arguments, d => {
				func.push(d);
				if (func.length > this.__limit) func.pop();
			});
			this._length = func.length;

			if (opt.unique) this.unique();
			if (opt.memory && opt.fire && arg) this.__fireFuncs(func, arg, opt.once, this.__callback, d => this._length = func.length);

			return this;
		}

		off () {
			if (this.locked) return this;

			let _this = this,
				func  = this.__func;

			if (arguments.length == 0) func = this.__func = [];
			else {
				_this.__getFuncs(arguments, d => {
					_this.__eachFuncs(func, (i, f) => {
						if (Object.is(d, f)) {
							func.splice(i, 1);
							return false;
						}
					})
				});
			}

			this._length = func.length;

			return this;
		}

		has (func) {
			return this.__func.indexOf(func) !== -1;
		}

		unique () {
			if (!this._locked) {
				this._length = (this.__func = Array.from(new Set(this.__func))).length;
			}

			return this;
		}

		fire () {
			return this.fireWith(this, arguments);
		}

		fireWith (own, args, done) {
			if (arguments.length < 2) args = [];
			if (arguments.length < 1) own = this;

			let opt = this.__opt,
				arg;

			this.__arg = arg = [own, args.slice ? args.slice() : args];
			if (opt.memory && !opt.fire) {
				opt.fire = true;
				if (opt.limit) this.__arg = null;
			}
			else {
				let func = this.__func;

				this.__fireFuncs(func, arg, opt.once, done, d => this.length = func.length);
				if (this.__callback) this.__callback.apply(arg[0], arg[1]);
			}

			return this;
		}
	}

	/*
	 ====================================
	 = 类名: TDeferred
	 = 功  能: 异步类(观察者模式)
	 = 对象函数：
	 =   empty       = 清空回调列表
	 =   promise     = 操作对象
	 =   resolve     = 触发成功
	 =   reject      = 触发失败
	 =   alarm       = 触发警告
	 =   notify      = 触发进度
	 =   on          = 绑定事件
	 =   off         = 解除绑定
	 = 对象事件:
	 =   done        = 成功
	 =   fail        = 失败
	 =   warn        = 警告
	 =   progress    = 进度
	 =   always      = 结束
	 ====================================
	 */
	class TDeferred extends TObject {
		constructor (limit, callback) {
			super();

			let _this  = this,
				_state = _this.STATE,
				_event = _this.__event = {
					done:     $.Callback(limit).fire(),
					fail:     $.Callback(limit).fire(),
					warn:     $.Callback(limit).fire(),
					progress: $.Callback(limit).fire(),
					always:   $.Callback(limit, callback).fire()
				},
				_action = _this.__action = {
					resolve: _event.done,
					reject:  _event.fail,
					alarm:   _event.warn,
					notify:  _event.progress
				},
				_promise = _this.__promise = {
					state:   _state.inited,
					on:      function () {
						_this.on.apply(_this, arguments);
						return this;
					},
					off:     function () {
						_this.off.apply(_this, arguments);
						return this;
					},
					promise: function () { return _this.promise.apply(_this, arguments); }
				};

			_this._state = _state.pending;
			_this.__owner = void(0);
			_this.__surp = 0;

			_event.done.on(e => {
				_this.__promise.state = _this._state = _state.resolved;
				_event.fail.lock();
				_event.warn.lock();
				_event.progress.lock();
			});
			_event.fail.on(e => {
				_this.__promise.state = _this._state = _state.rejected;
				_event.done.lock();
				_event.warn.lock();
				_event.progress.lock();
			});

			$.each(_event, (d, k) => {
				_promise[k] = _this[k] = function () {
					d.on(Array.from(arguments));
					return this;
				};
			});

			$.each(_action, (d, k) => {
				_this[k] = function () {
					_this[k + "With"](_this, arguments);

					return this;
				};
				_this[k + "With"] = function (own, arg) {
					own = own || _this.__owner;
					d.fireWith(own, arg);

					if (_this.state == k) _event.always.fireWith(own, arg);
					else if (k == "notify" && --_this.__surp < 1) _this["resolveWith"](own, arg);

					return this;
				};
			});
		}

		get state () {
			return this._state;
		}

		get STATE () {
			return {
				inited:   0,
				pending:  1,
				resolved: "resolve",
				rejected: "reject"
			};
		}

		on (tag, callback) {
			if (this.__event[tag]) this.__event[tag].on(callback);

			return this;
		}

		off (tag) {
			if (arguments.length == 0) $.each(this.__event, d => d.off());
			else if (this.__event[tag]) this.__event[tag].off();

			return this;
		}

		promise (own, max) {
			const STATE = this.STATE;

			switch (this.state) {
				case STATE.inited:
				case STATE.pending:
					this.__promise.state = this._state = STATE.pending;

					if (arguments.length == 1 && $.isNumber(own)) max = own;
					max = $.isNumber(max, {min: 0}) ? max : this.__surp;

					this.__owner = own === null ? void(0) : own;
					this.__surp = max > 0 ? max : 0;
					break;
			}

			return this.__promise;
		}
	}

	/**
	 * 异步链式对象,扩展Promise对象
	 *
	 */
	(Promise => {
		let prop = Promise.prototype;

		prop.end = function (onFulfilled, onRejected) {
			this.then(onFulfilled, onRejected)
				.catch(function (reason) {
					// 抛出一个全局错误
					setTimeout(() => { throw reason }, 0);
				});
		};
		prop.on = function (tag, callback) {
			switch (tag) {
				case "done":
				default:
					return this.then(callback);
				case "fail":
					return this.catch(callback);
				case "always":
					let P = this.constructor;

					return this.then(
						value => P.resolve(callback()).then(() => value),
						reason => P.resolve(callback()).then(() => { throw reason })
					);
				case "warn":
					if (this.__simple) this.__warn.on(callback);

					return this;
				case "progress":
					if (this.__simple) this.__progress.on(callback);

					return this;
			}
		};
		prop.done = function (callback) { return this.on("done", callback); };
		prop.fail = function (callback) { return this.on("fail", callback); };
		prop.always = prop.finally = function (callback) { return this.on("always", callback); };
		prop.warn = function (callback) { return this.on("warn", callback); };
		prop.progress = function (callback) { return this.on("progress", callback); };
		prop.resolve = function () {
			let arg = Array.prototype.push.apply([], arguments);

			this.__resolve.call(this, arg.length === 1 ? arg[0] : arg);

			return this;
		};
		prop.reject = function () {
			let arg = Array.prototype.push.apply([], arguments);

			this.__reject.call(this, arg.length === 1 ? arg[0] : arg);

			return this;
		};
		prop.alarm = function () {
			let arg = Array.prototype.push.apply([], arguments);

			this.__warn.fireWith(this, arg.length === 1 ? arg[0] : arg);

			return this;
		};
		prop.notify = function () {
			let arg = Array.prototype.push.apply([], arguments);

			if (this.__simple) {
				if (this.__limit > 0) {
					arg = arg.length === 1 ? arg[0] : arg;
					this.__progress.fireWith(this, arg);

					if (--this.__limit < 1) {
						this.__simple = false;
						this.__resolve.call(this, arg);
					}
				}
			}

			return this;
		};
		prop.promise = function (max) {
			if (this.__simple && $.isNumber(max, {min: 1})) this.__limit = max;
			else this.__simple = false;

			return this;
		};

		Promise.create = function (simple, callback) {
			let obj, done, fail;

			obj = new Promise(function (resolve, reject) {
				done = resolve;
				fail = reject;
			});
			obj.__resolve = done;
			obj.__reject = fail;

			obj.__simple = simple === true;
			if (obj.__simple) {
				obj.__warn = $.Callback(100).fire();
				obj.__progress = $.Callback(100).fire();
			}

			if (!callback) callback = simple;
			if (typeof(callback) === "function") callback(obj);

			return obj;
		};

		return Promise;
	})(Promise);

	/**
	 * 回调对象
	 *
	 * @param {string} [flag=once memory limit] 工作模式
	 * @param {number} [limit=50] 回调列表数量
	 * @param {function} callback 结束回调
	 * @returns {object}
	 */
	$.Callback = function (flag, limit, callback) {
		switch (arguments.length) {
			case 1:
				switch (typeof(flag)) {
					case "number":
						limit = flag;
						break;
					case "function":
						callback = flag;
						break;
				}
				break;
			case 2:
				if ($.isFunction(limit)) callback = limit;
				if ($.isNumber(flag)) limit = flag;
				break;
		}
		if (!$.isString(flag)) flag = "once memory limit";
		limit = $.isNumber(limit, {min: 1}) ? limit : 50;
		if (!$.isFunction(callback)) callback = null;

		let opt = {};

		flag.split(" ").forEach(d => opt[d] = true);

		if (opt.memory && !opt.limit) opt.fire = true;

		return new TCallback(
			{
				once:   opt.once === true,
				memory: opt.memory === true,
				limit:  opt.limit === true,
				unique: opt.unique === true,
				fire:   opt.fire === true
			},
			opt.simple === true ? 1 : parseInt(limit),
			callback);
	};

	/**
	 * 异步观察者对象
	 *
	 * @param {boolean} [simple=false] 是否用简单模式
	 * @param {function} [callback] 结束回调
	 * @returns {object}
	 */
	$.Deferred = function (simple, callback) {
		if (arguments.length == 1) callback = simple;

		if (!$.isFunction(callback)) callback = null;

		if (simple === true) return Promise.create(true, callback);
		else return (new TDeferred($.isNumber(simple, {min: 1}) ? simple : 50, callback));
	};

	/**
	 * 异步链式对象,扩展Promise对象
	 *
	 */
	$.Promise = callback => Promise.create(callback);

	/**
	 * Generator函数转Promise对象
	 *
	 * @param {Generator} gen 函数主体，必须是Generator函数
	 * @param {*} [data] 带入参数
	 * @param {*} [owner] 带入所有者
	 * @returns {object}
	 */
	$.Async = function (gen, data, owner) {
		if (!$.isGenerator(gen)) throw new Error("callback is not Generator");

		if ($.isNull(data)) data = [];
		else if (!$.isArray(data)) data = [data];
		if (!$.isObject(owner)) owner = null;

		const isFunc    = $.isFunction,
			  isPromise = $.isPromise,
			  isGen     = $.isGenerator,
			  toPromise = function (gen, data, owner, first) {
				  if (isPromise(gen)) return gen;

				  return new Promise(function (resolve, reject) {
					  const step = err => {
								let method = err ? "throw" : "next";

								return (arg, rev) => {
									try {
										rev = gen[method](arg);
									}
									catch (e) {
										return reject(e);
									}

									next(rev);
								};
							},
							then = (own, ok, fail) => own.then(ok || step(), fail || step(1)),
							next = rev => {
								if (rev.done) return resolve(rev.value);
								rev = rev.value;

								then(toPromise(rev, [], owner));
							};

					  if (isGen(gen) || (first && isFunc(gen))) gen = gen.apply(owner, data);

					  if (isPromise(gen)) gen.then(resolve, reject);
					  else if (!isGen(gen, true)) resolve(gen);
					  else step()();
				  });
			  };

		return toPromise(gen, data, owner, true);
	};

	/**
	 * 普通函数转Promise对象
	 * @param {function} func 普通函数
	 * @returns {Promise<*>}
	 * @constructor
	 */
	$.Done = async function (func) {
		const dtd = Promise.create();

		if ($.isFunction(func)) func = Promise.create(func);

		func.always(() => dtd.resolve());

		return dtd.promise();
	};
})(this);