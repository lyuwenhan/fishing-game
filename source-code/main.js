import createLang from "./lang.js";
import createFunctions from "./functions.js";
import createData from "./data.js";
import createIo from "./io.js";
import createNormalizeDataSaver from "./normalizeDataSaver.js";
import createCheckpoint from "./checkpoint.js";
import createShop from "./shop.js";
import createFishing from "./fishing.js";
import createParkour from "./parkour.js";
import createLottery from "./lottery.js";
import createAdventure from "./adventure.js";
import createSettings from "./settings.js";
export function createGameInstance(write, loadGame, saveGame, hasSave, {
	languageCode,
	enablePassword
}) {
	const functions = createFunctions();
	const lang = createLang(functions, languageCode);
	const data = createData(functions, enablePassword ?? true);
	const io = createIo(functions, lang, data);
	const normalizeDataSaver = createNormalizeDataSaver(functions, data);
	const checkpoint = createCheckpoint(functions, lang, data, io, normalizeDataSaver);
	const shop = createShop(functions, lang, data, io);
	const fishing = createFishing(functions, lang, data, io);
	const parkour = createParkour(functions, lang, data, io);
	const lottery = createLottery(functions, lang, data, io);
	const adventure = createAdventure(functions, lang, data, io);
	const settings = createSettings(functions, lang, data, io);
	data.gameState.setRequiredFunctions(write, loadGame, saveGame, hasSave);
	let launchCount = 0;
	async function launch() {
		launchCount++;
		if (launchCount > 1) {
			return
		}
		await io.clear();
		if (!data.gameState.settings.skipStory) {
			for (let text of lang.current.main.story) {
				await io.printa(text)
			}
		}
		if (await checkpoint.login()) {
			if (!data.gameState.settings.forceUsername || !data.gameState.settings.forceBlancPassword || !data.gameState.settings.forceInstantOutput) {
				await functions.sleep(.5)
			}
			await settings.choose()
		}
		if (!data.gameState.settings.forceUsername || !data.gameState.settings.forceBlancPassword || !data.gameState.settings.forceInstantOutput) {
			await functions.sleep(.5)
		}
		while (true) {
			await io.clear();
			await io.print(functions.listToChoice(lang.current.main.mainMenu));
			while (true) {
				let type = await io.getch();
				if (type === "1") {
					await fishing();
					break
				} else if (type === "2") {
					await shop();
					break
				} else if (type === "3") {
					await settings.setTextSpeed();
					break
				} else if (type === "4") {
					await lottery();
					break
				} else if (type === "5") {
					if (data.gameState.dataSaver.challengeLevel === 0) {
						await parkour()
					} else if (data.gameState.dataSaver.challengeLevel === 1) {
						await adventure()
					} else {
						await io.clear();
						await io.printa(lang.current.main.challengeCompleted)
					}
					break
				} else if (type === "6") {
					await io.clear();
					return
				}
			}
			await checkpoint.save();
			await functions.sleep(.5)
		}
	}
	return Object.freeze({
		setConsoleSize: size => {
			data.gameState.setConsoleSize(size)
		},
		onInput: str => {
			io.onInput(str)
		},
		languages: {
			langs: functions.deepCopy(lang.langs),
			setLanguage: code => {
				lang.setLanguage(code)
			},
			get currentLangCode() {
				return lang.langCode
			}
		},
		settings: data.gameState.settings,
		launch
	})
}
