/**
 * ==========================================
 * Name:           jShow's Loading
 * Author:         j-show
 * CreTime:        2019-03-14
 * Description:    Node.js Tools Loading
 * Log:
 * 2019-03-14    Init Class
 * ==========================================
 */
($ => {
	if ($.mode != $.MODE.Node) return;

	$.__require("./lib/node/net", "Net");
	// $.__require("./lib/node/db", "DB");
	$.__require("./lib/node/log", "Log");
	$.__require("./lib/node/fs", "FS");
	// $.__require("./lib/node/zip", "Zip");
})(this);