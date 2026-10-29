import {
	app,
	BrowserWindow,
	ipcMain,
	Menu
} from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import electronUpdater from "electron-updater";
import {
	fileURLToPath
} from "node:url";
const {
	autoUpdater
} = electronUpdater;
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

function autoUpdatesSupported() {
	if (!app.isPackaged) {
		return false
	}
	if (process.platform === "win32") {
		return !process.env.PORTABLE_EXECUTABLE_DIR
	}
	if (process.platform === "linux") {
		return Boolean(process.env.APPIMAGE)
	}
	return process.platform === "darwin"
}

function checkForAvailableUpdate() {
	return new Promise((resolve, reject) => {
		let settled = false;
		const timeout = setTimeout(() => finish(false), 15e3);
		const onAvailable = () => finish(true);
		const onNotAvailable = () => finish(false);
		const onError = error => finish(false, error);

		function finish(available, error) {
			if (settled) {
				return
			}
			settled = true;
			clearTimeout(timeout);
			autoUpdater.off("update-available", onAvailable);
			autoUpdater.off("update-not-available", onNotAvailable);
			autoUpdater.off("error", onError);
			if (error) {
				reject(error)
			} else {
				resolve(available)
			}
		}
		autoUpdater.on("update-available", onAvailable);
		autoUpdater.on("update-not-available", onNotAvailable);
		autoUpdater.on("error", onError);
		autoUpdater.checkForUpdates().catch(onError)
	})
}
async function installUpdateOnStartup() {
	if (!autoUpdatesSupported()) {
		return false
	}
	autoUpdater.autoDownload = false;
	autoUpdater.autoInstallOnAppQuit = false;
	autoUpdater.on("error", error => {
		console.error("Automatic updater error:", error)
	});
	try {
		if (!await checkForAvailableUpdate()) {
			return false
		}
		try {
			await autoUpdater.downloadUpdate();
			autoUpdater.quitAndInstall(true, true)
		} catch (error) {
			console.error("Automatic update download failed:", error);
			app.quit()
		}
		return true
	} catch (error) {
		console.error("Automatic update check failed:", error);
		return false
	}
}

function createWindow() {
	const win = new BrowserWindow({
		title: `${APP_NAME} v${app.getVersion()}`,
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
	if (await installUpdateOnStartup()) {
		return
	}
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
