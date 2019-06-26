const fs    = require("fs");
const path  = require("path");
const gulp  = require("gulp");
const clean = require("gulp-clean");

const mkDest           = dest => {
	if (fs.existsSync(dest)) return;

	dest = dest.replace(/\\/g, "/").split("/");

	for (let i = 0, o = "", d = ""; i < dest.length; i++) {
		d = dest[i];

		if (d) {
			if (!i && d[d.length - 1] === ":") o = d;
			else if (!fs.existsSync(o = path.join(o, d))) fs.mkdirSync(o);
		}
		else if (i === 0) o = "/";
	}
};
const readFile         = (ph, fn, n) => {
	fn = path.join(ph, fn);
	n  = n ? "\n" : "";
	if (!fs.existsSync(fn)) return "";
	else return fs.readFileSync(fn, "utf-8") + n;
};
const readCode         = (cfg, src) => {
	let code = "";

	for (let i = 0, d; i < cfg.length; i++) {
		d = cfg[i];

		if (d[0] !== "%") code += readFile(src, d, 1);
		else {
			d = d.substr(1);
			code += readFile(src, `web_${d}`, 1);
			code += readFile(src, `node_${d}`, 1);
		}
	}

	return code;
};
const initPackage      = (pkg, dist) => {
	delete pkg.devDependencies;
	delete pkg.scripts;

	pkg.main = "jShow.js";

	fs.writeFileSync(path.join(dist, "package.json"), JSON.stringify(pkg, null, 4));

	console.log(` ├─ package.json`);
};
const initCore_Release = (src, dist, cfg, version) => {
	let frame = readFile(src, "jShow.js");
	let code  = [
		readCode(cfg.core, `${src}/core`),
		readCode(cfg.loading, `${src}/loading`)
	];

	fs.writeFileSync(
		path.join(dist, "jShow.js"),
		frame
			.replace('"@Code";', code[0])
			.replace("@version", version)
			.replace('"@Loading";', code[1])
	);

	console.log(" ├─ jShow.js");
};

gulp.task("clean", function () {
	return gulp
		.src(
			[
				"./dist/*"
			],
			{allowEmpty: true}
		)
		.pipe(clean({force: true}));
});

gulp.task("build", function () {
	const src  = "./src";
	const dest = "./dist";
	const pkg  = require("./package.json");
	const cfg  = require("./build.json");

	mkDest(path.join(dest));

	console.log(`─┬─ release ${pkg.version}`);
	initCore_Release(src, dest, cfg, pkg.version);

	// gulp.src(`${src}/Generator.js`).pipe(gulp.dest(dest));
	// console.log(` ├─ Generator.js`);

	initPackage(pkg, dest);

	return gulp
		.src([
			`${src}/*.md`,
			`${src}/!(core|loading|bin)/*.js`
		])
		.pipe(gulp.dest(`${dest}`))
		.on("data", (d) => {
			console.log(` ├─ ${d.history[0].substring(d._base.length)}`);
		})
		.on("finish", () => {
			console.log(" └─ done\n");
		});
});

gulp.task("default", gulp.series("clean", "build"));