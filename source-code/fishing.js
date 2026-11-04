export default function createFishing(functions, lang, data, io) {
	const paintTemplate = Object.freeze(["                                            ", "                                            ", "                                            ", "                                            ", "                                            ", "                                            ", "                                            ", "                                            ", "                         o                  ", "                        /|\\--------         ", "                        /_\\___              ", "~~~~~~~~~~~~~~~~~~~~~~~|      |~~~~~~~~~~~~|", "                              |            |", "                              |            |", "                              |____________|"]);
	const precipitationSymbol = Object.freeze([".", "*", " ", " ", " ", " "]);
	const precipitationColor = Object.freeze(["\x1b[1;34m", "\x1b[1;36m", "", "", "", ""]);
	const weatherPaintTemplate = functions.deepFreeze([
		["     \x1b[33;1m_____\x1b[m                                  ", "    \x1b[33;1m|     |\x1b[m                                 ", "    \x1b[33;1m|     |\x1b[m                                 ", "    \x1b[33;1m|_____|\x1b[m                                 "],
		["         _______      ___________           ", "     ___/       \\____/           \\___       ", "    (                                )      ", "     \\______________________________/       "],
		["         \x1b[33;1m_____\x1b[m       ___________            ", "     ___\x1b[33;1m|_____|\x1b[m_____/           \\____       ", "    (                                )      ", "     \\______________________________/       "]
	]);
	let lastDrawTime = 0;
	let timeUsedInGame = 0;
	let currentWeather = [2, 0];
	let lastPrecipitation = 0;
	let precipitationPoints = [];
	let paint = Array.from({
		length: 15
	}, () => Array(44).fill(" "));
	let color = Array.from({
		length: 15
	}, () => Array(44).fill(""));
	let paintLastTick = "";
	let fishInPond = Array.from({
		length: 7
	}, () => []);
	let fishColor = Object.freeze(["\x1b[1;31m", "\x1b[1;37m", "\x1b[1;35m", "\x1b[1;34m", "\x1b[1;33m", "\x1b[1;32m", "\x1b[1;36m"]);
	let currentWaitingStatus = 0;
	let consoleSizeLastTick = "";

	function changeWeather(weather) {
		if (weather[0] < 0 || weather[0] > 5) {
			return [3, 0]
		}
		if (weather[1] < 0 || weather[1] > (weather[0] < 2 ? 3 : 0)) {
			return [weather[0], 0]
		}
		if (weather[0] === 0 || weather[0] === 1) {
			if (weather[1] < 2) {
				const weatherRoll = functions.random(1, 20);
				if (weatherRoll <= 9) {
					return [weather[0], weather[1]]
				} else if (weatherRoll <= 15) {
					return [weather[0], functions.random(1, 3)]
				} else if (weatherRoll <= 18) {
					return [functions.random(0, 1), weather[1]]
				} else {
					return [functions.random(2, 4), 0]
				}
			} else {
				const weatherRoll = functions.random(1, 2);
				if (weatherRoll <= 1) {
					return [weather[0], functions.random(1, 3)]
				} else {
					return [weather[0], weather[1]]
				}
			}
		} else if (weather[0] >= 2 && weather[0] <= 4) {
			const weatherRoll = functions.random(1, 10);
			if (weatherRoll <= 1) {
				return [5, weather[1]]
			} else if (weatherRoll <= 3) {
				return [functions.random(0, 1), functions.random(1, 2)]
			} else if (weatherRoll <= 6) {
				return [functions.random(2, 4), weather[1]]
			} else {
				return [weather[0], weather[1]]
			}
		} else {
			const weatherRoll = functions.random(1, 10);
			if (weatherRoll <= 3) {
				return [functions.random(2, 4), weather[1]]
			} else {
				return [weather[0], weather[1]]
			}
		}
	}

	function getRandomCatchTime() {
		return functions.random(data.constant.minCatchSpeed[data.gameState.dataSaver.catchSpeedLevel], data.constant.maxCatchSpeed[data.gameState.dataSaver.catchSpeedLevel])
	}

	function getRandomIncome(multiplier = 1) {
		return functions.random(multiplier * data.constant.minIncome[data.gameState.dataSaver.incomeLevel], multiplier * data.constant.maxIncome[data.gameState.dataSaver.incomeLevel])
	}

	function getFishType() {
		let fishTypeRoll = functions.random(1, 1e4);
		for (let i = 0; i <= 6; i++) {
			fishTypeRoll -= data.constant.fishOddsByRodLevel[data.gameState.dataSaver.rodLevel][i];
			if (fishTypeRoll <= 0) {
				return i
			}
		}
		return 0
	}
	async function getFish(isBigFish, fishType) {
		await io.clear();
		if (data.gameState.dataSaver.hunger <= 2) {
			await io.printa(lang.current.fishing.youCaughtA + fishColor[fishType] + lang.current.fishing.fishName[fishType] + (isBigFish ? lang.current.fishing.big : "") + lang.current.fishing.fish + "\x1b[m, " + lang.current.fishing.eaten);
			data.gameState.dataSaver.hunger += fishType + 3;
			return
		}
		const price = getRandomIncome((isBigFish ? 2 : 1) * data.constant.fishValueMultipliers[fishType]);
		if (fishType === 4 && isBigFish) {
			await io.printa(lang.current.fishing.youCaughtA + fishColor[fishType] + lang.current.fishing.eggFish + "\x1b[m, " + lang.current.fishing.worth + "$" + price)
		} else {
			await io.printa(lang.current.fishing.youCaughtA + fishColor[fishType] + lang.current.fishing.fishName[fishType] + (isBigFish ? lang.current.fishing.big : "") + lang.current.fishing.fish + "\x1b[m, " + lang.current.fishing.worth + "$" + price)
		}
		fishInPond[fishType].push(10);
		data.gameState.dataSaver.totalFishCaught++
	}
	let lastWaitingMinTime = 0;
	let lastWaitingMaxTime = 0;
	let lastWaitingStatus = 0;
	async function draw(minWaitingTime = 0, maxWaitingTime = 0) {
		const changeCompactMode = (await io.getch2s()).includes("e");
		if (changeCompactMode) {
			data.gameState.dataSaver.compactMode = !data.gameState.dataSaver.compactMode
		}
		let needClear = changeCompactMode;
		let precipitationPointsChanged = false;
		const now = Math.floor(Date.now() / 1e3);
		while (now - lastDrawTime > 10) {
			const newWeather = changeWeather(currentWeather);
			if (newWeather[0] !== currentWeather[0] || newWeather[1] !== currentWeather[1]) {
				needClear = true
			}
			currentWeather = newWeather;
			if (currentWeather[0] <= 1) {
				lastPrecipitation = currentWeather[0]
			}
			if (now - lastDrawTime > 100) {
				lastDrawTime = now - 100
			}
			lastDrawTime += 10
		}
		if (lastWaitingMinTime !== minWaitingTime || lastWaitingMaxTime !== maxWaitingTime) {
			lastWaitingMinTime = minWaitingTime;
			lastWaitingMaxTime = maxWaitingTime;
			needClear = true
		}
		if (lastWaitingStatus !== currentWaitingStatus) {
			lastWaitingStatus = currentWaitingStatus;
			needClear = true
		}
		const stringConsoleSize = data.gameState.consoleSize.rows + " " + data.gameState.consoleSize.cols;
		if (consoleSizeLastTick !== stringConsoleSize) {
			consoleSizeLastTick = stringConsoleSize;
			needClear = true
		}
		while (timeUsedInGame >= .2) {
			timeUsedInGame -= .2;
			for (let i = precipitationPoints.length - 1; i >= 0; i--) {
				precipitationPoints[i][0] += 1;
				precipitationPointsChanged = true;
				if (precipitationPoints[i][0] > 10) {
					[precipitationPoints[i], precipitationPoints[precipitationPoints.length - 1]] = [precipitationPoints[precipitationPoints.length - 1], precipitationPoints[i]];
					precipitationPoints.pop()
				}
			}
			if (data.constant.precipitationDensityByIntensity[currentWeather[1]]) {
				precipitationPointsChanged = true;
				precipitationPoints.push([0, functions.random(0, 43)])
			}
			for (let i = 1; i <= data.constant.precipitationDensityByIntensity[currentWeather[1]] / 6 - 1 && precipitationPoints.length < data.constant.precipitationDensityByIntensity[currentWeather[1]]; i++) {
				if (precipitationPoints.length < data.constant.precipitationDensityByIntensity[currentWeather[1]] && functions.random(1, 2) <= 1) {
					precipitationPointsChanged = true;
					precipitationPoints.push([0, functions.random(0, 43)])
				}
			}
		}
		let start = 0;
		const requiredRows = 21,
			requiredCols = 44;
		const notEnoughRows = data.gameState.consoleSize.rows < requiredRows,
			notEnoughCols = data.gameState.consoleSize.cols < requiredCols;
		const stringPaint = paint.map(row => row.join("")).join("\n");
		if (paintLastTick !== stringPaint) {
			precipitationPointsChanged = true;
			paintLastTick = stringPaint
		}
		if (data.gameState.dataSaver.compactMode || notEnoughRows || notEnoughCols) {
			if (needClear) {
				await io.write("\x1bc\x1b[?25l")
			} else if (data.gameState.dataSaver.compactMode) {
				await io.write("\x1b[H")
			} else {
				return
			}
			if (!data.gameState.dataSaver.compactMode) {
				if (notEnoughRows) {
					await io.write(lang.current.fishing.notEnoughRows + " " + requiredRows + " " + lang.current.fishing.rows + "\n");
					await io.write(lang.current.fishing.currentSize + ": " + data.gameState.consoleSize.rows + " " + lang.current.fishing.rows + "\n")
				}
				if (notEnoughCols) {
					await io.write(lang.current.fishing.notEnoughCols + " " + requiredCols + " " + lang.current.fishing.cols + "\n");
					await io.write(lang.current.fishing.currentSize + ": " + data.gameState.consoleSize.cols + " " + lang.current.fishing.cols + "\n")
				}
			}
		} else {
			if (needClear) {
				await io.write("\x1bc\x1b[?25l")
			} else if (precipitationPointsChanged) {
				await io.write("\x1b[H")
			} else {
				return
			}
			if (currentWeather[0] >= 2 && currentWeather[0] <= 4) {
				start = 4;
				for (let i = 0; i < 4; i++) {
					await io.write(weatherPaintTemplate[currentWeather[0] - 2][i] + "\n")
				}
			}
			for (let i = start; i < 15; i++) {
				for (let j = 0; j < 44; j++) {
					let b = false;
					for (const p of precipitationPoints) {
						if (p[0] === i && p[1] === j) {
							b = true;
							break
						}
					}
					if (paint[i][j] === " " && b) {
						await io.write("\x1b[m" + precipitationColor[lastPrecipitation] + precipitationSymbol[lastPrecipitation])
					} else {
						await io.write("\x1b[m" + color[i][j] + paint[i][j])
					}
				}
				await io.write("\n")
			}
		}
		await io.write(lang.current.fishing.currentStatus + ": " + lang.current.fishing.waitingStatus[currentWaitingStatus] + "\n");
		await io.write(lang.current.fishing.totalFishCaught + ": " + data.gameState.dataSaver.totalFishCaught + "\n");
		await io.write(lang.current.fishing.currentWeather + ": " + lang.current.fishing.rainSize[currentWeather[1]] + lang.current.fishing.weatherNames[currentWeather[0]] + "\n");
		if (maxWaitingTime) {
			if (minWaitingTime) {
				await io.write(lang.current.fishing.remainingTime + ": " + minWaitingTime / 2 + " min ~ " + maxWaitingTime / 2 + " min\n")
			} else {
				await io.write(lang.current.fishing.remainingTime + ": < " + maxWaitingTime / 2 + " min\n")
			}
		}
		await io.write((data.gameState.dataSaver.compactMode ? lang.current.fishing.exitCompactMode : lang.current.fishing.enterCompactMode) + "\n")
	}
	async function slep(time) {
		time = Math.round(time * 100) / 100;
		if (time < .01) {
			time = .01
		}
		while (time > .1) {
			await functions.sleep(.1);
			await draw();
			time -= .1;
			timeUsedInGame += .1
		}
		await functions.sleep(time);
		await draw();
		timeUsedInGame += time
	}
	async function wait(time) {
		time = Math.round(time * 100) / 100;
		let minWaitingTime = data.constant.minCatchSpeed[data.gameState.dataSaver.catchSpeedLevel] * 10,
			maxWaitingTime = data.constant.maxCatchSpeed[data.gameState.dataSaver.catchSpeedLevel] * 10;
		if (time && time < .01) {
			time = .01
		}
		while (time > .1) {
			await functions.sleep(.1);
			if (minWaitingTime > 10) {
				minWaitingTime -= 1
			}
			if (maxWaitingTime > 10) {
				maxWaitingTime -= 1
			}
			time -= .1;
			timeUsedInGame += .1;
			await draw(Math.floor((minWaitingTime - 10) / 300), Math.ceil(Math.max((maxWaitingTime + 290) / 300, 1)))
		}
		if (time) {
			await functions.sleep(time);
			await draw(Math.floor((minWaitingTime - 10) / 300), Math.ceil(Math.max((maxWaitingTime + 290) / 300, 1)))
		}
		timeUsedInGame += time
	}
	async function fishingStep2(isBigFish, fishType) {
		const speedMultiplierByHunger = data.gameState.dataSaver.hunger < 5 ? 3 : data.gameState.dataSaver.hunger < 10 ? 2 : data.gameState.dataSaver.hunger < 30 ? 1 : data.gameState.dataSaver.hunger < 35 ? .8 : .5;
		const bigFishMultiplier = isBigFish ? 2 : 1;
		await io.write("\x1b[?25l");
		color[11][18] = "\x1b[1;34m";
		paint[11][18] = "~";
		color[10][19] = fishColor[fishType];
		paint[11][19] = "^";
		paint[10][19] = "O";
		await slep(.5 * speedMultiplierByHunger * bigFishMultiplier / data.gameState.dataSaver.actionSpeedMultiplier);
		color[11][19] = "\x1b[1;34m";
		paint[11][19] = "~";
		color[9][19] = fishColor[fishType];
		paint[10][19] = "^";
		paint[9][19] = "O";
		await slep(.5 * speedMultiplierByHunger * bigFishMultiplier / data.gameState.dataSaver.actionSpeedMultiplier);
		for (let i = 8; i >= 5; i--) {
			color[i + 2][19] = "";
			paint[i + 2][19] = " ";
			color[i][19] = fishColor[fishType];
			paint[i + 1][19] = "^";
			paint[i][19] = "O";
			await slep(.5 * speedMultiplierByHunger * bigFishMultiplier / data.gameState.dataSaver.actionSpeedMultiplier)
		}
		paint[9][24] = paint[8][24] = paint[7][24] = paint[6][24] = "|";
		paint[8][23] = paint[7][22] = paint[6][21] = paint[5][20] = paint[5][19] = paint[6][19] = " ";
		color[5][19] = color[6][19] = "";
		paint[5][23] = ">";
		paint[5][24] = "O";
		color[5][23] = color[5][24] = fishColor[fishType];
		await slep(.5 * speedMultiplierByHunger * bigFishMultiplier / data.gameState.dataSaver.actionSpeedMultiplier);
		paint[9][26] = "V";
		paint[8][24] = paint[7][24] = paint[6][24] = paint[5][23] = paint[5][24] = " ";
		color[5][23] = color[5][24] = "";
		paint[9][26] = paint[8][26] = paint[7][26] = paint[6][26] = "|";
		paint[9][24] = "/";
		paint[5][25] = ">";
		paint[5][26] = "O";
		color[5][25] = color[5][26] = fishColor[fishType];
		await slep(.5 * speedMultiplierByHunger * bigFishMultiplier / data.gameState.dataSaver.actionSpeedMultiplier);
		paint[9][26] = paint[8][27] = paint[7][28] = paint[6][29] = "/";
		color[5][25] = color[5][26] = "";
		paint[8][26] = paint[7][26] = paint[6][26] = paint[5][25] = paint[5][26] = " ";
		paint[5][29] = ">";
		paint[5][30] = "O";
		color[5][29] = color[5][30] = fishColor[fishType];
		await slep(.5 * speedMultiplierByHunger * bigFishMultiplier / data.gameState.dataSaver.actionSpeedMultiplier);
		paint[8][27] = paint[7][28] = paint[6][29] = paint[5][29] = paint[5][30] = " ";
		paint[9][26] = "\\";
		paint[9][27] = paint[9][28] = paint[9][29] = paint[9][30] = paint[9][31] = paint[9][32] = paint[9][33] = paint[9][34] = "-";
		paint[8][35] = "V";
		paint[9][35] = "O";
		color[9][35] = color[8][35] = fishColor[fishType];
		color[5][29] = color[5][30] = "";
		await slep(.5 * speedMultiplierByHunger * bigFishMultiplier / data.gameState.dataSaver.actionSpeedMultiplier);
		paint[10][35] = "O";
		paint[8][35] = " ";
		paint[9][35] = "V";
		color[10][35] = fishColor[fishType];
		color[8][35] = "";
		await slep(.5 * bigFishMultiplier / data.gameState.dataSaver.actionSpeedMultiplier);
		paint[11][34] = "\\";
		paint[11][36] = "/";
		for (let i = 11; i <= 12; i++) {
			paint[i][35] = "O";
			paint[i - 2][35] = " ";
			paint[i - 1][35] = "V";
			color[i][35] = fishColor[fishType];
			color[i - 2][35] = "";
			await slep(.5 * bigFishMultiplier / data.gameState.dataSaver.actionSpeedMultiplier)
		}
		paint[11][34] = paint[11][35] = paint[11][36] = "~";
		paint[13][35] = "O";
		paint[12][35] = "V";
		color[13][35] = fishColor[fishType];
		color[11][35] = "\x1b[1;34m";
		await slep(.5 * bigFishMultiplier / data.gameState.dataSaver.actionSpeedMultiplier);
		paint[13][36] = "O";
		paint[12][35] = " ";
		paint[13][35] = ">";
		color[13][36] = fishColor[fishType];
		color[12][35] = "";
		await slep(.5 * bigFishMultiplier / data.gameState.dataSaver.actionSpeedMultiplier);
		for (let i = 37; i <= 38; i++) {
			paint[13][i] = "O";
			paint[13][i - 2] = " ";
			paint[13][i - 1] = ">";
			color[13][i] = fishColor[fishType];
			color[13][i - 2] = "";
			await slep(.5 * bigFishMultiplier / data.gameState.dataSaver.actionSpeedMultiplier)
		}
		paint[13][38] = paint[13][37] = " ";
		color[13][38] = color[13][37] = "";
		await io.write("\x1b[?25h");
		await getFish(isBigFish, fishType)
	}
	async function fishingStep2Slip(isBigFish, fishType) {
		const speedMultiplierByHunger = data.gameState.dataSaver.hunger < 5 ? 3 : data.gameState.dataSaver.hunger < 10 ? 2 : data.gameState.dataSaver.hunger < 30 ? 1 : data.gameState.dataSaver.hunger < 35 ? .8 : .5;
		const bigFishMultiplier = isBigFish ? 2 : 1;
		await io.write("\x1b[?25l");
		color[11][18] = "\x1b[1;34m";
		paint[11][18] = "~";
		color[10][19] = fishColor[fishType];
		paint[11][19] = "^";
		paint[10][19] = "O";
		await slep(.3 * speedMultiplierByHunger * bigFishMultiplier / data.gameState.dataSaver.actionSpeedMultiplier);
		currentWaitingStatus = 4;
		color[11][19] = "\x1b[1;34m";
		paint[11][19] = "~";
		color[10][19] = "";
		paint[10][19] = " ";
		paint[10][20] = "^";
		paint[9][19] = "O";
		color[10][20] = color[9][19] = fishColor[fishType];
		await slep(.3 * speedMultiplierByHunger * bigFishMultiplier / data.gameState.dataSaver.actionSpeedMultiplier);
		paint[10][20] = paint[9][19] = " ";
		color[10][20] = color[9][19] = "";
		paint[9][18] = "^";
		paint[8][19] = "O";
		color[9][18] = color[8][19] = fishColor[fishType];
		await slep(.3 * speedMultiplierByHunger * bigFishMultiplier / data.gameState.dataSaver.actionSpeedMultiplier);
		paint[9][18] = paint[8][19] = " ";
		color[9][18] = color[8][19] = "";
		paint[8][20] = "^";
		paint[7][19] = "O";
		color[8][20] = color[7][19] = fishColor[fishType];
		await slep(.3 * speedMultiplierByHunger * bigFishMultiplier / data.gameState.dataSaver.actionSpeedMultiplier);
		paint[6][19] = "j";
		color[8][20] = "";
		paint[8][20] = " ";
		color[7][20] = fishColor[fishType];
		paint[7][20] = "<";
		await slep(.3 * speedMultiplierByHunger * bigFishMultiplier / data.gameState.dataSaver.actionSpeedMultiplier);
		color[7][20] = "";
		paint[5][19] = "j";
		paint[7][20] = paint[6][19] = " ";
		color[8][19] = fishColor[fishType];
		paint[7][19] = "V";
		paint[8][19] = "O";
		await slep(.5 * bigFishMultiplier / data.gameState.dataSaver.actionSpeedMultiplier);
		color[7][19] = "";
		color[9][19] = fishColor[fishType];
		paint[7][19] = " ";
		paint[8][19] = "V";
		paint[9][19] = "O";
		await slep(.5 * bigFishMultiplier / data.gameState.dataSaver.actionSpeedMultiplier);
		color[8][19] = "";
		color[10][19] = fishColor[fishType];
		paint[8][19] = " ";
		paint[9][19] = "V";
		paint[10][19] = "O";
		await slep(.5 * bigFishMultiplier / data.gameState.dataSaver.actionSpeedMultiplier);
		paint[11][18] = "\\";
		paint[11][20] = "/";
		for (let i = 11; i <= 12; i++) {
			color[i - 2][19] = "";
			color[i][19] = fishColor[fishType];
			paint[i - 2][19] = " ";
			paint[i - 1][19] = "V";
			paint[i][19] = "O";
			await slep(.5 / bigFishMultiplier / data.gameState.dataSaver.actionSpeedMultiplier)
		}
		paint[11][18] = paint[11][20] = paint[11][19] = "~";
		color[11][19] = "\x1b[1;34m";
		color[13][19] = fishColor[fishType];
		paint[12][19] = "V";
		paint[13][19] = "O";
		await slep(.5 / bigFishMultiplier / data.gameState.dataSaver.actionSpeedMultiplier);
		paint[12][19] = " ";
		color[12][19] = "";
		color[14][19] = fishColor[fishType];
		paint[13][19] = "V";
		paint[14][19] = "O";
		await slep(.5 / bigFishMultiplier / data.gameState.dataSaver.actionSpeedMultiplier);
		paint[13][19] = " ";
		color[13][19] = "";
		paint[14][19] = "V";
		await slep(.5 / bigFishMultiplier / data.gameState.dataSaver.actionSpeedMultiplier);
		paint[14][19] = " ";
		color[14][19] = "";
		await slep(.5 / bigFishMultiplier / data.gameState.dataSaver.actionSpeedMultiplier);
		paint[8][23] = paint[7][22] = paint[6][21] = paint[5][20] = paint[5][19] = " ";
		paint[9][24] = "/";
		await io.write("\x1b[?25h")
	}
	async function fishingStep1(isBigFish, fishType) {
		const speedMultiplierByHunger = data.gameState.dataSaver.hunger < 5 ? 3 : data.gameState.dataSaver.hunger < 10 ? 2 : data.gameState.dataSaver.hunger < 30 ? 1 : data.gameState.dataSaver.hunger < 35 ? .8 : .5;
		const bigFishMultiplier = isBigFish ? 2 : 1;
		paintLastTick = "";
		consoleSizeLastTick = "";
		lastDrawTime = Math.floor(Date.now() / 1e3);
		currentWaitingStatus = 0;
		await io.write("\x1b[?25l");
		for (let i = 0; i < 15; i++) {
			for (let j = 0; j < 44; j++) {
				color[i][j] = "";
				paint[i][j] = paintTemplate[i][j]
			}
		}
		for (let i = 0; i <= 22; i++) {
			color[11][i] = "\x1b[1;34m"
		}
		for (let i = 31; i <= 42; i++) {
			color[11][i] = "\x1b[1;34m"
		}
		if (data.gameState.fishMan) {
			paint[8][25] = " ";
			paint[9][25] = "O";
			color[9][25] = color[10][24] = color[10][26] = fishColor[6];
			data.gameState.fishMan = false
		}
		await slep(.5 * speedMultiplierByHunger / data.gameState.dataSaver.actionSpeedMultiplier);
		for (let i = 27; i <= 34; i++) {
			paint[9][i] = " "
		}
		paint[9][26] = "V";
		paint[8][27] = paint[7][28] = paint[6][29] = paint[5][30] = "/";
		await slep(.5 * speedMultiplierByHunger / data.gameState.dataSaver.actionSpeedMultiplier);
		paint[8][27] = paint[7][28] = paint[6][29] = paint[5][30] = " ";
		paint[9][26] = paint[8][26] = paint[7][26] = paint[6][26] = paint[5][26] = "|";
		await slep(.5 * speedMultiplierByHunger / data.gameState.dataSaver.actionSpeedMultiplier);
		paint[9][26] = "\\";
		paint[8][26] = paint[7][26] = paint[6][26] = paint[5][26] = " ";
		paint[9][24] = paint[8][24] = paint[7][24] = paint[6][24] = paint[5][24] = "|";
		await slep(.5 * speedMultiplierByHunger / data.gameState.dataSaver.actionSpeedMultiplier);
		paint[8][24] = paint[7][24] = paint[6][24] = paint[5][24] = " ";
		paint[9][24] = "V";
		paint[8][23] = paint[7][22] = paint[6][21] = paint[5][20] = "\\";
		await slep(.5 * speedMultiplierByHunger / data.gameState.dataSaver.actionSpeedMultiplier);
		paint[5][19] = "j";
		await slep(.5 * speedMultiplierByHunger / data.gameState.dataSaver.actionSpeedMultiplier);
		for (let i = 6; i <= 10; i++) {
			paint[i - 1][19] = "|";
			paint[i][19] = "j";
			await slep(.5 * speedMultiplierByHunger / data.gameState.dataSaver.actionSpeedMultiplier)
		}
		paint[10][19] = "|";
		paint[11][19] = "j";
		color[11][19] = "";
		let catchTime = getRandomCatchTime();
		if (currentWeather[0] === 0) {
			catchTime = Math.max(0, catchTime - 5 * currentWeather[1])
		} else if (currentWeather[0] === 1) {
			catchTime = catchTime + 5 * currentWeather[1]
		}
		currentWaitingStatus = 1;
		await wait(catchTime);
		currentWaitingStatus = 2;
		color[11][0] = fishColor[fishType];
		paint[11][0] = "O";
		await slep(.5 * bigFishMultiplier / data.gameState.dataSaver.actionSpeedMultiplier);
		color[11][1] = fishColor[fishType];
		paint[11][0] = ">";
		paint[11][1] = "O";
		await slep(.5 * bigFishMultiplier / data.gameState.dataSaver.actionSpeedMultiplier);
		for (let i = 2; i <= 19; i++) {
			if (i === 19) {
				currentWaitingStatus = 3
			}
			color[11][i - 2] = "\x1b[1;34m";
			paint[11][i - 2] = "~";
			color[11][i] = fishColor[fishType];
			paint[11][i - 1] = ">";
			paint[11][i] = "O";
			await slep(.5 * bigFishMultiplier / data.gameState.dataSaver.actionSpeedMultiplier)
		}
		await io.write("\x1b[?25h");
		const slipOff = functions.random(1, 100) <= data.gameState.dataSaver.slipOffChance + (currentWeather[0] === 5) * 10;
		if (slipOff) {
			await fishingStep2Slip(isBigFish, fishType)
		} else {
			await fishingStep2(isBigFish, fishType)
		}
		precipitationPoints.length = 0
	}
	async function runFishing() {
		let bigFishRoll = functions.random(1, 100) <= data.gameState.dataSaver.bigFishChance;
		if (data.gameState.bigFish) {
			bigFishRoll = true;
			data.gameState.bigFish--
		}
		let fishType = getFishType();
		if (data.gameState.diamondFish) {
			fishType = 6;
			data.gameState.diamondFish--
		}
		await fishingStep1(bigFishRoll, fishType)
	}

	function getFreshnessMultiplier(freshness) {
		if (freshness >= 8) {
			return 1.25
		} else if (freshness <= 2) {
			return .8
		} else {
			return 1
		}
	}
	async function makeFishingRod() {
		await io.clear();
		await io.print(lang.current.fishing.makeFishingRod);
		await io.print(lang.current.fishing.currentFishingRod + lang.current.fishing.fishName[data.gameState.dataSaver.rodLevel] + lang.current.fishing.fishingRod);
		let hasFishInPond = Array(8).fill(false);
		let fishInPondChoices = "";
		for (let i = 0; i <= 6; i++) {
			hasFishInPond[i] = fishInPond[i].length !== 0;
			if (hasFishInPond[i]) {
				fishInPondChoices += i + ". " + lang.current.fishing.fishName[i] + lang.current.fishing.fishingRod + ", "
			}
		}
		hasFishInPond[7] = true;
		if (fishInPondChoices.length === 0) {
			await io.print(lang.current.fishing.none);
			return
		}
		fishInPondChoices += "7. " + lang.current.exit;
		await io.print(fishInPondChoices);
		let selectedFishInPondIndex;
		do {
			selectedFishInPondIndex = Number(await io.getch())
		} while (!Number.isInteger(selectedFishInPondIndex) || selectedFishInPondIndex < 0 || selectedFishInPondIndex > 7 || !hasFishInPond[selectedFishInPondIndex]);
		if (selectedFishInPondIndex === 7) {
			return
		}
		fishInPond[selectedFishInPondIndex].length = 0;
		data.gameState.dataSaver.rodLevel = selectedFishInPondIndex
	}
	async function makeFood() {
		while (true) {
			await io.clear();
			await io.print(lang.current.fishing.rawFish);
			await io.print(lang.current.fishing.currentAmount);
			let hasFishInPond = Array(8).fill(false);
			let fishInPondChoices = "";
			for (let i = 0; i <= 6; i++) {
				hasFishInPond[i] = fishInPond[i].length !== 0;
				if (hasFishInPond[i]) {
					fishInPondChoices += i + ". " + lang.current.fishing.fishName[i] + lang.current.fishing.fish + ", "
				}
			}
			hasFishInPond[7] = true;
			if (fishInPondChoices.length === 0) {
				await io.print(lang.current.fishing.none);
				await functions.sleep(.5);
				return
			}
			fishInPondChoices += "7. " + lang.current.exit;
			for (let i = 1; i <= 6; i++) {
				await io.write(fishColor[i] + lang.current.fishing.fishName[i] + lang.current.fishing.fish + "\x1b[m\n");
				if (fishInPond[i].length) {
					await io.write("    " + lang.current.fishing.fishpond + ": " + fishInPond[i].length + lang.current.fishing.fishNumber + "\n")
				}
				if (data.gameState.dataSaver.foodFish[i][0]) {
					await io.write("    " + lang.current.fishing.rawFish + ": " + data.gameState.dataSaver.foodFish[i][0] + lang.current.fishing.fishNumber + "\n")
				}
				if (data.gameState.dataSaver.foodFish[i][1]) {
					await io.write("    " + lang.current.fishing.roastedFish + ": " + data.gameState.dataSaver.foodFish[i][1] + lang.current.fishing.fishNumber + "\n")
				}
				if (fishInPond[i].length === 0 && !data.gameState.dataSaver.foodFish[i][0] && !data.gameState.dataSaver.foodFish[i][1]) {
					await io.write("    " + lang.current.fishing.none + "\n")
				}
			}
			await io.write("\n");
			await io.print(fishInPondChoices);
			let selectedFishInPondIndex;
			do {
				selectedFishInPondIndex = Number(await io.getch())
			} while (!Number.isInteger(selectedFishInPondIndex) || selectedFishInPondIndex < 0 || selectedFishInPondIndex > 7 || !hasFishInPond[selectedFishInPondIndex]);
			if (selectedFishInPondIndex === 7) {
				return
			}
			if (fishInPond[selectedFishInPondIndex].length === 0) {
				continue
			}
			fishInPond[selectedFishInPondIndex].pop();
			data.gameState.dataSaver.foodFish[selectedFishInPondIndex][0]++
		}
	}
	async function roastFish() {
		await io.clear();
		await io.print(lang.current.fishing.roastedFish);
		await io.print(lang.current.fishing.currentAmount + ": ");
		let hasFishInPond = Array(8).fill(false);
		let fishInPondChoices = "";
		for (let i = 0; i <= 6; i++) {
			hasFishInPond[i] = Boolean(data.gameState.dataSaver.foodFish[i][0]);
			if (hasFishInPond[i]) {
				fishInPondChoices += i + ". " + lang.current.fishing.fishName[i] + lang.current.fishing.fish + ", "
			}
		}
		hasFishInPond[7] = true;
		if (fishInPondChoices.length === 0) {
			await io.print(lang.current.fishing.none);
			await functions.sleep(.5);
			return
		}
		fishInPondChoices += "7. " + lang.current.exit;
		for (let i = 1; i <= 6; i++) {
			await io.write(fishColor[i] + lang.current.fishing.fishName[i] + lang.current.fishing.fish + "\x1b[m\n");
			if (fishInPond[i].length) {
				await io.write("    " + lang.current.fishing.fishpond + ": " + fishInPond[i].length + lang.current.fishing.fishNumber + "\n")
			}
			if (data.gameState.dataSaver.foodFish[i][0]) {
				await io.write("    " + lang.current.fishing.rawFish + ": " + data.gameState.dataSaver.foodFish[i][0] + lang.current.fishing.fishNumber + "\n")
			}
			if (data.gameState.dataSaver.foodFish[i][1]) {
				await io.write("    " + lang.current.fishing.roastedFish + ": " + data.gameState.dataSaver.foodFish[i][1] + lang.current.fishing.fishNumber + "\n")
			}
			if (fishInPond[i].length === 0 && !data.gameState.dataSaver.foodFish[i][0] && !data.gameState.dataSaver.foodFish[i][1]) {
				await io.write("    " + lang.current.fishing.none + "\n")
			}
		}
		await io.write("\n");
		await io.print(fishInPondChoices);
		let selectedFishInPondIndex;
		do {
			selectedFishInPondIndex = Number(await io.getch())
		} while (!Number.isInteger(selectedFishInPondIndex) || selectedFishInPondIndex < 0 || selectedFishInPondIndex > 7 || !hasFishInPond[selectedFishInPondIndex]);
		if (selectedFishInPondIndex === 7 || !data.gameState.dataSaver.foodFish[selectedFishInPondIndex][0]) {
			return
		}
		const minCount = 0,
			maxCount = data.gameState.dataSaver.foodFish[selectedFishInPondIndex][0];
		let count = 0;
		while (true) {
			await io.clear();
			await io.write(lang.current.fishing.makeFoodAction + "\n" + lang.current.fishing.makeRoastedFish + ": " + fishColor[selectedFishInPondIndex] + lang.current.fishing.fishName[selectedFishInPondIndex] + lang.current.fishing.fish + "\x1b[m\n");
			await io.write((count === minCount ? "\x1b[1;31m" : "\x1b[1m") + " < \x1b[m" + count + lang.current.fishing.fishNumber + (count === maxCount ? "\x1b[1;31m" : "\x1b[1m") + " > \x1b[m\n");
			const input = await io.getch();
			if (input === "a" || input === "A") {
				count--;
				if (count < minCount) {
					count = minCount
				}
			} else if (input === "d" || input === "D") {
				count++;
				if (count > maxCount) {
					count = maxCount
				}
			} else if (input === "\r") {
				if (count > data.gameState.dataSaver.foodFish[selectedFishInPondIndex][0] || count < 0 || !data.gameState.dataSaver.ovenCount) {
					await io.clear();
					return
				}
				data.gameState.dataSaver.foodFish[selectedFishInPondIndex][0] -= count;
				data.gameState.dataSaver.foodFish[selectedFishInPondIndex][1] += count;
				await io.clear();
				const roastingTime = Math.ceil(count / data.gameState.dataSaver.ovenCount);
				for (let i = 0; i < roastingTime; i++) {
					for (let j = 0; j < 20; j++) {
						await io.clear();
						await io.write(lang.current.fishing.roasting + "\n");
						const currentRoastingTime = i * 20 + j;
						let done = Math.floor(currentRoastingTime / roastingTime * 3);
						let d2 = done % 2;
						done = Math.floor(done / 2);
						for (let k = 1; k <= done; k++) {
							await io.write("\x1b[32;1m=\x1b[m")
						}
						if (done < 30) {
							await io.write(d2 ? "\x1b[32;1m-\x1b[m" : "\x1b[31;1m=\x1b[m")
						}
						for (let k = done + 1; k < 30; k++) {
							await io.write("\x1b[31;1m=\x1b[m")
						}
						await io.write("\n");
						await io.write(i * data.gameState.dataSaver.ovenCount + "/" + count + lang.current.fishing.done + "\n");
						await functions.sleep(.5)
					}
				}
				await io.clear();
				await io.write(lang.current.fishing.done + "\n");
				for (let k = 0; k < 30; k++) {
					await io.write("\x1b[32;1m=\x1b[m")
				}
				await io.write("\n");
				await io.write(count + "/" + count + lang.current.fishing.done + "\n");
				await functions.sleep();
				return
			} else if (input === "") {
				await io.clear();
				return
			}
		}
	}
	async function eatFish() {
		while (true) {
			await io.clear();
			await io.print(lang.current.fishing.eatRawFish);
			await io.printnl(lang.current.fishing.currentHunger + ": ");
			await io.write((data.gameState.dataSaver.hunger < 10 ? "\x1b[31;1m" : data.gameState.dataSaver.hunger < 30 ? "" : data.gameState.dataSaver.hunger < 35 ? "\x1b[32m" : "\x1b[32;1m") + data.gameState.dataSaver.hunger + "\x1b[m\n");
			await io.print(lang.current.fishing.currentAmount + ": ");
			let hasFishInPond = Array(8).fill(false);
			let fishInPondChoices = "";
			for (let i = 0; i <= 6; i++) {
				hasFishInPond[i] = Boolean(data.gameState.dataSaver.foodFish[i][0]);
				if (hasFishInPond[i]) {
					fishInPondChoices += i + ". " + lang.current.fishing.fishName[i] + lang.current.fishing.rawFish + ", "
				}
			}
			hasFishInPond[7] = true;
			if (fishInPondChoices.length === 0) {
				await io.print(lang.current.fishing.none);
				await functions.sleep(.5);
				return
			}
			fishInPondChoices += "7. " + lang.current.exit;
			for (let i = 1; i <= 6; i++) {
				await io.write(fishColor[i] + lang.current.fishing.fishName[i] + lang.current.fishing.fish + "\x1b[m\n");
				if (data.gameState.dataSaver.foodFish[i][0]) {
					await io.write("    " + lang.current.fishing.rawFish + ": " + data.gameState.dataSaver.foodFish[i][0] + lang.current.fishing.fishNumber + " + " + (i + 3) + "\n")
				}
				if (!data.gameState.dataSaver.foodFish[i][0] && !data.gameState.dataSaver.foodFish[i][1]) {
					await io.write("    " + lang.current.fishing.none + "\n")
				}
			}
			await io.write("\n");
			await io.print(fishInPondChoices);
			let selectedFishInPondIndex;
			do {
				selectedFishInPondIndex = Number(await io.getch())
			} while (!Number.isInteger(selectedFishInPondIndex) || selectedFishInPondIndex < 0 || selectedFishInPondIndex > 7 || !hasFishInPond[selectedFishInPondIndex]);
			if (selectedFishInPondIndex === 7) {
				await functions.sleep(.5);
				return
			}
			if (data.gameState.dataSaver.foodFish[selectedFishInPondIndex][0] < 1) {
				await functions.sleep(.5);
				return
			}
			data.gameState.dataSaver.foodFish[selectedFishInPondIndex][0]--;
			data.gameState.dataSaver.hunger += selectedFishInPondIndex + 3;
			data.gameState.dataSaver.hunger = Math.min(data.gameState.dataSaver.hunger, 40);
			await functions.sleep(.5)
		}
	}
	async function eatRoastedFish() {
		while (true) {
			await io.clear();
			await io.print(lang.current.fishing.eatRoastedFish);
			await io.printnl(lang.current.fishing.currentHunger + ": ");
			await io.write((data.gameState.dataSaver.hunger < 10 ? "\x1b[31;1m" : data.gameState.dataSaver.hunger < 30 ? "" : data.gameState.dataSaver.hunger < 35 ? "\x1b[32m" : "\x1b[32;1m") + data.gameState.dataSaver.hunger + "\x1b[m\n");
			await io.print(lang.current.fishing.currentAmount + ": ");
			let hasFishInPond = Array(8).fill(false);
			let fishInPondChoices = "";
			for (let i = 0; i <= 6; i++) {
				hasFishInPond[i] = Boolean(data.gameState.dataSaver.foodFish[i][1]);
				if (hasFishInPond[i]) {
					fishInPondChoices += i + ". " + lang.current.fishing.fishName[i] + lang.current.fishing.eatRoastedFish + ", "
				}
			}
			hasFishInPond[7] = true;
			if (fishInPondChoices.length === 0) {
				await io.print(lang.current.fishing.none);
				await functions.sleep(.5);
				return
			}
			fishInPondChoices += "7. " + lang.current.exit;
			for (let i = 1; i <= 6; i++) {
				await io.write(fishColor[i] + lang.current.fishing.fishName[i] + lang.current.fishing.fish + "\x1b[m\n");
				if (data.gameState.dataSaver.foodFish[i][1]) {
					await io.write("    " + lang.current.fishing.roastedFish + ": " + data.gameState.dataSaver.foodFish[i][1] + lang.current.fishing.fishNumber + " + " + (i + 7) + "\n")
				}
				if (!data.gameState.dataSaver.foodFish[i][0] && !data.gameState.dataSaver.foodFish[i][1]) {
					await io.write("    " + lang.current.fishing.none + "\n")
				}
			}
			await io.write("\n");
			await io.print(fishInPondChoices);
			let selectedFishInPondIndex;
			do {
				selectedFishInPondIndex = Number(await io.getch())
			} while (!Number.isInteger(selectedFishInPondIndex) || selectedFishInPondIndex < 0 || selectedFishInPondIndex > 7 || !hasFishInPond[selectedFishInPondIndex]);
			if (selectedFishInPondIndex === 7) {
				await functions.sleep(.5);
				return
			}
			if (data.gameState.dataSaver.foodFish[selectedFishInPondIndex][1] < 1) {
				return
			}
			data.gameState.dataSaver.foodFish[selectedFishInPondIndex][1]--;
			data.gameState.dataSaver.hunger += selectedFishInPondIndex + 7;
			data.gameState.dataSaver.hunger = Math.min(data.gameState.dataSaver.hunger, 40);
			await functions.sleep(.5)
		}
	}
	async function eatMenuNoOven() {
		while (true) {
			await io.clear();
			await io.print(functions.listToChoice(lang.current.fishing.noOvenMenu));
			await io.printnl(lang.current.fishing.currentHunger + ": ");
			await io.write((data.gameState.dataSaver.hunger < 10 ? "\x1b[31;1m" : data.gameState.dataSaver.hunger < 30 ? "" : data.gameState.dataSaver.hunger < 35 ? "\x1b[32m" : "\x1b[32;1m") + data.gameState.dataSaver.hunger + "\x1b[m\n");
			await io.print(lang.current.fishing.currentAmount + ": ");
			for (let i = 1; i <= 6; i++) {
				await io.write(fishColor[i] + lang.current.fishing.fishName[i] + lang.current.fishing.fish + "\x1b[m\n");
				if (fishInPond[i].length) {
					await io.write("    " + lang.current.fishing.fishpond + ": " + fishInPond[i].length + lang.current.fishing.fishNumber + "\n")
				}
				if (data.gameState.dataSaver.foodFish[i][0]) {
					await io.write("    " + lang.current.fishing.rawFish + ": " + data.gameState.dataSaver.foodFish[i][0] + lang.current.fishing.fishNumber + "\n")
				}
				if (data.gameState.dataSaver.foodFish[i][1]) {
					await io.write("    " + lang.current.fishing.roastedFish + ": " + data.gameState.dataSaver.foodFish[i][1] + lang.current.fishing.fishNumber + "\n")
				}
				if (fishInPond[i].length === 0 && !data.gameState.dataSaver.foodFish[i][0] && !data.gameState.dataSaver.foodFish[i][1]) {
					await io.write("    " + lang.current.fishing.none + "\n")
				}
			}
			while (true) {
				const input = await io.getch();
				if (input === "1") {
					await makeFood();
					break
				} else if (input === "2") {
					await eatFish();
					break
				} else if (input === "3") {
					return
				}
			}
			await functions.sleep(.5)
		}
	}
	async function eatMenu() {
		if (!data.gameState.dataSaver.ovenCount) {
			await eatMenuNoOven();
			return
		}
		while (true) {
			await io.clear();
			await io.print(functions.listToChoice(lang.current.fishing.ovenMenu));
			await io.printnl(lang.current.fishing.currentHunger + ": ");
			await io.write((data.gameState.dataSaver.hunger < 10 ? "\x1b[31;1m" : data.gameState.dataSaver.hunger < 30 ? "" : data.gameState.dataSaver.hunger < 35 ? "\x1b[32m" : "\x1b[32;1m") + data.gameState.dataSaver.hunger + "\x1b[m\n");
			await io.print(lang.current.fishing.currentAmount + ": ");
			for (let i = 1; i <= 6; i++) {
				await io.write(fishColor[i] + lang.current.fishing.fishName[i] + lang.current.fishing.fish + "\x1b[m\n");
				if (fishInPond[i].length) {
					await io.write("    " + lang.current.fishing.fishpond + ": " + fishInPond[i].length + lang.current.fishing.fishNumber + "\n")
				}
				if (data.gameState.dataSaver.foodFish[i][0]) {
					await io.write("    " + lang.current.fishing.rawFish + ": " + data.gameState.dataSaver.foodFish[i][0] + lang.current.fishing.fishNumber + "\n")
				}
				if (data.gameState.dataSaver.foodFish[i][1]) {
					await io.write("    " + lang.current.fishing.roastFish + ": " + data.gameState.dataSaver.foodFish[i][1] + lang.current.fishing.fishNumber + "\n")
				}
				if (fishInPond[i].length === 0 && !data.gameState.dataSaver.foodFish[i][0] && !data.gameState.dataSaver.foodFish[i][1]) {
					await io.write("    " + lang.current.fishing.none + "\n")
				}
			}
			await io.write("\n");
			while (true) {
				const input = await io.getch();
				if (input === "1") {
					await makeFood();
					break
				} else if (input === "2") {
					await roastFish();
					break
				} else if (input === "3") {
					await eatFish();
					break
				} else if (input === "4") {
					await eatRoastedFish();
					break
				} else if (input === "5") {
					return
				}
			}
			await functions.sleep(.5)
		}
	}
	async function run() {
		while (true) {
			await io.clear();
			await io.print(functions.listToChoice(lang.current.fishing.mainMenu));
			await io.printnl(lang.current.fishing.currentHunger + ": ");
			await io.write((data.gameState.dataSaver.hunger < 10 ? "\x1b[31;1m" : data.gameState.dataSaver.hunger < 30 ? "" : data.gameState.dataSaver.hunger < 35 ? "\x1b[32m" : "\x1b[32;1m") + data.gameState.dataSaver.hunger + "\x1b[m\n");
			await io.print(lang.current.fishing.currentFishingRod + lang.current.fishing.fishName[data.gameState.dataSaver.rodLevel] + lang.current.fishing.fishingRod);
			for (let i = 0; i <= 6; i++) {
				await io.write(fishColor[i] + lang.current.fishing.fishName[i] + lang.current.fishing.fish + "\x1b[m\n");
				for (let j = 0; j < fishInPond[i].length; j++) {
					if (fishInPond[i][j] >= 8) {
						await io.write("\x1b[1;32m")
					} else if (fishInPond[i][j] <= 2) {
						await io.write("\x1b[1;31m")
					} else {
						await io.write("\x1b[1m")
					}
					await io.write("    " + lang.current.fishing.freshness + ": " + fishInPond[i][j] + "\x1b[m\n")
				}
				if (fishInPond[i].length === 0) {
					await io.write("    " + lang.current.fishing.none + "\x1b[m\n")
				}
			}
			while (true) {
				const input = await io.getch();
				if (input === "1") {
					for (let i = 0; i <= 6; i++) {
						for (let j = 0; j < fishInPond[i].length; j++) {
							fishInPond[i][j] -= 1;
							if (fishInPond[i][j] <= 0) {
								if (i !== 0) {
									fishInPond[i - 1].push(10)
								}
								for (let k = j + 1; k < fishInPond[i].length; k++) {
									fishInPond[i][k - 1] = fishInPond[i][k]
								}
								fishInPond[i].pop();
								j--
							}
						}
					}
					await runFishing();
					data.gameState.dataSaver.hunger--;
					break
				} else if (input === "2") {
					await makeFishingRod();
					await functions.sleep(1);
					break
				} else if (input === "3") {
					await eatMenu();
					break
				} else if (input === "4") {
					for (let i = 0; i <= 6; i++) {
						for (let j = 0; j < fishInPond[i].length; j++) {
							data.gameState.dataSaver.money += Math.round(getRandomIncome(getFreshnessMultiplier(fishInPond[i][j])))
						}
						while (fishInPond[i].length !== 0) {
							fishInPond[i].pop()
						}
					}
					await io.clear();
					break
				} else if (input === "5") {
					for (let i = 0; i <= 6; i++) {
						for (let j = 0; j < fishInPond[i].length; j++) {
							data.gameState.dataSaver.money += Math.round(getRandomIncome(getFreshnessMultiplier(fishInPond[i][j])))
						}
						while (fishInPond[i].length !== 0) {
							fishInPond[i].pop()
						}
					}
					return
				}
			}
			await functions.sleep(1)
		}
	}
	return run
}
