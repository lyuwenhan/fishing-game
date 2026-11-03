export default function createSettings(functions, lang, data, io) {
	async function choose() {
		await io.clear();
		await io.print(lang.current.settings.chooseSpeed);
		await io.print(functions.listToChoice(lang.current.settings.speedName));
		let c;
		do {
			c = await io.getch()
		} while (!/[1-3]/.test(c));
		data.gameState.dataSaver.textSpeed = Number(c) - 1;
		await io.clear();
		for (const text of lang.current.settings.skills) {
			await io.print(text)
		}
		while (true) {
			const c = await io.getch();
			if (c === "1") {
				data.gameState.dataSaver.catchSpeedLevel = 5;
				break
			} else if (c === "2") {
				data.gameState.dataSaver.incomeLevel = 5;
				break
			} else if (c === "3") {
				data.gameState.dataSaver.slipOffChance = 10;
				break
			} else if (c === "4") {
				data.gameState.dataSaver.actionSpeedMultiplier = 2;
				break
			} else if (c === "5") {
				data.gameState.dataSaver.bigFishChance = 40;
				break
			} else if (c === "6") {
				break
			}
		}
	}
	async function setTextSpeed() {
		await io.clear();
		await io.print(lang.current.settings.chooseSpeed);
		await io.print(functions.listToChoice(lang.current.settings.speedName, lang.current.exit));
		let c;
		do {
			c = Number(await io.getch())
		} while (!functions.isNumberBetween(c, 1, 4));
		if (c <= 3) {
			data.gameState.dataSaver.textSpeed = c - 1
		}
	}
	return Object.freeze({
		choose,
		setTextSpeed
	})
}
