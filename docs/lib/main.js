const fontSize = window.innerWidth < 768 ? 12 : 18;
const term = new Terminal({
	fontSize,
	cursorBlink: true,
	fontFamily: "Consolas, Courier, monospace",
	theme: {
		background: "#4E0E3B",
		foreground: "#FFFFFF",
		cursor: "#EEEEEC",
		selection: "#FFFFFF",
		black: "#2E3436",
		red: "#CC0000",
		green: "#4E9A06",
		yellow: "#C4A000",
		blue: "#3465A4",
		magenta: "#75507B",
		cyan: "#06989A",
		white: "#D3D7CF",
		brightBlack: "#555753",
		brightRed: "#EF2929",
		brightGreen: "#8AE234",
		brightYellow: "#FCE94F",
		brightBlue: "#729FCF",
		brightMagenta: "#AD7FA8",
		brightCyan: "#34E2E2",
		brightWhite: "#EEEEEC"
	}
});
const terminal = document.getElementById("terminal");
term.open(terminal);
term.focus();
document.getElementById("full").addEventListener("click", () => {
	if (document.fullscreenElement) {
		document.exitFullscreen()
	} else {
		terminal.requestFullscreen()
	}
});
window.addEventListener("keydown", e => {
	if (e.repeat) {
		return
	}
	if (e.code === "F11" || (e.ctrlKey && e.code === "KeyR" || e.code === "F5") || e.ctrlKey && e.code === "KeyC" || e.ctrlKey && e.code === "KeyV") {
		e.stopPropagation()
	}
}, true);
window.addEventListener("keyup", e => {
	if (e.code === "F11" || (e.ctrlKey && e.code === "KeyR" || e.code === "F5") || e.ctrlKey && e.code === "KeyC" || e.ctrlKey && e.code === "KeyV") {
		e.stopPropagation()
	}
}, true);

function tryFocusTerminal (e) {
	const ignored = ["INPUT", "TEXTAREA", "SELECT", "BUTTON"];
	if (ignored.includes(e.target.tagName)) {
		return
	}
	if (document.activeElement !== term.textarea) {
		setTimeout(() => term.focus(), 0)
	}
}
document.addEventListener("click", tryFocusTerminal, true);
term.textarea.addEventListener("blur", () => {
	if (document.activeElement !== term.textarea) {
		term.focus()
	}
}, true);
terminal.addEventListener("contextmenu", e => {
	e.preventDefault()
}, true);
import("./fishing/ready.js").then(fishing => {
	fishing.IOs.onData = e => {
		term.write(e)
	};
	term.onData(data => {
		for (const c of data) {
			fishing.IOs.send(c)
		}
	});
	term.onResize(({cols, rows}) => {
		fishing.resize(cols, rows);
	});
	const fitAddon = new window.FitAddon.FitAddon;
	term.loadAddon(fitAddon);
	fitAddon.fit();
	window.addEventListener("resize", () => {
		fitAddon.fit()
	});
	const start = async ()=>{
		while(true){
			try{
				await fishing.setup();
			}catch(e){
				console.log(e);
				break;
			}
		}
	}
	start();
}).catch(e => {
	term.write(`\r\n\r\n[m${e}\r\n`);
	throw e
});
