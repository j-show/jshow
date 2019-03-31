/**
 * ==========================================
 * Name:           jShow's Load Module
 * Author:         j-show
 * CreTime:        2019-03-14
 * Description:    Node.js Load Module
 * Log:
 * 2019-03-14    Init Class
 * ==========================================
 */
($ => {
	if ($.mode !== $.MODE.Node) return;

	$.__require = $.require = (url, tag) => {
		if (tag === void(0)) tag = url;

		return this[tag] = require(url);
	};

	$.__define = $.define = (factory, own, deps, alias, exec) => {
		if ($.isFunction(factory) && exec !== false) factory = factory(own.module, own.exports, require);

		return own.module.exports = factory;
	}
})(this);