import fs from "node:fs";
import esbuild from "esbuild";
const cliPath = "cli/main.mjs";
const outputPath = "fishing-cli.mjs";
const marker = 'import * as fishing from "../source-code/main.js";';
const cli = fs.readFileSync(cliPath, "utf8");
const markerCount = cli.split(marker).length - 1;
if (markerCount !== 1) {
	throw new Error(`Expected exactly one ${marker} marker, found ${markerCount}`)
}
const result = await esbuild.build({
	entryPoints: ["main.js"],
	bundle: true,
	format: "iife",
	globalName: "fishing",
	platform: "node",
	write: false
});
fs.writeFileSync(outputPath, cli.replace(marker, result.outputFiles[0].text), "utf8");
console.log(`Built ${outputPath}`);
