import fs from "node:fs";
import esbuild from "esbuild";
const indexPath = "docs/index.html";
const marker = '"import fishing";';
const index = fs.readFileSync(indexPath, "utf8");
const xtermCssTag = '<link rel="stylesheet" href="lib/xterm.min.css">';
const xtermJsTag = '<script src="lib/xterm.min.js"></script>';

function replaceOnce(source, target, replacement) {
	const count = source.split(target).length - 1;
	if (count !== 1) {
		throw new Error(`Expected exactly one ${target} marker, found ${count}`);
	}
	return source.replace(target, replacement)
}
const result = await esbuild.build({
	entryPoints: ["main.js"],
	bundle: true,
	format: "iife",
	globalName: "fishing",
	write: false,
});
const xtermCss = fs.readFileSync("docs/lib/xterm.min.css", "utf8");
const xtermJs = fs.readFileSync("docs/lib/xterm.min.js", "utf8");
let output = replaceOnce(index, xtermCssTag, `<style>\n${xtermCss}\n</style>`);
output = replaceOnce(output, xtermJsTag, `<script>\n${xtermJs}\n</script>`);
output = replaceOnce(output, marker, result.outputFiles[0].text);
fs.writeFileSync(indexPath, output, "utf8");
console.log(`Built ${indexPath}`);
