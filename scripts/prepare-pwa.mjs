import {
	readFile,
	writeFile,
	copyFile
} from "node:fs/promises"
import {
	join
} from "node:path"
const output = "page"
const htmlPath = join(output, "index.html")
const html = (await readFile(htmlPath, "utf8")).replace("<!-- @head -->", `<link rel="manifest" href="./manifest.webmanifest"><meta name="theme-color" content="#4e0e3b"><link rel="apple-touch-icon" href="./icon-192.png">`).replace("<!-- @body -->", `<script>if("serviceWorker"in navigator){navigator.serviceWorker.register("./sw.js").catch(console.error)}</script>`)
await writeFile(htmlPath, html, "utf8")
const files = [
	["pwa/manifest.webmanifest", "manifest.webmanifest"],
	["pwa/sw.js", "sw.js"],
	["electron/icons/192x192.png", "icon-192.png"],
	["electron/icons/512x512.png", "icon-512.png"]
]
for (const [source, destination] of files) {
	await copyFile(source, join(output, destination))
	console.log(`${source} -> ${join(output, destination)}`)
}
console.log("Pages PWA prepared successfully")
