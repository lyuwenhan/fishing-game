export default function createIo(functions, lang, data) {
	const inputBuffer = [];
	const waitingResolvers = [];

	function write(text) {
		return data.gameState.requiredFunctions.write(String(text || "").replace(/\n/g, "\r\n"))
	}
	async function clear() {
		await write("\x1bc")
	}

	function onInput(str) {
		if (typeof str !== "string") {
			str = String(str)
		}
		for (const ch of str.replace(/\r\n/g, "\r").replace(/\n/g, "\r").replace(/\x08/g, "")) {
			if (waitingResolvers.length > 0) {
				const resolve = waitingResolvers.shift();
				resolve(ch)
			} else {
				inputBuffer.push(ch)
			}
		}
	}
	async function getch() {
		if (inputBuffer.length > 0) {
			return inputBuffer.shift()
		}
		return new Promise(resolve => {
			waitingResolvers.push(resolve)
		})
	}

	function getch2() {
		if (inputBuffer.length > 0) {
			return inputBuffer.shift()
		}
		return ""
	}

	function getch2s() {
		if (inputBuffer.length === 0) {
			return ""
		}
		return inputBuffer.splice(0).join("")
	}
	async function getline(hideText = 0) {
		let ans = "";
		while (true) {
			const a = await getch();
			if (a === "\r") {
				if (ans) {
					break
				} else {
					continue
				}
			}
			if (a === "") {
				if (ans.length > 0) {
					ans = ans.slice(0, -1);
					await write("\b \b")
				}
				continue
			}
			if (!/[!-~]/.test(a)) {
				continue
			}
			ans += a;
			if (hideText) {
				await write("*")
			} else {
				await write(a)
			}
		}
		await write("\n");
		return ans
	}
	async function printnl(text, time = .02) {
		await write("\x1b[?25l");
		try {
			if (!functions.isNumberBetween(data.gameState.dataSaver.textSpeed, 0, 1) || time <= 0) {
				await write(text)
			} else {
				for (const char of String(text || "")) {
					await write(char);
					await functions.sleep(time / (data.gameState.dataSaver.textSpeed + 1) / lang.current.io.outputSpeed)
				}
			}
		} finally {
			await write("\x1b[m\x1b[?25h")
		}
	}
	async function print(text, time = .02) {
		await printnl(text, time);
		await write("\n")
	}
	async function printa(text = "", time = .02) {
		await print(text + (text ? "    " : "") + "(" + functions.capitalize(lang.current.io.pressEnterToContinue) + ")", time);
		while (await getch() !== "\r");
	}
	async function printYn(text = "", time = .02) {
		const toYN = {
			Y: "y",
			N: "n",
			y: "y",
			n: "n",
			"\r": "y"
		};
		await print(text + (text ? " " : "") + "(Y/n)", time);
		let input;
		do {
			input = await getch()
		} while (!toYN[input]);
		return toYN[input] === "y"
	}
	return Object.freeze({
		write,
		clear,
		onInput,
		getch,
		getch2,
		getch2s,
		getline,
		printnl,
		print,
		printa,
		printYn
	})
}
