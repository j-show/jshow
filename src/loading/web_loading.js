/**
 * ==========================================
 * Name:           jShow's Loading
 * Author:         j-show
 * CreTime:        2019-03-14
 * Description:    Web Tools Loading
 * Log:
 * 2019-03-14    Init Class
 * ==========================================
 */
($ => {
	if ($.mode & $.MODE.Web) {
		// $.__require("./lib/web/dom", "DOM");
		$.__require("./lib/web/request", "Request");
		$.__require("./lib/web/cookie", "Cookie");
		$.__require("./lib/web/storage", "Storage");
		$.__require("./lib/web/history", "History");
	}

	if ($.mode & $.MODE.WebDesktop) {

	}

	if ($.mode & $.MODE.WebMobile) {

	}
})(this);