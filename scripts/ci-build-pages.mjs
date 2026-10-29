import fs from "node:fs";
import esbuild from "esbuild";

const indexPath = "docs/index.html";
const marker = '"import fishing";';
const index = fs.readFileSync(indexPath, "utf8");
const markerCount = index.split(marker).length - 1;

if (markerCount !== 1) {
	throw new Error(`Expected exactly one ${marker} marker, found ${markerCount}`);
}

const result = await esbuild.build({
	entryPoints: ["main.js"],
	bundle: true,
	format: "iife",
	globalName: "fishing",
	write: false,
});

fs.writeFileSync(indexPath, index.replace(marker, result.outputFiles[0].text), "utf8");
console.log(`Built ${indexPath}`);
