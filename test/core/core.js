const assert  = require("assert");
const block   = describe;
const equal   = assert.strictEqual;
const nequal  = assert.notStrictEqual;
const dequal  = assert.deepStrictEqual;
const dnequal = assert.notDeepStrictEqual;

const factory = (tag, work, func, arg) => {
	if (!arg) arg = [];
	arg.unshift(func);
	block(tag, () => { work.apply(null, arg); });
};

global.jShow = {};

require("../../src/core/core.js");

factory("type", TYPE, jShow.type);
factory("callback", CALLBACK, jShow.callback);
factory("each", EACH, jShow.each, [jShow.type]);
factory("unique", UNIQUE, jShow.unique);
factory("has", HAS, jShow.has);
factory("clone", CLONE, jShow.clone);
factory("is", IS, jShow.is);
factory("isSimple", isSimple, jShow.isSimple);
factory("isNull", isNull, jShow.isNull);
factory("isBool", isBool, jShow.isBool);
factory("isNumber", isNumber, jShow.isNumber);
factory("isString", isString, jShow.isString);
factory("isFunction", isFunction, jShow.isFunction);
factory("isArray", isArray, jShow.isArray);
factory("isObject", isObject, jShow.isObject);
factory("isPromise", isPromise, jShow.isPromise);
factory("isGenerator", isGenerator, jShow.isGenerator);
factory("isJSON", isJSON, jShow.isJSON);
factory("isLeapYear", isLeapYear, jShow.isLeapYear);
factory("isDate", isDate, jShow.isDate);
factory("isTime", isTime, jShow.isTime);
factory("isjQuery", isjQuery, jShow.isjQuery);
factory("isGuid", isGuid, jShow.isGuid);
factory("isBase64", isBase64, jShow.isBase64);

function TYPE (func) {
	const a = [true, false];
	const b = [1, 0, -1, NaN];
	const c = ["a", ""];
	const d = [null, undefined];
	const e = [
		function () {},
		() => {},
		async function () {},
		async () => {},
		function* () {}
	];
	const f = [
		[], new Array(1)
	];
	const g = [
		{}, Object.create(null), new Object()
	];
	const h = [
		new Date(), /1/g, new RegExp("1"), {jquery: 1}
	];

	block("default", () => {
		let opt;

		it("boolean", () => {
			equal(func(a[0], opt), "boolean");
			equal(func(a[1], opt), "boolean");
		});
		it("number", () => {
			equal(func(b[0], opt), "number");
			equal(func(b[1], opt), "number");
			equal(func(b[2], opt), "number");
			equal(func(b[3], opt), "number");
		});
		it("string", () => {
			equal(func(c[0], opt), "string");
			equal(func(c[1], opt), "string");
		});
		it("null/undefined", () => {
			equal(func(d[0], opt), "null");
			equal(func(d[1], opt), "null");
		});
		it("function", () => {
			equal(func(e[0], opt), "function");
			equal(func(e[1], opt), "function");
			equal(func(e[2], opt), "function");
			equal(func(e[3], opt), "function");
			equal(func(e[4], opt), "function");
		});
		it("array", () => {
			equal(func(f[0], opt), "object");
			equal(func(f[1], opt), "object");
		});
		it("object", () => {
			equal(func(g[0], opt), "object");
			equal(func(g[1], opt), "object");
			equal(func(g[2], opt), "object");
		});
		it("other", () => {
			equal(func(h[0], opt), "object");
			equal(func(h[1], opt), "object");
			equal(func(h[2], opt), "object");
			equal(func(h[3], opt), "object");
		});
	});
	block("detail=true", () => {
		let opt = true;

		it("boolean", () => {
			equal(func(a[0], opt), "boolean");
			equal(func(a[1], opt), "boolean");
		});
		it("number", () => {
			equal(func(b[0], opt), "number");
			equal(func(b[1], opt), "number");
			equal(func(b[2], opt), "number");
			equal(func(b[3], opt), "number");
		});
		it("string", () => {
			equal(func(c[0], opt), "string");
			equal(func(c[1], opt), "string");
		});
		it("null/undefined", () => {
			equal(func(d[0], opt), "null");
			equal(func(d[1], opt), "undefined");
		});
		it("function", () => {
			equal(func(e[0], opt), "function");
			equal(func(e[1], opt), "function");
			equal(func(e[2], opt), "asyncfunction");
			equal(func(e[3], opt), "asyncfunction");
			equal(func(e[4], opt), "generatorfunction");
		});
		it("array", () => {
			equal(func(f[0], opt), "array");
			equal(func(f[1], opt), "array");
		});
		it("object", () => {
			equal(func(g[0], opt), "object");
			equal(func(g[1], opt), "object");
			equal(func(g[2], opt), "object");
		});
		it("other", () => {
			equal(func(h[0], opt), "date");
			equal(func(h[1], opt), "regexp");
			equal(func(h[2], opt), "regexp");
			equal(func(h[3], opt), "jquery");
		});
	});
	block("detail=false", () => {
		let opt = false;

		it("boolean", () => {
			equal(func(a[0], opt), "boolean");
			equal(func(a[1], opt), "boolean");
		});
		it("number", () => {
			equal(func(b[0], opt), "number");
			equal(func(b[1], opt), "number");
			equal(func(b[2], opt), "number");
			equal(func(b[3], opt), "number");
		});
		it("string", () => {
			equal(func(c[0], opt), "string");
			equal(func(c[1], opt), "string");
		});
		it("null/undefined", () => {
			equal(func(d[0], opt), "null");
			equal(func(d[1], opt), "null");
		});
		it("function", () => {
			equal(func(e[0], opt), "function");
			equal(func(e[1], opt), "function");
			equal(func(e[2], opt), "function");
			equal(func(e[3], opt), "function");
			equal(func(e[4], opt), "function");
		});
		it("array", () => {
			equal(func(f[0], opt), "object");
			equal(func(f[0], opt), "object");
		});
		it("object", () => {
			equal(func(g[0], opt), "object");
			equal(func(g[1], opt), "object");
			equal(func(g[2], opt), "object");
		});
		it("other", () => {
			equal(func(h[0], opt), "object");
			equal(func(h[1], opt), "object");
			equal(func(h[2], opt), "object");
			equal(func(h[3], opt), "object");
		});
	});
}

function CALLBACK (func) {
	const fn = v => typeof (v) === "function";

	const a1 = [function () {}];
	const a2 = [async function () {}];
	const a3 = [function* () {}];
	const b1 = [1, 2, function () {}];
	const b2 = [1, 2, async function () {}];
	const b3 = [1, 2, function* () {}];
	const c1 = [1, 2, function () {}, -1];
	const c2 = [1, 2, async function () {}, -1];
	const c3 = [1, 2, function* () {}, -1];

	block("default", () => {
		it("[fn]", () => {
			equal(fn(func([])), false);
			equal(fn(func(a1)), true);
			equal(fn(func(a2)), true);
			equal(fn(func(a3)), true);
		});
		it("[1,2,fn]", () => {
			equal(fn(func(b1)), true);
			equal(fn(func(b2)), true);
			equal(fn(func(b3)), true);
		});
		it("[1,2,fn,-1]", () => {
			equal(fn(func(c1)), true);
			equal(fn(func(c2)), true);
			equal(fn(func(c3)), true);
		});
	});
	block("index=2", () => {
		let opt = 2;

		it("[fn]", () => {
			equal(fn(func(a1, opt)), false);
			equal(fn(func(a2, opt)), false);
			equal(fn(func(a3, opt)), false);
		});
		it("[1,2,fn]", () => {
			equal(fn(func(b1, opt)), true);
			equal(fn(func(b2, opt)), true);
			equal(fn(func(b3, opt)), true);
		});
		it("[1,2,fn,-1]", () => {
			equal(fn(func(c1, opt)), true);
			equal(fn(func(c2, opt)), true);
			equal(fn(func(c3, opt)), true);
		});
	});
	block("type=async", () => {
		let opt = "async";

		it("[fn]", () => {
			equal(fn(func(a1, opt)), false);
			equal(fn(func(a2, opt)), true);
			equal(fn(func(a3, opt)), false);
		});
		it("[1,2,fn]", () => {
			equal(fn(func(b1, opt)), false);
			equal(fn(func(b2, opt)), true);
			equal(fn(func(b3, opt)), false);
		});
		it("[1,2,fn,-1]", () => {
			equal(fn(func(c1, opt)), false);
			equal(fn(func(c2, opt)), true);
			equal(fn(func(c3, opt)), false);
		});
	});
	block("loop=false", () => {
		let opt = false;

		it("[fn]", () => {
			equal(fn(func(a1, opt)), true);
			equal(fn(func(a2, opt)), true);
			equal(fn(func(a3, opt)), true);
		});
		it("[1,2,fn]", () => {
			equal(fn(func(b1, opt)), true);
			equal(fn(func(b2, opt)), true);
			equal(fn(func(b3, opt)), true);
		});
		it("[1,2,fn,-1]", () => {
			equal(fn(func(c1, opt)), false);
			equal(fn(func(c2, opt)), false);
			equal(fn(func(c3, opt)), false);
		});
	});
	block("opt={index:2,loop:false,type=nasync}", () => {
		let opt = {index: 2, loop: false, type: "nasync"};

		it("[fn]", () => {
			equal(fn(func(a1, opt)), false);
			equal(fn(func(a2, opt)), false);
			equal(fn(func(a3, opt)), false);
		});
		it("[1,2,fn]", () => {
			equal(fn(func(b1, opt)), true);
			equal(fn(func(b2, opt)), true);
			equal(fn(func(b3, opt)), false);
		});
		it("[1,2,fn,-1]", () => {
			equal(fn(func(c1, opt)), false);
			equal(fn(func(c2, opt)), false);
			equal(fn(func(c3, opt)), false);
		});
	});
	block("opt={index:-1}", () => {
		let opt = {index: -2};

		it("[fn]", () => {
			equal(fn(func(a1, opt)), false);
			equal(fn(func(a2, opt)), false);
			equal(fn(func(a3, opt)), false);
		});
	});
	block("opt={index:a}", () => {
		let opt = {index: "A"};

		it("[fn]", () => {
			equal(fn(func(a1, opt)), true);
			equal(fn(func(a2, opt)), true);
			equal(fn(func(a3, opt)), true);
		});
	});
}

function EACH (func, type) {
	const a = [1, "2", null, undefined, {}];
	const b = {a: 1, b: "2", c: null, d: undefined, e: {}};
	const c = "12345678";
	const d = new Set([1]);
	const f = new Map([["a", 1]]);

	block("default", () => {
		it("any", () => {
			equal(func(), false);
			equal(func(1, () => {}), false);
		});
		it("array", () => {
			equal(func([], () => {}), true);
			func(a, (d, k) => {
				equal(a[k], d);
			});
		});
		it("object", () => {
			func(b, (d, k) => {
				equal(b[k], d);
			});
		});
		it("string", () => {
			func(c, (d, k) => {
				equal(c[k], d);
			});
		});
		it("set", () => {
			func(d, (v, k) => {
				equal(Array.from(d)[k], v);
			});
		});
		it("map", () => {
			func(f, (d, k) => {
				equal(f.get(k), d);
			});
		});
	});
	block("opt=true", () => {
		let opt = {detail: true};

		it("array", () => {
			func(a, (d, k, t) => {
				equal(a[k], d);
				equal(type(d, true), t);
			}, opt);
		});
		it("object", () => {
			func(b, (d, k, t) => {
				equal(b[k], d);
				equal(type(d, true), t);
			}, opt);
		});
		it("string", () => {
			func(c, (d, k, t) => {
				equal(c[k], d);
				equal(type(d, true), t);
			}, opt);
		});
		it("set", () => {
			func(d, (v, k) => {
				equal(Array.from(d)[k], v);
			}, opt);
		});
		it("map", () => {
			func(f, (d, k) => {
				equal(f.get(k), d);
			}, opt);
		});
	});
	block("opt=1", () => {
		let opt = 1;

		it("array", () => {
			let l = opt;
			func(a, (d, k) => {
				equal(a[k], a[l]);
				l++;
			}, opt);
		});
		it("object", () => {
			func(b, (d, k) => {
				equal(b[k], d);
			});
		});
		it("string", () => {
			func(c, (d, k) => {
				equal(c[k], d);
			});
		});
		it("set", () => {
			func(d, (v, k) => {
				equal(d.get(k), v);
			}, opt);
		});
		it("map", () => {
			func(f, (d, k) => {
				equal(f.get(k), d);
			}, opt);
		});
	});
	block("opt={force:true,index:1,desc:true}", opt => {
		opt = {force: true, index: 1, desc: true};
		it("array", () => {
			let l = a.length - 2;
			func(a, (d, k) => {
				equal(a[k], a[l]);
				l--;
			}, opt);
		});
		it("string", () => {
			let l = c.length - 2;
			func(c, (d, k) => {
				equal(c[k], c[l]);
				l--;
			}, opt);
		});
	});
	block("error", () => {
		it("opt={index:-999}", () => {
			equal(func(a, () => {}, {index: -999}), false);
		});
		it("opt={index:a}", () => {
			equal(func(a, () => {}, {index: "a"}), true);
		});
	});
}

function UNIQUE (func) {
	const a1 = [1, 2, 5, 6, 3, 6, 2];
	const a2 = [1, 2, 5, 6, 3];
	const b1 = "1256362";
	const b2 = "12563";

	block("default", () => {
		it("unique", () => {
			dequal(func(1), []);
			dequal(func(a1), a2);
			equal(func(b1), b2);
		});
		it("write", () => {
			dnequal(func(a1), a1);
		});
	});
	block("write=true", () => {
		let opt = true;

		it("unique", () => {
			dequal(func(a1, opt), a2);
			equal(func(b1, opt), b2);
		});
		it("write", () => {
			dequal(func(a1, opt), a1);
		});
	});
}

function HAS (func) {
	const a = {a: 1};
	const b = [1];
	const c = "1";
	const d = new Set([1]);
	const e = new Map([["a", 1]]);
	const f = function () {};

	block("default", () => {
		it("object", () => {
			equal(func(1, null), false);
			equal(func(1, a), true);
			equal(func(2, a), false);
			equal(func(2, a, () => true), true);
		});
		it("array", () => {
			equal(func(1, b), true);
			equal(func(2, b), false);
			equal(func(2, b, () => true), true);
		});
		it("string", () => {
			equal(func("1", c), true);
			equal(func("2", c), false);
			equal(func(2, c, () => true), true);
		});
		it("set", () => {
			equal(func(1, d), true);
			equal(func("1", d), false);
			equal(func(1, d, () => true), true);
		});
		it("map", () => {
			equal(func(1, e), true);
			equal(func("1", e), false);
			equal(func(1, e, () => true), true);
		});
		it("function", () => {
			equal(func(1, f), false);
			equal(func("1", f), false);
			equal(func(1, f, () => true), false);
		});
		it("any", () => {
			equal(func(1, 1), false);
		});
	});
	block("filter=key", () => {
		let opt = "key";

		it("object", () => {
			equal(func(1, null, opt), false);
			equal(func("a", a, opt), true);
			equal(func(1, a, opt), false);
			equal(func(2, a, opt, () => true), false);
		});
		it("array", () => {
			equal(func(1, b, opt), false);
			equal(func(2, b, opt), false);
			equal(func(2, b, opt, () => true), false);
		});
		it("string", () => {
			equal(func("1", c, opt), false);
			equal(func("2", c, opt), false);
			equal(func(2, c, opt, () => true), false);
		});
		it("set", () => {
			equal(func(1, d, opt), false);
			equal(func("1", d, opt), false);
			equal(func(1, d, opt, () => true), false);
		});
		it("map", () => {
			equal(func("a", e, opt), true);
			equal(func("1", e, opt), false);
			equal(func(1, e, opt, () => true), true);
		});
		it("function", () => {
			equal(func(1, f, opt), false);
			equal(func("1", f, opt), false);
			equal(func(1, f, opt, () => true), false);
		});
	});
}

function CLONE (func) {
	const a1 = [8, 2];
	const a2 = [1, 5, 6, [7]];
	const a3 = [8, 2, 6, [7]];
	const b1 = {a: 1, b: 5};
	const b2 = {a: 8, c: 3};
	const b3 = {a: 1, b: 5, c: 3};
	const c1 = new Set([6]);
	const c2 = new Set([1, 5]);
	const c3 = new Set([1, 6, 5]);
	const d1 = new Map([["a", 1]]);
	const d2 = new Map([["b", 2]]);
	const d3 = new Map([["a", 1], ["b", 2]]);
	const e1 = function () {};

	let d;

	block("default", () => {
		it("array", () => {
			d = func(a1, a2);

			dequal(d, a3);
			equal(d, a2);
		});
		it("object", () => {
			d = func(b1, b2);

			dequal(d, b3);
			equal(d, b2);
		});
		it("set", () => {
			d = func(c1, c2);

			dequal(d, c3);
			equal(d, c2);

			dequal(func(c1, 1), c1);
		});
		it("map", () => {
			d = func(d1, d2);

			dequal(d, d3);
			equal(d, d2);

			dequal(func(d1, 1), d1);
		});
		it("any", () => {
			equal(func(1, 2), 1);
			equal(func({}, a1), a1);
			equal(func(e1, 1), e1);
		});
	});
	block("opt={deep:true,write:false}", () => {
		let opt = {deep: true, write: false};

		it("array", () => {
			d = func(a1, a2, opt);

			dequal(d, a3);
			nequal(d, a2);
		});
		it("object", () => {
			d = func(b1, b2, opt);

			dequal(d, b3);
			nequal(d, b2);
		});
	});
	block("opt=true", () => {
		let opt = true;

		it("array", () => {
			d = func(a1, a2, opt);

			dequal(d, a3);
			equal(d, a2);
		});
		it("object", () => {
			d = func(b1, b2, opt);

			dequal(d, b3);
			equal(d, b2);
		});
	});
}

function IS (func) {
	block("default, abs=undefined", () => {
		it("simple", () => {
			equal(func(1, "1"), false);
			equal(func(1, "1"), false);
			equal(func(0, NaN), false);
			equal(func("", "1"), false);
			equal(func(null, undefined), false);
			equal(func(null, null), true);
			equal(func(0, 0), true);
			equal(func("1", "1"), true);
			equal(func(NaN, NaN), true);
		});
		it("function", () => {
			let a1 = function () {};
			let a2 = function () {};
			let b1 = function (a) {};
			let c1 = async function () {};
			let d1 = function* () {};

			equal(func(a1, b1), false);
			equal(func(a1, a2), false);
			equal(func(a1, c1), false);
			equal(func(a1, d1), false);
			equal(func(a1, a1), true);
		});
		it("object", () => {
			let a = {a: 1};
			let b = {a: 1};

			equal(func(a, b), false);
			equal(func(a, a), true);
		});
		it("date", () => {
			let a = new Date();
			let b = new Date(a.getTime());

			equal(func(a, b), false);
			equal(func(a, a), true);
		});
	});
	block("abs=true", () => {
		let opt = true;

		it("simple", () => {
			equal(func(1, "1", opt), false);
			equal(func(1, "1", opt), false);
			equal(func(0, NaN, opt), false);
			equal(func("", "1", opt), false);
			equal(func(null, undefined, opt), false);
			equal(func(null, null, opt), true);
			equal(func(0, 0, opt), true);
			equal(func("1", "1", opt), true);
			equal(func(NaN, NaN, opt), true);
		});
		it("function", () => {
			let a1 = function () {};
			let a2 = function () {};
			let b1 = function (a) {};
			let c1 = async function () {};
			let d1 = function* () {};

			equal(func(a1, b1, opt), false);
			equal(func(a1, a2, opt), false);
			equal(func(a1, c1, opt), false);
			equal(func(a1, d1, opt), false);
			equal(func(a1, a1, opt), true);
		});
		it("object", () => {
			let a = {a: 1};
			let b = {a: 1};

			equal(func(a, b, opt), false);
			equal(func(a, a, opt), true);
		});
		it("date", () => {
			let a = new Date();
			let b = new Date(a.getTime());

			equal(func(a, b, opt), false);
			equal(func(a, a, opt), true);
		});
	});
	block("abs=false", () => {
		let opt = false;

		it("simple", () => {
			equal(func(1, "1", opt), false);
			equal(func(1, "1", opt), false);
			equal(func(0, NaN, opt), false);
			equal(func("", "1", opt), false);
			equal(func(null, undefined, opt), false);
			equal(func(null, null, opt), true);
			equal(func(0, 0, opt), true);
			equal(func("1", "1", opt), true);
			equal(func(NaN, NaN, opt), true);
		});
		it("function", () => {
			let a1 = function () {};
			let a2 = function () {};
			let b1 = function (a) {};
			let c1 = async function () {};
			let d1 = function* () {};

			equal(func(a1, b1, opt), false);
			equal(func(a1, a2, opt), true);
			equal(func(a1, c1, opt), false);
			equal(func(a1, d1, opt), false);
			equal(func(a1, a1, opt), true);
		});
		it("object", () => {
			let a = {a: 1};
			let b = {a: 1};

			equal(func(a, b, opt), true);
			equal(func(a, a, opt), true);
		});
		it("date", () => {
			let a = new Date();
			let b = new Date(a.getTime());

			equal(func(a, b, opt), true);
			equal(func(a, a, opt), true);
		});
		it("any", () => {
			class A {
				get [Symbol.toStringTag] () {
					return "A";
				}
			}

			let a = new A();
			let b = new A();

			equal(func(a, b, opt), false);
		});
	});
}

function isSimple (func) {
	it("boolean/number/string/undefined/null", () => {
		equal(func(true), true);
		equal(func(0), true);
		equal(func(1), true);
		equal(func(-1), true);
		equal(func(NaN), true);
		equal(func(""), true);
		equal(func("1"), true);
		equal(func(undefined), true);
		equal(func(null), true);
	});
	it("function/array/object", () => {
		equal(func(function () {}), false);
		equal(func(() => {}), false);
		equal(func([]), false);
		equal(func({}), false);
		equal(func(new Date()), false);
	});
}

function isNull (func) {
	const a = [null, undefined, [], {}, NaN];
	const b = [[], [1]];
	const c = [{}, {a: 1}];
	const d = [1, "1", "", function () {}];

	block("default", () => {
		it("null/undefined/[]/{}/NaN", () => {
			equal(func(a[0]), true);
			equal(func(a[1]), true);
			equal(func(a[2]), false);
			equal(func(a[3]), false);
			equal(func(a[4]), false);
		});
		it("array", () => {
			equal(func(b[0]), false);
			equal(func(b[1]), false);
		});
		it("object", () => {
			equal(func(c[0]), false);
			equal(func(c[1]), false);
		});
		it("other", () => {
			equal(func(d[0]), false);
			equal(func(d[1]), false);
			equal(func(d[2]), false);
		});
	});
	block("udf=false", () => {
		let opt = false;

		it("null/undefined/[]/{}/NaN", () => {
			equal(func(a[0], opt), true);
			equal(func(a[1], opt), false);
			equal(func(a[2], opt), false);
			equal(func(a[3], opt), false);
			equal(func(a[4], opt), false);
		});
		it("array", () => {
			equal(func(b[0], opt), false);
			equal(func(b[1], opt), false);
		});
		it("object", () => {
			equal(func(c[0], opt), false);
			equal(func(c[1], opt), false);
		});
		it("other", () => {
			equal(func(d[0], opt), false);
			equal(func(d[1], opt), false);
			equal(func(d[2], opt), false);
		});
	});
	block("opt={udf:false,obj:true}", () => {
		let opt = {udf: true, nan: true, obj: true};

		it("null/undefined/[]/{}/NaN", () => {
			equal(func(a[0], opt), true);
			equal(func(a[1], opt), true);
			equal(func(a[2], opt), true);
			equal(func(a[3], opt), true);
			equal(func(a[4], opt), true);
		});
		it("array", () => {
			equal(func(b[0], opt), true);
			equal(func(b[1], opt), false);
		});
		it("object", () => {
			equal(func(c[0], opt), true);
			equal(func(c[1], opt), false);
		});
		it("other", () => {
			equal(func(d[0], opt), false);
			equal(func(d[1], opt), false);
			equal(func(d[2], opt), false);
		});
	});
}

function isBool (func) {
	const a = [true, false];
	const b = ["true", "false", "", "1"];
	const c = [NaN, 0, -1, 1, null, undefined, {}, [], function () {}];

	block("default", () => {
		it("boolean", () => {
			equal(func(a[0]), true);
			equal(func(a[1]), true);
		});
		it("string", () => {
			equal(func(b[0]), false);
			equal(func(b[1]), false);
			equal(func(b[2]), false);
			equal(func(b[3]), false);
		});
		it("any", () => {
			equal(func(c[0]), false);
			equal(func(c[1]), false);
			equal(func(c[2]), false);
			equal(func(c[3]), false);
			equal(func(c[4]), false);
			equal(func(c[5]), false);
			equal(func(c[6]), false);
			equal(func(c[7]), false);
			equal(func(c[8]), false);
		});
	});
	block("str=true", () => {
		let opt = true;

		it("boolean", () => {
			equal(func(a[0], opt), true);
			equal(func(a[1], opt), true);
		});
		it("string", () => {
			equal(func(b[0], opt), true);
			equal(func(b[1], opt), true);
			equal(func(b[2], opt), false);
			equal(func(b[3], opt), false);
		});
		it("any", () => {
			equal(func(c[0], opt), false);
			equal(func(c[1], opt), false);
			equal(func(c[2], opt), false);
			equal(func(c[3], opt), false);
			equal(func(c[4], opt), false);
			equal(func(c[5], opt), false);
			equal(func(c[6], opt), false);
			equal(func(c[7], opt), false);
			equal(func(c[8], opt), false);
		});
	});
}

function isNumber (func) {
	const a = [2, 2.2, NaN, 0, -2, -2.2];
	const b = ["1", "-1", "1.1", "-1.1", "a1", "abc"];
	const c = [null, undefined, [], {}];

	block("default", () => {
		it("number", () => {
			equal(func(a[0]), true);
			equal(func(a[1]), false);
			equal(func(a[2]), false);
			equal(func(a[3]), true);
			equal(func(a[4]), true);
			equal(func(a[5]), false);
		});
		it("string", () => {
			equal(func(b[0]), false);
			equal(func(b[1]), false);
			equal(func(b[2]), false);
			equal(func(b[3]), false);
			equal(func(b[4]), false);
			equal(func(b[5]), false);
		});
		it("any", () => {
			equal(func(c[0]), false);
			equal(func(c[1]), false);
			equal(func(c[2]), false);
			equal(func(c[3]), false);
		});
	});
	block("nan=true", () => {
		let opt = true;

		it("number", () => {
			equal(func(a[0], opt), true);
			equal(func(a[1], opt), false);
			equal(func(a[2], opt), true);
			equal(func(a[3], opt), true);
			equal(func(a[4], opt), true);
			equal(func(a[5], opt), false);
		});
		it("string", () => {
			equal(func(b[0], opt), false);
			equal(func(b[1], opt), false);
			equal(func(b[2], opt), false);
			equal(func(b[3], opt), false);
			equal(func(b[4], opt), false);
			equal(func(b[5], opt), false);
		});
		it("any", () => {
			equal(func(c[0], opt), false);
			equal(func(c[1], opt), false);
			equal(func(c[2], opt), false);
			equal(func(c[3], opt), false);
		});
	});
	block("min=2", () => {
		let opt = 2;

		it("number", () => {
			equal(func(a[0], opt), true);
			equal(func(a[1], opt), false);
			equal(func(a[2], opt), false);
			equal(func(a[3], opt), false);
			equal(func(a[4], opt), false);
			equal(func(a[5], opt), false);
		});
		it("string", () => {
			equal(func(b[0], opt), false);
			equal(func(b[1], opt), false);
			equal(func(b[2], opt), false);
			equal(func(b[3], opt), false);
			equal(func(b[4], opt), false);
			equal(func(b[5], opt), false);
		});
		it("any", () => {
			equal(func(c[0], opt), false);
			equal(func(c[1], opt), false);
			equal(func(c[2], opt), false);
			equal(func(c[3], opt), false);
		});
	});
	block("opt={nan:true,str:true,int:false,min:-2,max:2}", () => {
		let opt = {nan: true, str: true, int: false, min: -2, max: 2};

		it("number", () => {
			equal(func(a[0], opt), true);
			equal(func(a[1], opt), false);
			equal(func(a[2], opt), true);
			equal(func(a[3], opt), true);
			equal(func(a[4], opt), true);
			equal(func(a[5], opt), false);
		});
		it("string", () => {
			equal(func(b[0], opt), true);
			equal(func(b[1], opt), true);
			equal(func(b[2], opt), true);
			equal(func(b[3], opt), true);
			equal(func(b[4], opt), false);
			equal(func(b[5], opt), false);
		});
		it("any", () => {
			equal(func(c[0], opt), false);
			equal(func(c[1], opt), false);
			equal(func(c[2], opt), false);
			equal(func(c[3], opt), false);
		});
	});
}

function isString (func) {
	const a = ["123", "1", ""];
	const b = [0, 1, NaN, null, undefined, [], {}];

	block("default", () => {
		it("string", () => {
			equal(func(a[0]), true);
			equal(func(a[1]), true);
			equal(func(a[2]), false);
		});
		it("any", () => {
			equal(func(b[0]), false);
			equal(func(b[1]), false);
			equal(func(b[2]), false);
			equal(func(b[3]), false);
			equal(func(b[4]), false);
			equal(func(b[5]), false);
			equal(func(b[6]), false);
		});
	});
	block("empty=true", () => {
		let opt = true;

		it("string", () => {
			equal(func(a[0], opt), true);
			equal(func(a[1], opt), true);
			equal(func(a[2], opt), true);
		});
		it("any", () => {
			equal(func(b[0], opt), false);
			equal(func(b[1], opt), false);
			equal(func(b[2], opt), false);
			equal(func(b[3], opt), false);
			equal(func(b[4], opt), false);
			equal(func(b[5], opt), false);
			equal(func(b[6], opt), false);
		});
	});
	block("min=2", () => {
		let opt = 2;

		it("string", () => {
			equal(func(a[0], opt), true);
			equal(func(a[1], opt), false);
			equal(func(a[2], opt), false);
		});
		it("any", () => {
			equal(func(b[0], opt), false);
			equal(func(b[1], opt), false);
			equal(func(b[2], opt), false);
			equal(func(b[3], opt), false);
			equal(func(b[4], opt), false);
			equal(func(b[5], opt), false);
			equal(func(b[6], opt), false);
		});
	});
	block("opt={min:1,max:2}", () => {
		let opt = {min: 1, max: 2};

		it("string", () => {
			equal(func(a[0], opt), false);
			equal(func(a[1], opt), true);
			equal(func(a[2], opt), false);
		});
		it("any", () => {
			equal(func(b[0], opt), false);
			equal(func(b[1], opt), false);
			equal(func(b[2], opt), false);
			equal(func(b[3], opt), false);
			equal(func(b[4], opt), false);
			equal(func(b[5], opt), false);
			equal(func(b[6], opt), false);
		});
	});
}

function isFunction (func) {
	const a = [
		function () {},
		() => {},
		async function () {},
		async () => {},
		function* () {}
	];
	const b = [null, undefined, NaN, 0, 1, "", "1", [], {}];

	block("default", () => {
		it("function", () => {
			equal(func(a[0]), true);
			equal(func(a[1]), true);
			equal(func(a[2]), true);
			equal(func(a[3]), true);
			equal(func(a[4]), true);
		});
		it("any", () => {
			equal(func(b[0]), false);
			equal(func(b[1]), false);
			equal(func(b[2]), false);
			equal(func(b[3]), false);
			equal(func(b[4]), false);
			equal(func(b[5]), false);
			equal(func(b[6]), false);
			equal(func(b[7]), false);
			equal(func(b[8]), false);
			equal(func(a[1], 99), true);
		});
	});
	block("type=true", () => {
		let opt = true;

		it("function", () => {
			equal(func(a[0], opt), true);
			equal(func(a[1], opt), true);
			equal(func(a[2], opt), true);
			equal(func(a[3], opt), true);
			equal(func(a[4], opt), true);
		});
		it("any", () => {
			equal(func(b[0], opt), false);
			equal(func(b[1], opt), false);
			equal(func(b[2], opt), false);
			equal(func(b[3], opt), false);
			equal(func(b[4], opt), false);
			equal(func(b[5], opt), false);
			equal(func(b[6], opt), false);
			equal(func(b[7], opt), false);
			equal(func(b[8], opt), false);
		});
	});
	block("type=false", () => {
		let opt = false;

		it("function", () => {
			equal(func(a[0], opt), true);
			equal(func(a[1], opt), true);
			equal(func(a[2], opt), false);
			equal(func(a[3], opt), false);
			equal(func(a[4], opt), false);
		});
		it("any", () => {
			equal(func(b[0], opt), false);
			equal(func(b[1], opt), false);
			equal(func(b[2], opt), false);
			equal(func(b[3], opt), false);
			equal(func(b[4], opt), false);
			equal(func(b[5], opt), false);
			equal(func(b[6], opt), false);
			equal(func(b[7], opt), false);
			equal(func(b[8], opt), false);
		});
	});
	block("type=all", () => {
		let opt = "all";

		it("function", () => {
			equal(func(a[0], opt), true);
			equal(func(a[1], opt), true);
			equal(func(a[2], opt), true);
			equal(func(a[3], opt), true);
			equal(func(a[4], opt), true);
		});
		it("any", () => {
			equal(func(b[0], opt), false);
			equal(func(b[1], opt), false);
			equal(func(b[2], opt), false);
			equal(func(b[3], opt), false);
			equal(func(b[4], opt), false);
			equal(func(b[5], opt), false);
			equal(func(b[6], opt), false);
			equal(func(b[7], opt), false);
			equal(func(b[8], opt), false);
		});
	});
	block("type=nasync", () => {
		let opt = "nasync";

		it("function", () => {
			equal(func(a[0], opt), true);
			equal(func(a[1], opt), true);
			equal(func(a[2], opt), true);
			equal(func(a[3], opt), true);
			equal(func(a[4], opt), false);
		});
		it("any", () => {
			equal(func(b[0], opt), false);
			equal(func(b[1], opt), false);
			equal(func(b[2], opt), false);
			equal(func(b[3], opt), false);
			equal(func(b[4], opt), false);
			equal(func(b[5], opt), false);
			equal(func(b[6], opt), false);
			equal(func(b[7], opt), false);
			equal(func(b[8], opt), false);
		});
	});
	block("type=ngenerator", () => {
		let opt = "ngenerator";

		it("function", () => {
			equal(func(a[0], opt), true);
			equal(func(a[1], opt), true);
			equal(func(a[2], opt), false);
			equal(func(a[3], opt), false);
			equal(func(a[4], opt), true);
		});
		it("any", () => {
			equal(func(b[0], opt), false);
			equal(func(b[1], opt), false);
			equal(func(b[2], opt), false);
			equal(func(b[3], opt), false);
			equal(func(b[4], opt), false);
			equal(func(b[5], opt), false);
			equal(func(b[6], opt), false);
			equal(func(b[7], opt), false);
			equal(func(b[8], opt), false);
		});
	});
	block("type=async", () => {
		let opt = "async";

		it("function", () => {
			equal(func(a[0], opt), false);
			equal(func(a[1], opt), false);
			equal(func(a[2], opt), true);
			equal(func(a[3], opt), true);
			equal(func(a[4], opt), false);
		});
		it("any", () => {
			equal(func(b[0], opt), false);
			equal(func(b[1], opt), false);
			equal(func(b[2], opt), false);
			equal(func(b[3], opt), false);
			equal(func(b[4], opt), false);
			equal(func(b[5], opt), false);
			equal(func(b[6], opt), false);
			equal(func(b[7], opt), false);
			equal(func(b[8], opt), false);
		});
	});
	block("type=generator", () => {
		let opt = "generator";

		it("function", () => {
			equal(func(a[0], opt), false);
			equal(func(a[1], opt), false);
			equal(func(a[2], opt), false);
			equal(func(a[3], opt), false);
			equal(func(a[4], opt), true);
		});
		it("any", () => {
			equal(func(b[0], opt), false);
			equal(func(b[1], opt), false);
			equal(func(b[2], opt), false);
			equal(func(b[3], opt), false);
			equal(func(b[4], opt), false);
			equal(func(b[5], opt), false);
			equal(func(b[6], opt), false);
			equal(func(b[7], opt), false);
			equal(func(b[8], opt), false);
		});
	});
}

function isArray (func) {
	const a = [[], new Array(0), [1, 2], new Array(1), arguments];
	const b = [null, undefined, NaN, 0, 1, "", "1", {}];

	block("default", () => {
		it("array", () => {
			equal(func(a[0]), false);
			equal(func(a[1]), false);
			equal(func(a[2]), true);
			equal(func(a[3]), true);
			equal(func(a[4]), false);
		});
		it("any", () => {
			equal(func(b[0]), false);
			equal(func(b[1]), false);
			equal(func(b[2]), false);
			equal(func(b[3]), false);
			equal(func(b[4]), false);
			equal(func(b[5]), false);
			equal(func(b[6]), false);
			equal(func(b[7]), false);
		});
	});
	block("empty=true", () => {
		let opt = true;

		it("array", () => {
			equal(func(a[0], opt), false);
			equal(func(a[1], opt), false);
			equal(func(a[2], opt), true);
			equal(func(a[3], opt), true);
			equal(func(a[4], opt), true);
		});
		it("any", () => {
			equal(func(b[0], opt), false);
			equal(func(b[1], opt), false);
			equal(func(b[2], opt), false);
			equal(func(b[3], opt), false);
			equal(func(b[4], opt), false);
			equal(func(b[5], opt), false);
			equal(func(b[6], opt), false);
			equal(func(b[7], opt), false);
		});
	});
	block("min=2", () => {
		let opt = 2;

		it("array", () => {
			equal(func(a[0], opt), false);
			equal(func(a[1], opt), false);
			equal(func(a[2], opt), true);
			equal(func(a[3], opt), false);
			equal(func(a[4], opt), false);
		});
		it("any", () => {
			equal(func(b[0], opt), false);
			equal(func(b[1], opt), false);
			equal(func(b[2], opt), false);
			equal(func(b[3], opt), false);
			equal(func(b[4], opt), false);
			equal(func(b[5], opt), false);
			equal(func(b[6], opt), false);
			equal(func(b[7], opt), false);
		});
	});
	block("opt={empty:true,min:2}", () => {
		let opt = {empty: true, min: 2};

		it("array", () => {
			equal(func(a[0], opt), true);
			equal(func(a[1], opt), true);
			equal(func(a[2], opt), true);
			equal(func(a[3], opt), false);
			equal(func(a[4], opt), false);
		});
		it("any", () => {
			equal(func(b[0], opt), false);
			equal(func(b[1], opt), false);
			equal(func(b[2], opt), false);
			equal(func(b[3], opt), false);
			equal(func(b[4], opt), false);
			equal(func(b[5], opt), false);
			equal(func(b[6], opt), false);
			equal(func(b[7], opt), false);
		});
	});
}

function isObject (func) {
	const a = [null, {}, {a: 1}, new Object(), Object.create(null), [], new Date(), /1/];
	const b = [undefined, 1, "1", function () {}];

	block("default", () => {
		it("object", () => {
			equal(func(a[0]), false);
			equal(func(a[1]), true);
			equal(func(a[2]), true);
			equal(func(a[3]), true);
			equal(func(a[4]), false);
			equal(func(a[5]), false);
			equal(func(a[6]), false);
			equal(func(a[7]), false);
		});
		it("any", () => {
			equal(func(b[0]), false);
			equal(func(b[1]), false);
			equal(func(b[2]), false);
		});
	});
	block("filter=true", () => {
		let opt = true;

		it("object", () => {
			equal(func(a[0], opt), true);
			equal(func(a[1], opt), true);
			equal(func(a[2], opt), true);
			equal(func(a[3], opt), true);
			equal(func(a[4], opt), true);
			equal(func(a[5], opt), true);
			equal(func(a[6], opt), true);
			equal(func(a[7], opt), true);
		});
		it("any", () => {
			equal(func(b[0], opt), false);
			equal(func(b[1], opt), false);
			equal(func(b[2], opt), false);
		});
	});
	block("filter=false", () => {
		let opt = false;

		it("object", () => {
			equal(func(a[0], opt), false);
			equal(func(a[1], opt), true);
			equal(func(a[2], opt), true);
			equal(func(a[3], opt), true);
			equal(func(a[4], opt), true);
			equal(func(a[5], opt), true);
			equal(func(a[6], opt), true);
			equal(func(a[7], opt), true);
		});
		it("any", () => {
			equal(func(b[0], opt), false);
			equal(func(b[1], opt), false);
			equal(func(b[2], opt), false);
		});
	});
	block("filter=all", () => {
		let opt = "all";

		it("object", () => {
			equal(func(a[0], opt), true);
			equal(func(a[1], opt), true);
			equal(func(a[2], opt), true);
			equal(func(a[3], opt), true);
			equal(func(a[4], opt), true);
			equal(func(a[5], opt), true);
			equal(func(a[6], opt), true);
			equal(func(a[7], opt), true);
		});
		it("any", () => {
			equal(func(b[0], opt), false);
			equal(func(b[1], opt), false);
			equal(func(b[2], opt), false);
		});
	});
	block("filter=array", () => {
		let opt = "array";

		it("object", () => {
			equal(func(a[0], opt), false);
			equal(func(a[1], opt), false);
			equal(func(a[2], opt), false);
			equal(func(a[3], opt), false);
			equal(func(a[4], opt), false);
			equal(func(a[5], opt), true);
			equal(func(a[6], opt), false);
			equal(func(a[7], opt), false);
		});
		it("any", () => {
			equal(func(b[0], opt), false);
			equal(func(b[1], opt), false);
			equal(func(b[2], opt), false);
		});
	});
	block("filter=date", () => {
		let opt = "date";

		it("object", () => {
			equal(func(a[0], opt), false);
			equal(func(a[1], opt), false);
			equal(func(a[2], opt), false);
			equal(func(a[3], opt), false);
			equal(func(a[4], opt), false);
			equal(func(a[5], opt), false);
			equal(func(a[6], opt), true);
			equal(func(a[7], opt), false);
		});
		it("any", () => {
			equal(func(b[0], opt), false);
			equal(func(b[1], opt), false);
			equal(func(b[2], opt), false);
		});
	});
	block("filter=regexp", () => {
		let opt = "regexp";

		it("object", () => {
			equal(func(a[0], opt), false);
			equal(func(a[1], opt), false);
			equal(func(a[2], opt), false);
			equal(func(a[3], opt), false);
			equal(func(a[4], opt), false);
			equal(func(a[5], opt), false);
			equal(func(a[6], opt), false);
			equal(func(a[7], opt), true);
		});
		it("any", () => {
			equal(func(b[0], opt), false);
			equal(func(b[1], opt), false);
			equal(func(b[2], opt), false);
		});
	});
}

function isPromise (func) {
	const a = [new Promise(() => {}), {}];
	const b = [undefined, 1, "1", function () {}];

	it("object", () => {
		equal(func(a[0]), true);
		equal(func(a[1]), false);
	});
	it("any", () => {
		equal(func(b[0]), false);
		equal(func(b[1]), false);
		equal(func(b[2]), false);
		equal(func(b[3]), false);
	});
}

function isGenerator (func) {
	const a = [function* () {}, (function* () {})(), {}];
	const b = [undefined, 1, "1", function () {}];

	block("default", () => {
		it("object", () => {
			equal(func(a[0]), true);
			equal(func(a[1]), false);
			equal(func(a[2]), false);
		});
		it("any", () => {
			equal(func(b[0]), false);
			equal(func(b[1]), false);
			equal(func(b[2]), false);
			equal(func(b[3]), false);
		});
	});
	block("obj=true", () => {
		let opt = true;

		it("object", () => {
			equal(func(a[0], opt), true);
			equal(func(a[1], opt), true);
			equal(func(a[2], opt), false);
		});
		it("any", () => {
			equal(func(b[0], opt), false);
			equal(func(b[1], opt), false);
			equal(func(b[2], opt), false);
			equal(func(b[3], opt), false);
		});
	});
}

function isJSON (func) {
	const a = [
		"{}",
		"[1,2]",
		"{a:true,b:undefined,c:null,d:1,e:'111',f:'{a:1}',g:[1,2],h:{a:1}}",
		"{a}"
	];
	const b = [undefined, 1, "1", function () {}];

	it("json", () => {
		equal(func(a[0]), true);
		equal(func(a[1]), true);
		equal(func(a[2]), true);
		// equal(func(a[3]), false);
	});
	it("any", () => {
		equal(func(b[0]), false);
		equal(func(b[1]), false);
		equal(func(b[2]), false);
		equal(func(b[3]), false);
	});
}

function isLeapYear (func) {
	const a = [1991, 2000, 2004, 2010];

	it("default", () => {
		equal(func("a"), false);
		equal(func(a[0]), false);
		equal(func(a[1]), true);
		equal(func(a[2]), true);
		equal(func(a[3]), false);
	});
}

function isDate (func) {
	const a = [new Date(), "2000-1-1", "2009-02-29", "2000-4-31 10:59:59", "2000-01-01T10:59:59Z", "2000-13-01", "2000-01-32", "1888-1-1"];
	const b = ["", "1", NaN, 0, 1, -1, [], {}, function () {}];

	block("default", () => {
		it("date/string", () => {
			equal(func(a[0]), true);
			equal(func(a[1]), false);
			equal(func(a[2]), false);
			equal(func(a[3]), false);
			equal(func(a[4]), false);
			equal(func(a[5]), false);
			equal(func(a[6]), false);
			equal(func(a[1].replace(/-/g, "/")), false);
			equal(func(a[2].replace(/-/g, "/")), false);
			equal(func(a[3].replace(/-/g, "/")), false);
			equal(func(a[4].replace(/-/g, "/")), false);
			equal(func(a[5].replace(/-/g, "/")), false);
			equal(func(a[6].replace(/-/g, "/")), false);
		});
		it("any", () => {
			equal(func(b[0]), false);
			equal(func(b[1]), false);
			equal(func(b[2]), false);
			equal(func(b[3]), false);
			equal(func(b[4]), false);
			equal(func(b[5]), false);
			equal(func(b[6]), false);
			equal(func(b[7]), false);
			equal(func(b[8]), false);
		});
	});
	block("str=true", () => {
		let opt = true;

		it("date/string", () => {
			equal(func(a[0], opt), true);
			equal(func(a[1], opt), true);
			equal(func(a[2], opt), false);
			equal(func(a[3], opt), false);
			equal(func(a[4], opt), true);
			equal(func(a[5], opt), false);
			equal(func(a[6], opt), false);
			equal(func(a[1].replace(/-/g, "/"), opt), true);
			equal(func(a[2].replace(/-/g, "/"), opt), false);
			equal(func(a[3].replace(/-/g, "/"), opt), false);
			equal(func(a[4].replace(/-/g, "/"), opt), true);
			equal(func(a[5].replace(/-/g, "/"), opt), false);
			equal(func(a[6].replace(/-/g, "/"), opt), false);
			equal(func(a[7], opt), false);
		});
		it("any", () => {
			equal(func(b[0], opt), false);
			equal(func(b[1], opt), false);
			equal(func(b[2], opt), false);
			equal(func(b[3], opt), false);
			equal(func(b[4], opt), false);
			equal(func(b[5], opt), false);
			equal(func(b[6], opt), false);
			equal(func(b[7], opt), false);
			equal(func(b[8], opt), false);
		});
	});
}

function isTime (func) {
	const a = [new Date(), "2000-1-1", "2000-1-1 10:59:59", "2000-01-01T10:59:59Z", "10:59:59", "10:59.59.999", "10:59", "25:59:50", "14:62:00", "12:52:00.1000", "12:52:62:849"];
	const b = ["", "1", NaN, 0, 1, -1, [], {}, function () {}];

	block("default", () => {
		it("date/string", () => {
			equal(func(a[0]), true);
			equal(func(a[1]), false);
			equal(func(a[2]), false);
			equal(func(a[3]), false);
			equal(func(a[4]), false);
			equal(func(a[5]), false);
			equal(func(a[6]), false);
			equal(func(a[7]), false);
			equal(func(a[8]), false);
			equal(func(a[9]), false);
			equal(func(a[10]), false);
			equal(func(a[1].replace(/-/g, "/")), false);
			equal(func(a[2].replace(/-/g, "/")), false);
			equal(func(a[3].replace(/-/g, "/")), false);
		});
		it("any", () => {
			equal(func(b[0]), false);
			equal(func(b[1]), false);
			equal(func(b[2]), false);
			equal(func(b[3]), false);
			equal(func(b[4]), false);
			equal(func(b[5]), false);
			equal(func(b[6]), false);
			equal(func(b[7]), false);
			equal(func(b[8]), false);
		});
	});
	block("str=true", () => {
		let opt = true;

		it("date/string", () => {
			equal(func(a[0], opt), true);
			equal(func(a[1], opt), false);
			equal(func(a[2], opt), false);
			equal(func(a[3], opt), false);
			equal(func(a[4], opt), true);
			equal(func(a[5], opt), true);
			equal(func(a[6], opt), true);
			equal(func(a[7], opt), false);
			equal(func(a[8], opt), false);
			equal(func(a[9], opt), false);
			equal(func(a[10], opt), false);
			equal(func(a[1].replace(/-/g, "/"), opt), false);
			equal(func(a[2].replace(/-/g, "/"), opt), false);
			equal(func(a[3].replace(/-/g, "/"), opt), false);
		});
		it("any", () => {
			equal(func(b[0], opt), false);
			equal(func(b[1], opt), false);
			equal(func(b[2], opt), false);
			equal(func(b[3], opt), false);
			equal(func(b[4], opt), false);
			equal(func(b[5], opt), false);
			equal(func(b[6], opt), false);
			equal(func(b[7], opt), false);
			equal(func(b[8], opt), false);
		});
	});
}

function isjQuery (func) {
	const a = [null, {}, {jquery: 1}, 1, undefined, []];

	it("default", () => {
		equal(func(a[0]), false);
		equal(func(a[1]), false);
		equal(func(a[2]), true);
		equal(func(a[3]), false);
		equal(func(a[4]), false);
		equal(func(a[5]), false);
	});
}

function isGuid (func) {
	const a = [
		"00000000-0000-0000-0000-000000000000",
		"4B0F57E0-545D-4080-B9BA-88DF24DC2110",
		"4b0f57e0-545d-4080-b9ba-88df24dc2110",
		"{4b0f57e0-545d-4080-b9ba-88df24dc2110}",
		"[4b0f57e0-545d-4080-b9ba-88df24dc2110]",
		"4b0f57e10-545d-4080-b9ba-88df24dc211",
		"4b0X57e0-545d-4089-b9ba-88df24dc2110",
		"4b0X57e0-545d-4089b9ba-88df24dc21100"
	];
	const b = ["", "1", NaN, 0, 1, -1, [], {}, function () {}];

	it("guid", () => {
		equal(func(a[0]), true);
		equal(func(a[1]), true);
		equal(func(a[2]), true);
		equal(func(a[3]), true);
		equal(func(a[4]), false);
		equal(func(a[5]), false);
		equal(func(a[6]), false);
		equal(func(a[7]), false);
		equal(func(a[8]), false);
	});
	it("any", () => {
		equal(func(b[0]), false);
		equal(func(b[1]), false);
		equal(func(b[2]), false);
		equal(func(b[3]), false);
		equal(func(b[4]), false);
		equal(func(b[5]), false);
		equal(func(b[6]), false);
		equal(func(b[7]), false);
		equal(func(b[8]), false);
	});
}

function isBase64 (func) {
	const a = [
		"dmFsdWU=",
		"dmFs0909+dW=",
		"dmFsdWU==",
		"dmF=dWU=",
		"dmFsd=U=",
		"dmF-dWU="
	];
	const b = ["", "1", NaN, 0, 1, -1, [], {}, function () {}];

	it("base64", () => {
		equal(func(a[0]), true);
		equal(func(a[1]), true);
		equal(func(a[2]), false);
		equal(func(a[3]), false);
		equal(func(a[4]), false);
		equal(func(a[5]), false);
	});
	it("any", () => {
		equal(func(b[0]), false);
		equal(func(b[1]), false);
		equal(func(b[2]), false);
		equal(func(b[3]), false);
		equal(func(b[4]), false);
		equal(func(b[5]), false);
		equal(func(b[6]), false);
		equal(func(b[7]), false);
		equal(func(b[8]), false);
	});
}