export default function createCheckpoint(functions, lang, data, io, normalizeDataSaver) {
	async function loadGame() {
		const loadState = await (data.enablePassword ? data.gameState.requiredFunctions.loadGame(data.gameState.username, data.gameState.password) : data.gameState.requiredFunctions.loadGame(data.gameState.username));
		if (loadState?.code === 1) {
			data.gameState.dataSaver = {
				...data.createDataSaver(),
				...loadState.data
			};
			normalizeDataSaver()
		}
		return loadState
	}
	async function saveGame() {
		normalizeDataSaver();
		return data.enablePassword ? data.gameState.requiredFunctions.saveGame(data.gameState.username, data.gameState.password, data.gameState.dataSaver) : data.gameState.requiredFunctions.saveGame(data.gameState.username, data.gameState.dataSaver)
	}
	async function login() {
		while (true) {
			let username = "";
			let password = "";
			await io.clear();
			await io.print(functions.capitalize(lang.current.checkpoint.login));
			await io.printnl(functions.capitalize(lang.current.checkpoint.username) + ": ");
			if (data.gameState.settings.forceUsername) {
				username = data.gameState.settings.forceUsername;
				await io.write(username + "\n")
			} else {
				username = await io.getline(false);
				if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
					await io.print(lang.current.checkpoint.invalidUsername);
					await functions.sleep(1);
					continue
				}
			}
			const userState = await data.gameState.requiredFunctions.hasSave(username);
			if (!userState?.code) {
				await io.print(functions.capitalize(lang.current.checkpoint.apiError));
				await functions.sleep(1);
				continue
			}
			const isNew = userState.code === 2;
			if (data.enablePassword) {
				await io.printnl(functions.capitalize(lang.current.checkpoint.password) + ": ");
				if (data.gameState.settings.forceBlancPassword) {
					await io.write("\n")
				} else {
					password = await io.getline(true);
					if (isNew) {
						await io.printnl(functions.capitalize(lang.current.checkpoint.confirmPassword) + ": ");
						let newPassword = await io.getline(true);
						if (newPassword !== password) {
							await io.print(lang.current.checkpoint.passwordNotMatch);
							await functions.sleep(1);
							continue
						}
					}
				}
			}
			data.gameState.username = username;
			data.gameState.password = password;
			if (!isNew) {
				const loadState = await loadGame();
				if (loadState?.code !== 1) {
					await io.print(lang.current.checkpoint.apiError);
					await functions.sleep(1);
					continue
				}
			}
			const saveState = await saveGame();
			if (!saveState?.code) {
				await io.print(lang.current.checkpoint.apiError);
				await functions.sleep(1);
				continue
			}
			if (data.enablePassword && saveState.code === 2) {
				await io.print(lang.current.checkpoint.passwordError);
				await functions.sleep(1);
				continue
			}
			await io.clear();
			return isNew
		}
	}
	async function load() {
		const loadState = await loadGame();
		if (loadState?.code !== 1) {
			await io.printa(lang.current.checkpoint.apiError)
		}
	}
	async function save() {
		const saveState = await saveGame();
		if (!saveState?.code) {
			await io.printa(lang.current.checkpoint.apiError)
		} else if (data.enablePassword && saveState.code === 2) {
			await io.printa(lang.current.checkpoint.passwordError)
		}
	}
	return Object.freeze({
		login,
		load,
		save
	})
}
