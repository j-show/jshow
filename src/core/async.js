/**
 * ==========================================
 * Name:           jShow's Async Extensions
 * Author:         j-show
 * CreTime:        2019-02-20
 * Description:    Async Extensions
 * Log:
 * 2019-02-20    Init Async
 * 2019-05-19    Format Code to jShow Style Guide
 * ==========================================
 */
($ => {
	/*
	 ====================================
	 = Name: TCallback
	 = Info: callback class
	 = Object Method：
	 =   lock        = lock call function
	 =   unlock      = unlock call function
	 =   on          = add function
	 =   off         = remove function by function
	 =   fire        = call function
	 =   fireWith    = call function, change this object
	 =   empty       = clear function
	 =   unique      = unique function
	 =   has         = exist check function by list
	 = Object Property:
	 =   limit       = function list limit
	 =   length      = function list length
	 =   locked      = lock status
	 ====================================
	 */
	const TCallback = (function (TObject) {
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
		};
		const eachFuncs = (list, callback) => {
			let i = 0;

			while (i < list.length) {
				if (callback(i, list[i]) !== false) i++;
			}
		};
		const fireFuncs = (list, data, once, done, prog) => {
			if (list.length < 1) return done;

			eachFuncs(list, (i, f) => {
				f.apply(data[0], data[1]);

				if (once) list.splice(i, 1);
				if (prog) prog();
				if (once) return false;
			});

			if (done) done();

			return null;
		};

		class TCallback extends TObject {
			create (opt, limit, callback) {
				this.__className = "TCallback";

				this._locked = false;
				this._limit  = limit;
				this._value  = [];
				this._arg    = null;

				this._opt      = opt;
				this._callback = $.isFunction(callback) ? callback : null;
			}

			valueOf () {
				return this._value;
			}

			get limit () {
				return this._limit;
			}

			get length () {
				return this._value.length;
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

			on (...func) {
				if (this.locked) return this;

				const opt   = this._opt;
				const data  = this._value;
				const arg   = this._arg;
				const limit = this._limit;

				getFuncs(func, d => {
					data.push(d);
					if (data.length > limit) data.pop();
				});

				if (opt.unique) this.unique();
				if (opt.memory && opt.fire && arg) fireFuncs(data, arg, opt.once, this._callback);

				return this;
			}

			off (...func) {
				if (this.locked) return this;

				const data = this._value;

				if (func.length < 1) {
					this._value = [];
				}
				else {
					getFuncs(func, d => {
						eachFuncs(data, (i, f) => {
							if (Object.is(d, f)) {
								data.splice(i, 1);
								return false;
							}
						});
					});
				}

				return this;
			}

			has (func) {
				return this._value.indexOf(func) !== -1;
			}

			unique () {
				if (this.locked) return this;

				this._value = $.unique(this._value);

				return this;
			}

			fire (...args) {
				return this.fireWith(this, args);
			}

			fireWith (own = this, args = [], done) {
				const arg = [own, $.isArray(args) ? args : []];
				const opt = this._opt;

				this._arg = arg;

				if (opt.memory && !opt.fire) {
					opt.fire = true;
					if (opt.limit) this._arg = null;
				}
				else {
					let data = this._value;

					fireFuncs(data, arg, opt.once, done);
					if (this._callback) this._callback.apply(arg[0], arg[1]);
				}

				return this;
			}
		}

		return TCallback;
	})($.TObject);

	/*
	 ====================================
	 = Name: TDeferred
	 = Info: Async class (Observer Mode)
	 = Static Method:
	 =   create      = static create function
	 = Object Method：
	 =   empty       = clear bind function
	 =   promise     = return promise object
	 =   resolve     = call done event
	 =   reject      = call fail event
	 =   alarm       = call warn event
	 =   notify      = call progress event
	 =   on          = bind function by key
	 =   off         = unbind function by key
	 = Object Event:
	 =   done        = done evnet, only once call
	 =   fail        = fail event, only once call
	 =   warn        = warn event
	 =   progress    = progress event
	 =   always      = always event, after done/fail event
	 ====================================
	 */
	class TDeferred extends $.TObject {
		create (limit, callback) {
			let _this    = this;
			let _state   = _this.STATE;
			let _event   = {
				done:     $.Callback(limit).fire(),
				fail:     $.Callback(limit).fire(),
				warn:     $.Callback(limit).fire(),
				progress: $.Callback(limit).fire(),
				always:   $.Callback(limit, callback).fire()
			};
			let _action  = {
				resolve: _event.done,
				reject:  _event.fail,
				alarm:   _event.warn,
				notify:  _event.progress
			};
			let _promise = {
				get state () {
					return _this._state;
				},
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

			_this.__event   = _event;
			_this.__action  = _action;
			_this.__promise = _promise;

			_this._state  = _state.pending;
			_this.__owner = void(0);
			_this.__surp  = 0;

			_event.done.on(e => {
				_this._state = _state.resolved;

				_event.fail.lock();
				_event.warn.lock();
				_event.progress.lock();
			});
			_event.fail.on(e => {
				_this._state = _state.rejected;

				_event.done.lock();
				_event.warn.lock();
				_event.progress.lock();
			});

			$.each(_event, (d, k) => {
				_this[k]    = function () {
					d.on([...arguments]);
					return this;
				};
				_promise[k] = _this[k];
			});

			$.each(_action, (d, k) => {
				_this[k]          = function () {
					_this[`${k}With`](_this, arguments);

					return this;
				};
				_this[`${k}With`] = function (own, arg) {
					own = own || _this.__owner;
					d.fireWith(own, arg);

					if (_this.state === k) {
						_event.always.fireWith(own, arg);
					}
					else if (k === "notify") {
						_this.__surp -= 1;
						if (_this.__surp < 1) _this["resolveWith"](own, arg);
					}

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
			if (arguments.length === 0) $.each(this.__event, d => d.off());
			else if (this.__event[tag]) this.__event[tag].off();

			return this;
		}

		promise (own, max = own) {
			const STATE = this.STATE;

			switch (this.state) {
				case STATE.inited:
				case STATE.pending:
					this._state = STATE.pending;

					this.__owner = own === null ? void(0) : own;
					this.__surp  = $.isNumber(max, {min: 0}) ? max : 0;
					break;
			}

			return this.__promise;
		}

		static create (limit, callback) {
			return (new TDeferred(limit, callback));
		}
	}

	/*
	 ====================================
	 = Name: TPromise
	 = Info: Async object, extension Promise object
	 = Static Method:
	 =   create      = static create function
	 = Object Method：
	 =   empty       = clear bind function
	 =   promise     = return promise object
	 =   resolve     = call done event
	 =   reject      = call fail event
	 =   alarm       = call warn event
	 =   notify      = call progress event
	 =   on          = bind function by key
	 =   off         = unbind function by key
	 = Object Event:
	 =   done        = done evnet, only once call
	 =   fail        = fail event, only once call
	 =   warn        = warn event
	 =   progress    = progress event
	 =   always      = always event, after done/fail event
	 ====================================
	 */
	const TPromise = (Promise => {
		let prop = Promise.prototype;

		prop.end      = function (onFulfilled, onRejected) {
			this.then(onFulfilled, onRejected)
				.catch(function (reason) {
					// 抛出一个全局错误
					setTimeout(() => { throw reason; }, 0);
				});
		};
		prop.on       = function (tag, callback) {
			if (!$.isFunction(callback, true)) return this;

			switch (tag) {
				default:
				case "done":
					return this.then(callback);
				case "fail":
					return this.catch(callback);
				case "always":
					let P = this.constructor;

					return this.then(
						value => P.resolve(callback()).then(() => value),
						reason => P.resolve(callback()).then(() => { throw reason; })
					);
				case "warn":
					if (!this.__simple) this.__warn.on(callback);

					return this;
				case "progress":
					if (!this.__simple) this.__progress.on(callback);

					return this;
			}
		};
		prop.done     = function (callback) { return this.on("done", callback); };
		prop.fail     = function (callback) { return this.on("fail", callback); };
		prop.always   = function (callback) { return this.on("always", callback); };
		prop.warn     = function (callback) { return this.on("warn", callback); };
		prop.progress = function (callback) { return this.on("progress", callback); };
		prop.resolve  = function (...arg) {
			this.__resolve.apply(this, arg.length > 2 ? [arg] : arg);

			return this;
		};
		prop.reject   = function (...arg) {
			this.__reject.apply(this, arg.length > 2 ? [arg] : arg);

			return this;
		};
		prop.alarm    = function (arg) {
			this.__warn.fireWith(this, arg);

			return this;
		};
		prop.notify   = function (arg) {
			if (this.__simple) return this;

			if (this.__limit > 0) {
				this.__progress.fireWith(this, arg);

				this.__limit -= 1;
				if (this.__limit < 1) this.__resolve.call(this, arg);
			}

			return this;
		};
		prop.promise  = function (max) {
			if ($.isNumber(max, {min: 1})) this.__limit = max;

			return this;
		};

		Promise.create = function (simple, callback) {
			let done;
			let fail;

			let obj = new Promise(function (resolve, reject) {
				done = resolve;
				fail = reject;
			});

			obj.__resolve = done;
			obj.__reject  = fail;

			obj.__limit  = 0;
			obj.__simple = simple !== false;
			if (!obj.__simple) {
				obj.__warn     = $.Callback(100).fire();
				obj.__progress = $.Callback(100).fire();
			}

			if (!callback) callback = simple;
			if (typeof(callback) === "function") callback(obj);

			return obj;
		};

		return Promise;
	})(Promise);

	const api = {
		TCallback,
		TDeferred,
		TPromise,
		/**
		 * Create TCallback object
		 *
		 * @param {object} opt <option>
		 *    @param {string} [opt.flag=once memory limit] <work mode>
		 *    @param {number} [opt.limit=50] <callback list limit>
		 *    @param {function} opt.callback <callback list after function>
		 * @returns {object}
		 */
		Callback (opt) {
			let {
					flag  = "once memory limit",
					limit = 50,
					callback
				} = opt;

			switch (typeof(opt)) {
				case "number":
					limit = opt;
					break;
				case "string":
					flag = opt;
					break;
				case "function":
					callback = opt;
					break;
			}

			if (!$.isNumber(limit, {min: 1})) limit = 50;
			if (!$.isFunction(callback)) callback = null;

			let arg = {};
			flag.split(" ").forEach(d => arg[d] = true);

			if (arg.memory && !arg.limit) arg.fire = true;

			return new TCallback(
				{
					once:   arg.once === true,
					memory: arg.memory === true,
					limit:  arg.limit === true,
					unique: arg.unique === true,
					fire:   arg.fire === true
				},
				arg.simple === true ? 1 : parseInt(limit),
				callback
			);
		},
		/**
		 * Create Async observer object
		 *
		 * @WARN: opt type is number as TDeferred
		 *
		 * @param {boolean|number|object} opt <option>
		 *    @param {boolean} [opt=true] <is simple mode>
		 *    @param {number} [opt=50] <callback list limit>
		 * @param {function} [callback] <callback list after function>
		 * @returns {object}
		 */
		Deferred (opt, callback = opt) {
			let func = callback;

			if (!$.isFunction(func)) func = null;

			switch (typeof(opt)) {
				default:
				case "boolean":
					return Promise.create(opt === true, func);
				case "number":
					let num = Number(opt);

					if (isNaN(num) || num < 1) num = 50;

					return TDeferred.create(num, func);
			}
		},
		/**
		 * Create Async object, extension Promise object
		 *
		 */
		Promise (callback) {
			return Promise.create(callback);
		},
		/**
		 * Generator function to Promise object
		 *
		 * @param {Generator} gen <function body, must generator function>
		 * @param {object} [opt] <option>
		 *    @param {*} [opt.data] <transmit data>
		 *    @param {*} [opt.owner] <transmit owner>
		 * @returns {object}
		 */
		Async (gen, opt) {
			if (!$.isGenerator(gen)) throw new Error("callback is not Generator");

			let {
					data  = null,
					owner = null
				} = opt;

			if ($.isNull(data)) data = [];
			if (!$.isArray(data)) data = [data];
			if (!$.isObject(owner)) owner = null;

			const isFunc    = $.isFunction;
			const isPromise = $.isPromise;
			const isGen     = $.isGenerator;
			const toPromise = function (gen, data, owner, first) {
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
					};
					const then = (own, ok, fail) => own.then(ok || step(), fail || step(1));
					const next = rev => {
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
		},
		/**
		 * Normal function to async function
		 *
		 * @WARN: async function as done status output
		 *
		 * @param {function} callback <normal function>
		 * @returns {Promise<*>}
		 */
		async Done (callback) {
			const dtd = Promise.create();

			let func = callback;

			if ($.isFunction(func)) func = Promise.create(func);

			func.always(() => dtd.resolve());

			return dtd.promise();
		}
	};

	jShow = {...$, ...api};
	$     = jShow;
})(jShow);