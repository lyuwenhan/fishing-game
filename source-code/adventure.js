export default function createAdventure(functions, lang, data, io) {
	let now = 0;
	let america = 0;
	let sleepcnt = 0;
	let eatcnt = 0;
	let e2 = 0;
	let s2 = 0;
	let temple = 0;
	let romar = 0;
	let headbone = 0;
	let drafood = 0;

	function reset() {
		america = sleepcnt = eatcnt = e2 = s2 = temple = romar = headbone = drafood = 0;
		now = 0
	}
	async function runTurn(things) {
		const scene = things[now];
		const {
			title,
			lines,
			choose,
			cnext,
			next: nextIds
		} = scene;
		if (title) {
			await io.print(title)
		}
		for (const line of lines) {
			await io.print(line);
			await functions.sleep(.1)
		}
		await io.write("\n");
		if (now === 21) {
			if (!romar) {
				await io.printa(lang.current.adventure.achievementAllRoadsToRome);
				data.gameState.dataSaver.money += 100
			}
			if (romar === 5) {
				await io.printa(lang.current.adventure.achievementWrongWay);
				data.gameState.dataSaver.money += 100
			}
			romar++
		}
		if (now === 22) {
			if (!america) {
				await io.printa(lang.current.adventure.achievementVoyage);
				data.gameState.dataSaver.money += 100
			}
			if (america === 5) {
				await io.printa(lang.current.adventure.achievementWrongWay);
				data.gameState.dataSaver.money += 100
			}
			america++
		}
		if (now === 24) {
			if (!headbone) {
				await io.printa(lang.current.adventure.achievementSurprise);
				data.gameState.dataSaver.money += 100
			}
			if (headbone === 5) {
				await io.printa(lang.current.adventure.achievementArchaeologist);
				data.gameState.dataSaver.money += 100
			}
			headbone++
		}
		let menu = "";
		for (let i = 0; i < choose.length; i++) {
			menu += i + 1 + "." + choose[i];
			if (i < choose.length - 1) {
				menu += ", "
			}
		}
		await io.print(menu);
		let idx;
		do {
			idx = Number(await io.getch()) - 1
		} while (!Number.isInteger(idx) || idx < 0 || idx >= choose.length);
		if (cnext[idx]) {
			await io.clear();
			await io.printa(cnext[idx])
		}
		now = nextIds[idx];
		if (now === 13) {
			if (!temple) {
				await io.printa(lang.current.adventure.achievementBuddhism);
				data.gameState.dataSaver.money += 100
			} else if (temple === 5) {
				await io.printa(lang.current.adventure.achievementAscend);
				data.gameState.dataSaver.money += 100
			}
			temple++
		}
		if (now === 30) {
			if (eatcnt >= 30 && !drafood) {
				await io.printa(lang.current.adventure.achievementDragonMeal);
				data.gameState.dataSaver.money += 100
			}
			drafood++
		}
		if (now === -3) {
			if (eatcnt >= 30 && e2 === 0) {
				await io.printa(lang.current.adventure.achievementOriginalAspiration);
				data.gameState.dataSaver.money += 100
			} else if (eatcnt >= 30 && e2 === 5) {
				await io.printa(lang.current.adventure.achievementMission);
				data.gameState.dataSaver.money += 200
			}
			e2++;
			now = 1
		}
		if (now === -4) {
			if (sleepcnt >= 30 && s2 === 0) {
				await io.printa(lang.current.adventure.achievementSoftBed);
				data.gameState.dataSaver.money += 100
			} else if (sleepcnt >= 30 && s2 === 5) {
				await io.printa(lang.current.adventure.achievementSleepComfort);
				data.gameState.dataSaver.money += 200
			}
			s2++;
			now = 1
		}
		if (now === -1) {
			eatcnt++;
			if (eatcnt === 5) {
				await io.printa(lang.current.adventure.achievementNeedFood);
				data.gameState.dataSaver.money += 100
			} else if (eatcnt === 10) {
				await io.printa(lang.current.adventure.achievementHungryGhost);
				data.gameState.dataSaver.money += 100
			} else if (eatcnt === 30) {
				await io.printa(lang.current.adventure.achievementVirtuousHui);
				data.gameState.dataSaver.money += 100
			}
			now = 1
		}
		if (now === -2) {
			sleepcnt++;
			if (sleepcnt === 5) {
				await io.printa(lang.current.adventure.achievementReadyAfterSleep);
				data.gameState.dataSaver.money += 100
			} else if (sleepcnt === 10) {
				await io.printa(lang.current.adventure.achievementBedComfort);
				data.gameState.dataSaver.money += 100
			} else if (sleepcnt === 30) {
				await io.printa(lang.current.adventure.achievementSleepGod);
				data.gameState.dataSaver.money += 100
			}
			now = 1
		}
		await functions.sleep(.5)
	}
	async function run() {
		if (data.gameState.dataSaver.challengeLevel !== 1) {
			return
		}
		reset();
		const things = lang.current.adventure.story;
		while (true) {
			if (now === -5) {
				await io.printa(lang.current.adventure.missionComplete);
				data.gameState.dataSaver.money += 100;
				data.gameState.dataSaver.challengeLevel = 2;
				return
			}
			await io.clear();
			await runTurn(things)
		}
	}
	return run
}
