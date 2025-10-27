console.log("Starting...");
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const https = require("https");
const path = require("path");
const mime = require("mime-types");
const crypto = require("crypto");
require("dotenv").config();
const port = process.env.PORT || 443;
const port_http = process.env.PORT_HTTP || 80;
const credentials = port_http === "only" ? {} : {
	key: fs.readFileSync(process.env.KEY_PATH || "keys/key.pem", "utf8"),
	cert: fs.readFileSync(process.env.CERT_PATH || "keys/cert.pem", "utf8")
};
const app = express();
const helmet = require("helmet");
app.use(helmet());
const os = require("os");
const hasIPv6 = Object.values(os.networkInterfaces()).some(list => list.some(i => i.family === "IPv6"));
const host = hasIPv6 ? "::" : "0.0.0.0";

function isObject (obj) {
	return obj && typeof obj === "object" && !Array.isArray(obj)
}

function toObject (obj) {
	return isObject(obj) ? obj : {}
}

function makeHash (password) {
	const salt = crypto.randomBytes(16);
	const hash = crypto.scryptSync(password, salt, 64);
	return {
		salt: salt.toString("base64"),
		hash: hash.toString("base64")
	}
}

function verifyHash (password, saltB64, hashB64) {
	const salt = Buffer.from(saltB64, "base64");
	const hash2 = crypto.scryptSync(password, salt, 64).toString("base64");
	return hash2 === hashB64
}

function checkString (text) {
	return text && typeof text === "string"
}

function checkName (username) {
	return checkString(username) && /^[\a-zA-Z_\-][\a-zA-Z_\-0-9]{0,19}$/.test(username)
}

const dataPath = "./data.json"

function getData () {
	try {
		return toObject(JSON.parse(fs.readFileSync(dataPath, "utf8") || "{}"))
	} catch {
		return {}
	}
}
const userData = getData();
function saveData(){
	fs.writeFileSync(dataPath, JSON.stringify(userData, null, 2));
}
app.use(cors());
app.use(bodyParser.json());
app.post("/api/", (req, res) => {
	const receivedContent = req.body.content || {};
	if (receivedContent.type == "save") {
		if (!checkName(receivedContent.name)) {
			return res.json({
				type: "faild",
				message: "Invalid username"
			})
		}
		if (!checkString(receivedContent.password)) {
			return res.json({
				type: "faild",
				message: "Invalid username"
			})
		}
		if (!isObject(receivedContent.data)) {
			return res.json({
				type: "faild",
				message: "Invalid data"
			})
		}
		let salt, hash;
		if (userData[receivedContent.name]) {
			salt = userData[receivedContent.name].salt;
			hash = userData[receivedContent.name].hash;
			if (!verifyHash(receivedContent.password, salt, hash)) {
				return res.json({
					type: "faild",
					message: "Incorrect passowrd"
				})
			}
		} else {
			const newHash = makeHash(receivedContent.password);
			salt = newHash.salt;
			hash = newHash.hash
		}
		userData[receivedContent.name] = {
			hash,
			salt,
			data: receivedContent.data
		};
		saveData();
		return res.json({
			type: "successed"
		});
	} else if (receivedContent.type == "get") {
		if (!checkName(receivedContent.name)) {
			return res.json({
				type: "faild",
				message: "Invalid username"
			})
		}
		if (!checkString(receivedContent.password)) {
			return res.json({
				type: "faild",
				message: "Invalid username"
			})
		}
		if (!userData[receivedContent.name]) {
			return res.json({
				type: "faild",
				message: "User not found"
			})
		}
		let {
			salt,
			hash,
			data
		} = userData[receivedContent.name];
		if (!verifyHash(receivedContent.password, salt, hash)) {
			return res.json({
				type: "faild",
				message: "Incorrect passowrd"
			})
		}
		return res.json({
			type: "successed",
			data
		});
	} else if (receivedContent.type == "check") {
		if (!checkName(receivedContent.name)) {
			return res.json({
				type: "faild",
				message: "Invalid username"
			})
		}
		if (userData[receivedContent.name]) {
			return res.json({
				type: "successed",
				isValid: true
			})
		} else {
			return res.json({
				type: "successed",
				isValid: false
			})
		}
	}
	res.json({
		message: "faild"
	})
});
const CLIENT_DIR = "docs";

function getSafePath (urlPath) {
	let safeUrlPath = decodeURIComponent(urlPath.split("?")[0]);
	let safePath = path.normalize(path.join(CLIENT_DIR, safeUrlPath));
	if (!safePath.startsWith(CLIENT_DIR) || safePath.includes("\0")) {
		return null
	}
	return safePath
}
async function readFileAsync (filePath) {
	return fs.promises.readFile(filePath)
}
async function requestHandler (req, res) {
	try {
		const R404 = async () => {
			let fileContent = await readFileAsync(getSafePath("/404.html"));
			return res.writeHead(404, {
				"Content-Type": "text/html; charset=utf-8",
				"Cache-Control": "no-cache, no-store, must-revalidate",
				"Content-Disposition": "inline",
				"Cross-Origin-Resource-Policy": "same-origin",
				"X-Frame-Options": "DENY",
				"Content-Security-Policy": "frame-ancestors 'none'",
				"X-Content-Type-Options": "nosniff",
				"X-XSS-Protection": "1; mode=block",
				"Referrer-Policy": "no-referrer",
				"Permissions-Policy": "geolocation=(), camera=(), microphone=()"
			}).end(fileContent)
		};
		if (req.url === "/404" || req.url === "/404.html") {
			return await R404()
		}
		let safePath = getSafePath(req.url);
		if (!safePath) {
			res.writeHead(403, {
				"Content-Type": "text/plain"
			});
			return res.end("403 Forbidden")
		}
		let contentType = mime.lookup(safePath) || "application/octet-stream";
		if (!contentType || contentType === "application/octet-stream") {
			contentType = "text/html"
		}
		try {
			let fileContent = await readFileAsync(safePath);
			return res.writeHead(200, {
				"Content-Type": contentType,
				"Cache-Control": "public, max-age=3600",
				"Content-Disposition": "inline",
				"Cross-Origin-Resource-Policy": "same-origin",
				"X-Frame-Options": "DENY",
				"Content-Security-Policy": "frame-ancestors 'none'",
				"X-Content-Type-Options": "nosniff",
				"X-XSS-Protection": "1; mode=block",
				"Referrer-Policy": "no-referrer",
				"Permissions-Policy": "geolocation=(), camera=(), microphone=()"
			}).end(fileContent)
		} catch (err) {
			try {
				let fileContent = await readFileAsync(safePath + ".html");
				return res.writeHead(200, {
					"Content-Type": contentType,
					"Cache-Control": "public, max-age=3600",
					"Content-Disposition": "inline",
					"Cross-Origin-Resource-Policy": "same-origin",
					"X-Frame-Options": "DENY",
					"Content-Security-Policy": "frame-ancestors 'none'",
					"X-Content-Type-Options": "nosniff",
					"X-XSS-Protection": "1; mode=block",
					"Referrer-Policy": "no-referrer",
					"Permissions-Policy": "geolocation=(), camera=(), microphone=()"
				}).end(fileContent)
			} catch (err) {
				try {
					let fileContent = await readFileAsync(safePath + "/index.html");
					return res.writeHead(200, {
						"Content-Type": contentType,
						"Cache-Control": "public, max-age=3600",
						"Content-Disposition": "inline",
						"Cross-Origin-Resource-Policy": "same-origin",
						"X-Frame-Options": "DENY",
						"Content-Security-Policy": "frame-ancestors 'none'",
						"X-Content-Type-Options": "nosniff",
						"X-XSS-Protection": "1; mode=block",
						"Referrer-Policy": "no-referrer",
						"Permissions-Policy": "geolocation=(), camera=(), microphone=()"
					}).end(fileContent)
				} catch (err) {
					try {
						if (req.url.startsWith("/lib/") || req.url == "/lib") {
							return res.writeHead(404, {
								"Content-Type": "text/plain; charset=utf-8",
								"Cache-Control": "no-cache, no-store, must-revalidate",
								"X-Content-Type-Options": "nosniff",
								"X-Frame-Options": "DENY",
								"Referrer-Policy": "no-referrer",
								"Permissions-Policy": "geolocation=(), camera=(), microphone=()",
								"Cross-Origin-Resource-Policy": "same-origin",
								"Content-Security-Policy": "sandbox; default-src 'none'; script-src 'none'; style-src 'self'; img-src 'self'; object-src 'none'; base-uri 'none'"
							}).end("//This file is not avalable.")
						} else {
							return await R404()
						}
					} catch (err) {
						return res.writeHead(404, {
							"Content-Type": "text/plain; charset=utf-8",
							"Cache-Control": "no-cache, no-store, must-revalidate",
							"X-Content-Type-Options": "nosniff",
							"X-Frame-Options": "DENY",
							"Referrer-Policy": "no-referrer",
							"Permissions-Policy": "geolocation=(), camera=(), microphone=()",
							"Cross-Origin-Resource-Policy": "same-origin",
							"Content-Security-Policy": "sandbox; default-src 'none'; script-src 'none'; style-src 'self'; img-src 'self'; object-src 'none'; base-uri 'none'"
						}).end("")
					}
				}
			}
		}
	} catch (err) {
		res.writeHead(500, {
			"Content-Type": "text/plain"
		}).end("500 Internal Server Error")
	}
}
app.use(async (req, res, _next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, content-type");
	if (req.method === "OPTIONS") {
		res.writeHead(204);
		return res.end()
	}
	await requestHandler(req, res)
});
const server = port_http === "only" ? http.createServer(app) : https.createServer(credentials, app);
server.listen(port, host, () => {
	console.log(`服务器运行在: http://localhost:${port} && `);
	console.log(`main https server运行在: http://localhost:${port} && `);
	console.log(`https server2运行在: http://localhost:${port}`)
}).on("error", err => {
	if (err.code === "EADDRINUSE") {
		console.log(`服务器启动失败: http://localhost:${port} && `);
		console.log(`main https server启动失败: http://localhost:${port} && `);
		console.log(`https server2启动失败: http://localhost:${port}`);
		process.exit(1)
	} else {
		throw err
	}
});
if (port_http !== "only") {
	if (port_http !== "close") {
		http.createServer((req, res) => {
			res.writeHead(301, {
				Location: `https://${req.headers.host}${req.url}`
			});
			res.end()
		}).listen(port_http, host, () => {
			console.log(`http 重定向服务器运行在: http://localhost:${port_http}`)
		}).on("error", err => {
			if (err.code === "EADDRINUSE") {
				console.log(`http 重定向服务器启动失败: http://localhost:${port_http}`);
				process.exit(1)
			} else {
				throw err
			}
		})
	}
}
