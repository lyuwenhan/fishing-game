import {
	app,
	BrowserWindow,
	Menu
} from "electron";
import path from "node:path";
import {
	fileURLToPath
} from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_NAME = "Fishing Game";
app.setName(APP_NAME);

function createWindow() {
	const win = new BrowserWindow({
		title: `${APP_NAME} v${app.getVersion()}`,
		width: 1200,
		height: 800,
		icon: path.join(__dirname, "icons", process.platform === "darwin" ? "icon.icns" : "icon.ico"),
		autoHideMenuBar: app.isPackaged,
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true,
			devTools: !app.isPackaged
		}
	});
	if (app.isPackaged) {
		win.setMenuBarVisibility(false);
		win.webContents.setZoomFactor(1);
		win.webContents.setVisualZoomLevelLimits(1, 1);
		win.webContents.on("will-navigate", event => {
			event.preventDefault()
		})
	}
	win.on("page-title-updated", event => {
		event.preventDefault()
	});
	win.loadFile(path.join(__dirname, "index.html"))
}
app.whenReady().then(() => {
	if (app.isPackaged) {
		Menu.setApplicationMenu(null)
	}
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
