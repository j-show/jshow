const fs      = require("fs");
const path    = require("path");
const del     = require("del");
const gulp    = require("gulp");
const replace = require("gulp-replace");

const delDest          = dest => del.sync(dest);
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
	delete pkg.dependencies;
	delete pkg.devDependencies;
	delete pkg.scripts;

	pkg.main = "jShow.js";

	fs.writeFileSync(path.join(dist, "package.json"), JSON.stringify(pkg, null, 4));
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
};
const initCore_Test    = (src, dist, cfg, version) => {
	let frame = readFile(src, "jShow.js"),
		code  = readCode(cfg.core, `${src}/core`);

	fs.writeFileSync(
		path.join(dist, "jShow.js"),
		frame
			.replace('"@Code";', code)
			.replace("@version", version)
			.replace('"@Loading";', "")
	);
};

function clean () {
	return new Promise(done => {
		delDest(["./dist/*"]);

		done();
	});
}

function build () {
	const src  = "./src";
	const dest = "./dist/release";
	const pkg  = require("./package.json");
	const cfg  = require("./build.json");

	delDest([dest + "/*"]);
	mkDest(path.join(dest));

	initCore_Release(src, dest, cfg, pkg.version);
	initPackage(pkg, dest);

	gulp.src(`${src}/lib/*.js`).pipe(gulp.dest(`${dest}/lib`));

	return gulp.src(`${src}/README.md`).pipe(gulp.dest(dest));
}

function test () {
	const src  = "./src",
		  dest = "./dist/test",
		  pkg  = require("./package.json"),
		  cfg  = require("./build.json");

	delDest([dest]);
	mkDest(path.join(dest));

	initCore_Test(src, dest, cfg, pkg.version);
	initPackage(pkg, dest);

	return gulp.src(`${src}/lib/*.js`).pipe(gulp.dest(`${dest}/lib`));
}

gulp.task("clean", clean);
gulp.task("test", test);
gulp.task("build", build);
gulp.task("default", gulp.series("clean", "build", "test"));