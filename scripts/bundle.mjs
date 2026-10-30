import * as esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import {
	fileURLToPath
} from "node:url";
import {
	minify
} from "terser";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(root, "source-code/main.js");
const esResult = await esbuild.build({
	entryPoints: [entry],
	bundle: true,
	format: "esm",
	platform: "neutral",
	write: false,
	minify: true
});
const bundled = esResult.outputFiles[0].text;
const tResult = await minify(bundled, {
	module: true,
	toplevel: true,
	compress: {
		ecma: 2020,
		passes: 5,
		inline: 3,
		reduce_funcs: true,
		reduce_vars: true,
		collapse_vars: true,
		unused: true,
		dead_code: true,
		drop_debugger: true
	},
	mangle: {
		toplevel: true
	},
	format: {
		comments: false,
		ecma: 2020
	}
});
if (!tResult.code) {
	throw new Error("terser produced no output")
}
const out = path.join(root, "main.js");
fs.writeFileSync(out, tResult.code);
