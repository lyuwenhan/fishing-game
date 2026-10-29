const {
	contextBridge,
	ipcRenderer
} = require("electron");
contextBridge.exposeInMainWorld("electronLanguage", {
	setLanguages(languages, currentLanguage) {
		ipcRenderer.send("language:list", {
			languages,
			currentLanguage
		})
	}
});
