import {
	app,
	BrowserWindow,
	ipcMain,
	Menu
} from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import {
	fileURLToPath
} from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_NAME = "Fishing Game";
const LANGUAGE_SETTINGS_FILE = "language.json";
app.setName(APP_NAME);
let savedLanguage = "";
let availableLanguages = [];
let developmentMenu = null;
async function readSavedLanguage() {
	try {
		const settings = JSON.parse(await fs.readFile(path.join(app.getPath("userData"), LANGUAGE_SETTINGS_FILE), "utf8"));
		return typeof settings.language === "string" ? settings.language : ""
	} catch {
		return ""
	}
}
async function writeSavedLanguage(language) {
	const settingsPath = path.join(app.getPath("userData"), LANGUAGE_SETTINGS_FILE);
	await fs.mkdir(path.dirname(settingsPath), {
		recursive: true
	});
	await fs.writeFile(settingsPath, `${JSON.stringify({language},null,"\t")}\n`, "utf8")
}

function loadGamePage(win, language = "") {
	const options = language ? {
		query: {
			lang: language
		}
	} : undefined;
	return win.loadFile(path.join(__dirname, "index.html"), options)
}
async function selectLanguage(language) {
	if (!availableLanguages.some(item => item.code === language)) {
		return
	}
	savedLanguage = language;
	await writeSavedLanguage(language);
	await Promise.all(BrowserWindow.getAllWindows().map(win => loadGamePage(win, language)))
}

function setLanguageMenu(languages = availableLanguages, currentLanguage = savedLanguage) {
	availableLanguages = languages;
	const submenu = languages.map(language => ({
		label: language.name,
		type: "radio",
		checked: language.code === currentLanguage,
		click: () => {
			selectLanguage(language.code).catch(error => console.error("Failed to change language:", error))
		}
	}));
	const languageMenu = Menu.buildFromTemplate([{
		id: "language-menu",
		label: "Language",
		submenu
	}]).items[0];
	if (!app.isPackaged && developmentMenu) {
		Menu.setApplicationMenu(Menu.buildFromTemplate([...developmentMenu.items, languageMenu]))
	} else {
		const menu = new Menu;
		menu.append(languageMenu);
		Menu.setApplicationMenu(menu)
	}
}

function isDevToolsShortcut(input) {
	const key = String(input.key || "").toLowerCase();
	return key === "f12" || input.control && input.shift && key === "i" || input.meta && input.alt && key === "i"
}

function createWindow() {
	const win = new BrowserWindow({
		title: APP_NAME,
		width: 1200,
		height: 800,
		icon: path.join(__dirname, "icons", process.platform === "darwin" ? "icon.icns" : "icon.ico"),
		autoHideMenuBar: false,
		webPreferences: {
			preload: path.join(__dirname, "preload.cjs"),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true,
			devTools: !app.isPackaged
		}
	});
	if (app.isPackaged) {
		win.webContents.setZoomFactor(1);
		win.webContents.setVisualZoomLevelLimits(1, 1);
		win.webContents.on("will-navigate", event => {
			event.preventDefault()
		})
	} else {
		win.webContents.on("before-input-event", (event, input) => {
			if (input.type === "keyDown" && isDevToolsShortcut(input)) {
				event.preventDefault();
				win.webContents.toggleDevTools()
			}
		})
	}
	win.on("page-title-updated", event => {
		event.preventDefault()
	});
	win.setMenuBarVisibility(true);
	loadGamePage(win, savedLanguage)
}
app.whenReady().then(async () => {
	savedLanguage = await readSavedLanguage();
	if (!app.isPackaged) {
		developmentMenu = Menu.getApplicationMenu()
	}
	setLanguageMenu();
	ipcMain.on("language:list", (event, payload) => {
		const senderWindow = BrowserWindow.fromWebContents(event.sender);
		if (!senderWindow || !Array.isArray(payload?.languages)) {
			return
		}
		const languages = payload.languages.filter(language => language && typeof language.code === "string" && language.code && typeof language.name === "string" && language.name).map(language => ({
			code: language.code,
			name: language.name
		}));
		const currentLanguage = typeof payload.currentLanguage === "string" ? payload.currentLanguage : "";
		setLanguageMenu(languages, currentLanguage)
	});
	createWindow();
	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow()
		}
	})
});
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit()
	}
});
