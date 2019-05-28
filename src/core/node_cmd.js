/**
 * ==========================================
 * Name:           jShow's Load Module
 * Author:         j-show
 * CreTime:        2019-03-14
 * Description:    Node.js Load Module
 * Log:
 * 2019-03-14    Init Class
 * 2019-05-20    Format Code to jShow Style Guide
 * ==========================================
 */
(owner => {
	const $ = global.jShow;

	if ($.mode !== $.MODE.Node) return;

	const _require = (url, tag, owner) => owner[tag || url] = require(url);
	const _define = (alias, deps = alias, factory = deps, owner = factory, exec = owner) => {
		let modules = $.isArray(deps) ? [...deps] : [];
		let func = factory;

		modules.forEach((d, i) => {
			modules[i] = $[d] || require(d);
		});

		if ($.isFunction(func) && exec !== false) {
			func = func(require, owner, ...modules);
			if (func === void(0)) func = owner.exports;
		}

		owner.exports = func;

		return owner.exports;
	};

	const api = {
		__require: _require,
		require:   _require,
		__define:  _define,
		define:    _define
	};

	jShow = {...owner, ...api};

	if (!global.define) global.define = api.define;
})(jShow);