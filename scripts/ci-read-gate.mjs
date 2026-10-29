import fs from "node:fs";
const outputPath = process.env.GITHUB_OUTPUT;
if (!outputPath) {
	console.error("GITHUB_OUTPUT is not set");
	process.exit(1)
}
const statusPath = "status.json";
if (!fs.existsSync(statusPath)) {
	fs.appendFileSync(outputPath, "should_release=false\n");
	console.log("status.json is missing — skipping the release.");
	process.exit(0)
}
try {
	const status = JSON.parse(fs.readFileSync(statusPath, "utf8"));
	const shouldRelease = status.needsUpdate === true;
	fs.appendFileSync(outputPath, `should_release=${shouldRelease}\n`);
	console.log(shouldRelease ? "needsUpdate is true — running build and release." : "needsUpdate is false — skipping the release.")
} catch (error) {
	fs.appendFileSync(outputPath, "should_release=false\n");
	console.log(`Invalid status.json — skipping the release: ${error.message}`)
}
