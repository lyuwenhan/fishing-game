import fs from "node:fs/promises";
import path from "node:path";
import * as fishing from "../source-code/main.js";
const saveDirectory = path.join(import.meta.dirname, "data");
const savePath = path.join(saveDirectory, "users.json");
const languageCode = process.argv[2]?.toUpperCase();
let game;
let terminalRestored = false;
async function readSaves() {
	try {
		const saves = JSON.parse(await fs.readFile(savePath, "utf8"));
		return saves && typeof saves === "object" && !Array.isArray(saves) ? saves : {}
	} catch (error) {
		if (error.code === "ENOENT") {
			return {}
		}
		throw error
	}
}
async function loadGame(username) {
	try {
		const saves = await readSaves();
		return saves[username] ? {
			code: 1,
			data: saves[username]
		} : {
			code: 0
		}
	} catch {
		return {
			code: 0
		}
	}
}
async function saveGame(username, gameData) {
	try {
		const saves = await readSaves();
		saves[username] = gameData;
		await fs.mkdir(saveDirectory, {
			recursive: true
		});
		await fs.writeFile(savePath, `${JSON.stringify(saves,null,"\t")}\n`, "utf8");
		return {
			code: 1
		}
	} catch {
		return {
			code: 0
		}
	}
}
async function hasSave(username) {
	try {
		const saves = await readSaves();
		return {
			code: saves[username] ? 1 : 2
		}
	} catch {
		return {
			code: 0
		}
	}
}

function write(text) {
	process.stdout.write(text)
}

function updateConsoleSize() {
	game?.setConsoleSize({
		cols: process.stdout.columns || 80,
		rows: process.stdout.rows || 24
	})
}

function restoreTerminal() {
	if (terminalRestored) {
		return
	}
	terminalRestored = true;
	process.stdout.off("resize", updateConsoleSize);
	process.stdin.removeAllListeners("data");
	if (process.stdin.isTTY && process.stdin.isRaw) {
		process.stdin.setRawMode(false)
	}
	process.stdin.pause();
	process.stdout.write("\x1b[m\x1b[?25h")
}
async function main() {
	if (!process.stdin.isTTY || !process.stdout.isTTY || typeof process.stdin.setRawMode !== "function") {
		throw new Error("Fishing Game CLI must be run in an interactive terminal.")
	}
	game = fishing.createGameInstance(write, loadGame, saveGame, hasSave, {
		languageCode,
		enablePassword: false
	});
	updateConsoleSize();
	process.stdout.on("resize", updateConsoleSize);
	process.stdin.setRawMode(true);
	process.stdin.setEncoding("utf8");
	process.stdin.resume();
	process.stdin.on("data", input => {
		if (input.includes("")) {
			restoreTerminal();
			process.exit(130)
		}
		game.onInput(input)
	});
	await game.launch();
	restoreTerminal()
}
process.on("exit", restoreTerminal);
process.on("SIGTERM", () => {
	restoreTerminal();
	process.exit(0)
});
main().catch(error => {
	restoreTerminal();
	console.error(`\n${error.stack||error}`);
	process.exitCode = 1
});
