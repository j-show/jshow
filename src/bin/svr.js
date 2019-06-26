const path = require("path");

let func;

const plugins = val => {
	val = val.split(",");

	for (var i = 0, r = ["DB"]; i < val.length; i++) {
		switch (val[i].toLowerCase()) {
			default:
			case "db":
				break;
			case "file":
				r.push("File");
				break;
			case "act":
				r.push("Act");
				break;
			case "chk":
				r.push("Chk");
				break;
			case "pay":
				r.push("Pay");
				break;
			case "auth":
				r.push("Auth");
				break;
		}
	}

	return r;
};

const createPlugins  = function (plugins) {
	let p0 = "",
		p1 = "";

	for (let i = 0; plugins && i < plugins.length; i++) {
		switch (plugins[i]) {
			default:
				continue;
			case "DB":
				p0 += "DB: jSvr.DB";
				p1 += "\"db\": {}";
				break;
			case "Act":
				p0 += "Act: jSvr.Act";
				p1 += "\"act\": {}";
				break;
			case "File":
				p0 += "File: jSvr.File";
				p1 += "\"file\": {}";
				break;
			case "Chk":
				p0 += "Chk: jSvr.Chk";
				p1 += "\"chk\": {}";
				break;
			case "Pay":
				p0 += "Pay: jSvr.Pay";
				p1 += "\"pay\": {}";
				break;
			case "Auth":
				p0 += "Auth: jSvr.Auth";
				p1 += "\"auth\": {}";
				break;
		}

		if (i + 1 < plugins.length) {
			p0 += ", ";
			p1 += ", ";
		}
	}

	this.index  = this.index.replace("{plugins1}", p0);
	this.config = this.config.replace("{plugins}", p1);
};
const createModule   = function (root, name, plugins) {
	func.mkdir(root, this.root);

	let core = func.load("module/core.js"),
		p1   = "",
		p2   = "",
		p3   = "";

	for (let i = 0; plugins && i < plugins.length; i++) {
		switch (plugins[i]) {
			default:
				continue;
			case "DB":
				p1 += "DB";
				p2 += "(DB = plugins.DB(cfg.db)).Open(cfg.db.name);";
				p3 += ".set(\"db\", DB)";
				break;
			case "File":
				p1 += "FILE";
				p2 += "FILE = plugins.File(cfg.file, DB, url)";
				p3 += ".set(\"file\", FILE)";
				break;
			case "Pay":
				p1 += "PAY";
				p2 += "PAY = plugins.Pay(cfg.pay, DB)";
				p3 += ".set(\"pay\", PAY)";
				break;
			case "Auth":
				p1 += "AUTH";
				p2 += "AUTH = plugins.File(cfg.auth, DB)";
				p3 += ".set(\"auth\", AUTH)";
				break;
		}

		if (i + 1 < plugins.length) {
			p1 += ", ";
			p2 += "\n";
			p3 += "\n";
		}
	}

	core = core.replace(/{name}/g, "T" + name);
	core = core.replace("{plugins1}", p1 && `let ${p1};`);
	core = core.replace("{plugins2}", p2);
	core = core.replace("{plugins3}", p3 && `core\n${p3};`);

	func.write(`${root}/${name}.js`, core, this.root);

	this.index  = this.index.replace("{module1}", `const ${name} = require(\"./module/${name}.js\");`);
	this.index  = this.index.replace("{module2}", name);
	this.config = this.config.replace("{name}", name);
};
const createAPI      = function (root) {
	func.mkdir(root, this.root);

	func.write(`${root}/test.js`, func.load("/api/test.js"), this.root);
};
const createPage     = function (root) {
	func.mkdir(root, this.root);

	func.write(`${root}/index.js`, func.load("/page/index.js"), this.root);
};
const createCSS      = function (root, name) {
	if (name === "css") return;

	root += "/" + name;
	func.mkdir(root, this.root);

	func.write(`${root}/layout.${name}`, func.load(`/${name}/layout.${name}`), this.root);
	func.write(`${root}/index.${name}`, func.load(`/${name}/index.${name}`), this.root);

	this.index = this.index.replace("{css}", "");
};
const createTemplate = function (root, name) {
	func.mkdir(root, this.root);

	switch (name) {
		case "ejs":
			func.write(`${root}/_layout.ejs`, func.load("/view/pug/_layout.ejs"), this.root);
			func.write(`${root}/index.ejs`, func.load("/view/pug/index.ejs"), this.root);
			break;
		case "pug":
			func.write(`${root}/_layout.pug`, func.load("/view/pug/_layout.pug"), this.root);
			func.write(`${root}/index.pug`, func.load("/view/pug/index.pug"), this.root);
			break;
	}
};
const createMain     = function (root, cfg) {
	this.index = this.index.replace("{module1}", "");
	this.index = this.index.replace("{module2}", "jSvr.Core");
	this.index = this.index.replace("{plugins1}", "");
	this.index = this.index.replace("{css}", "return;");

	this.config = this.config.replace("{name}", "test");
	this.config = this.config.replace("{plugins}", "");

	func.write(`${root}/index.js`, this.index, this.root);
	func.write(`${root}/config.json`, this.config, this.root);

	if (cfg.view) func.cpdir("../public", `${root}/public`, this.root);
};
const createPackage  = function (root, cfg, name) {
	const pkg = {
		name:         name,
		version:      "0.0.1",
		private:      true,
		main:         "index",
		dependencies: {
			jbd:  "*",
			jsvr: "*"
		}
	};

	if (cfg.css !== "css") (pkg.devDependencies = {})["koa2-compass"] = "*";

	((arg, pkg) => {
		switch (arg) {
			default:
				return;
			case "pug":
				pkg["pug"] = "*";
				break;
			case "ejs":
				pkg["ejs"] = "*";
				break;
		}

		pkg["koa-views"] = "*";
	})(cfg.template, pkg.dependencies);

	((arg, pkg) => {
		if (!arg) return;

		for (let i = 0; i < arg.length; i++) {
			switch (arg[i]) {
				case "Chk":
					pkg["svg-captcha"] = "*";
					break;
				case "File":
					pkg["koa-multer"] = "*";
					break;
			}
		}
	})(cfg.plugins, pkg.dependencies);

	func.write(`${root}/package.json`, JSON.stringify(pkg, null, 4), this.root);
};
const createApp      = (root, cfg) => {
	const core = {
			  root:   root,
			  index:  func.load("/index.js"),
			  config: func.load("/config.json")
		  },
		  name = cfg.name;

	core.complete = function (prompt) {
		prompt = func.launch() ? ">" : "$";

		console.log("");
		console.log("	install dependencies");
		console.log("		%s cd %s && npm install", prompt, root);
		console.log("");
		console.log("	run the app;");

		if (func.launch()) {
			console.log("		%s SET DEBUG=%s* & npm start", prompt, name);
		}
		else {
			console.log("		%s DEBUG=%s:* npm start", prompt, name);
		}

		console.log("");
	};

	func.mkdir(root, "");

	if (cfg.plugins) createPlugins.call(core, cfg.plugins);
	if (cfg.module) createModule.call(core, `${root}/module`, cfg.module.toUpperCase(), cfg.plugins);
	if (cfg.api) createAPI.call(core, `${root}/api`);
	if (cfg.page) createPage.call(core, `${root}/page`);
	if (cfg.view) {
		createCSS.call(core, root, cfg.css);
		createTemplate.call(core, `${root}/view`, cfg.template);
	}

	createMain.call(core, root, cfg, name);
	createPackage.call(core, root, cfg, name);

	core.complete();
};

module.exports = (program, f) => {
	func = f;

	program
		.command("svr <div>")
		.description("init root")
		.option("-f, --force", "force on non-empty directory")
		.option("-n, --name <name>", "Project Name")
		.option("-m, --module <name>", "Core Module Name")
		.option("-T, --type <name>", "chose type (koa|express) (defaults to koa)", /^(koa|express)$/i, "koa")
		.option("-p, --plugins <items>", "add Plugins Module", plugins)
		.option("    --api", "add API Module")
		.option("    --page", "add Page Module")
		.option("-c, --css <engine>", "add Stylesheet <engine> support (scss|css) (defaults to plain css)", /^(scss)$/i)
		.option("-t, --template <engine>", "add Template <engine> support (pug|ejs) (defaults to pug)", /^(pug|ejs)$/i)
		.option("    --package <items>", "Package Module support (apvm) (a=api, p=page, v=view & template, m=module)")
		.action(function (dir, opt) {
			if (!dir) throw "fail dir";

			dir = path.resolve(dir);

			let force = opt.force;
			let name  = typeof(opt.name) === "string" ? opt.name : path.basename(dir);
			let cfg   = {
				name:     name,
				module:   opt.module,
				type:     opt.type || "koa",
				plugins:  opt.plugins || [],
				api:      opt.api,
				page:     opt.page,
				view:     opt.css || opt.template || opt.page,
				css:      opt.css || "scss",
				template: opt.template || "pug"
			};
			let val   = [...(opt.package || "")];

			val.forEach(d => {
				switch (d.toLowerCase()) {
					case "a":
						if (!cfg.api) cfg.api = true;
						break;
					case "p":
						if (!cfg.page) cfg.page = true;
						break;
					case "v":
						if (!cfg.view) cfg.view = true;
						break;
					case "m":
						if (!cfg.module) cfg.module = cfg.name.toUpperCase();
						break;
				}
			});

			func.empty(dir, empty => {
				if (empty || force) createApp(dir, cfg);
				else {
					func.confirm("destination is not empty, continue? [y/N]", ok => {
						if (ok) {
							process.stdin.destroy();
							createApp(dir, cfg);
						}
						else {
							console.error("aborting");
							func.exit(1);
						}
					});
				}
			});
		});
};