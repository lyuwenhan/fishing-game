import {
	app,
	BrowserWindow
} from "electron";
import path from "node:path";
import {
	fileURLToPath
} from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_NAME = "Fishing Game";
const INDEX_PATH = path.join(__dirname, "index.html");
app.setName(APP_NAME);

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
		webPreferences: {
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
	win.loadFile(INDEX_PATH)
}
app.whenReady().then(() => {
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
