#!/usr/bin/env node

const $        = require("./jShow.js");
const program  = require("commander");
const fs       = require("fs");
const path     = require("path");
const readline = require("readline");
const et       = process.exit;
const version  = require("./package.json").version;

const func = {
	exit (code) {
		let draining = 0;
		let streams  = [process.stdout, process.stderr];

		const done = () => {
			if (!(draining--)) et(code);
		};

		func.exited = true;

		streams.forEach(stream => {
			draining += 1;
			stream.write("", done);
		});

		done();
	},
	before (obj, method, fn) {
		let old = obj[method];

		obj[method] = function () {
			fn.call(this);
			old.apply(this, arguments);
		};
	},
	confirm (msg, callback) {
		let rl = readline.createInterface({
			input:  process.stdin,
			output: process.stdout
		});

		rl.question(msg, input => {
			rl.close();
			callback(/^y|yes|ok|true$/i.test(input));
		});
	},
	empty (path, fn) {
		fs.readdir(path, (err, files) => {
			if (err && (err.code !== "ENOENT")) throw err;
			fn(!files || !files.length);
		});
	},
	mkdir (root, refer) {
		if (!fs.existsSync(root)) fs.mkdirSync(root);

		console.log("	\033[36mcreate\033[0m : ./" + path.relative(refer, root));
	},
	cpdir (src, dest, refer) {
		const list = (src, callback) => {
			let l     = fs.readdirSync(src),
				state = true,
				count = 0;

			for (let i = 0, o; i < l.length; i++) {
				if (!state) return;

				count++;
				o = path.join(src, l[i]);

				if (callback(l[i], o, fs.statSync(o)) === false) break;
			}
		};
		const file = (src, dest) => {
			fs.writeFileSync(dest, fs.readFileSync(src));
			console.log(`	\x1b[36mcopy\x1b[0m : ./${path.relative(refer, dest)}`);
		};
		const dir  = (src, dest) => {
			if (!fs.existsSync(dest)) fs.mkdirSync(dest);

			list(src, (f, p, o) => {
				if (o.isDirectory()) dir(path.join(src, f), path.join(dest, f));
				else file(path.join(src, f), path.join(dest, f));
			});
		};

		src = path.join(__dirname, "../template", program.type || "koa", src);

		dir(src, dest);
	},
	write (root, str, refer) {
		fs.writeFileSync(root, str, {mode: 666});
		console.log(`	\x1b[36mcreate\x1b[0m : ./${path.relative(refer, root)}`);
	},
	launch () {
		return process.platform === "win32" && process.env._ === undefined;
	},
	load (name) {
		return fs.readFileSync(path.join(__dirname, "../template", program.type || "koa", name), "utf-8");
	}
};

process.exit = func.exit;

func.before(program, "outputHelp", function () {
	this.allowUnknownOption();
});

program
	.version(version, "-v, --version")
	.usage("<cmd> <dir>");

// require("./bin/svr.js")(program, func);
// require("./bin/socket.js")(program, func);
// require("./bin/nano.js")(program, func);

program.parse(process.argv);

if (program.args.length < 2) program.help();

if (func.exited) return;