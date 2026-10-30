const {
	contextBridge,
	ipcRenderer
} = require("electron");
contextBridge.exposeInMainWorld("setLanguages", (languages, currentLanguage) => {
	ipcRenderer.send("language:list", {
		languages,
		currentLanguage
	})
});
