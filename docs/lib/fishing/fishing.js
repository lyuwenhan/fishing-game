import variate from "./variate.js";
import func from "./func.js";
const fishGai = [
	[0, 8100, 1400, 400, 90, 9, 1],
	[100, 8e3, 1400, 400, 90, 9, 1],
	[300, 7500, 1700, 400, 90, 9, 1],
	[500, 7e3, 1700, 700, 90, 9, 1],
	[700, 6500, 1700, 700, 390, 9, 1],
	[900, 6e3, 1700, 700, 390, 309, 1],
	[0, 6600, 1700, 700, 390, 309, 301]
];
const aquaGet = [1, 10, 20, 30, 40, 50, 100];
const old = ["                                            ", "                                            ", "                                            ", "                                            ", "                                            ", "                                            ", "                                            ", "                                            ", "                         o                  ", "                        /|\\--------         ", "                        /_\\___              ", "~~~~~~~~~~~~~~~~~~~~~~~|      |~~~~~~~~~~~~|", "                              |            |", "                              |            |", "                              |____________|"];
var la = 0;
var la2 = 0;
const wea = ["雨    ", "雪    ", "晴      ", "阴      ", "多云    ", "雾      "];
const ty = ["", "小", "中", "大"];
const weatherpcr = [
	["     [33;1m_____[m                                  ", "    [33;1m|     |[m                                 ", "    [33;1m|     |[m                                 ", "    [33;1m|_____|[m                                 "],
	["         _______      ___________           ", "     ___/       \\____/           \\___       ", "    (                                )      ", "     \\______________________________/       "],
	["         [33;1m_____[m       ___________            ", "     ___[33;1m|_____|[m_____/           \\____       ", "    (                                )      ", "     \\______________________________/       "]
];
const maCnt = [0, 11, 20, 40];
const fu = [".", "*", " ", " ", " ", " "];
const fuColor = ["[1;34m", "[1;36m", "", "", "", ""];
var weather = [2, 0];
var lw = 0;
var weaPoint = [];
var paint;
var last;
var color;
var fish = [[], [], [], [], [], [], []];
var dirty = 0;
const fishName = ["腐烂的", "普通的", "紫水晶", "青金石", "金", "绿宝石", "钻石"];
const fishColor = ["[1;31m", "[1;37m", "[1;35m", "[1;34m", "[1;33m", "[1;32m", "[1;36m"];
var nowStatus = 0;
const statuses = ["抛竿中", "等待中", "鱼正在靠近", "收杆中", "已脱钩"];
const fishAdd = [0, 1, 2, 5, 10, 50, 100];
var terBig = [0, 0];

function change (wea) {
	if (wea[0] < 0 || wea[0] > 5 || wea[1] < 0 || wea[1] > 3) {
		return [3, 0]
	}
	if (wea[0] === 0 || wea[0] === 1) {
		if (wea[1] < 2) {
			let ra = func.random(1, 20);
			if (ra <= 9) {
				return wea
			} else if (ra <= 15) {
				return [wea[0], func.random(1, 3)]
			} else if (ra <= 18) {
				return [func.random(0, 1), wea[1]]
			} else {
				return [func.random(2, 4), 0]
			}
		} else {
			let ra = func.random(1, 2);
			if (ra <= 1) {
				return [wea[0], func.random(1, 3)]
			} else if (ra <= 15) {
				return wea
			}
		}
	} else if (wea[0] === 2 || wea[0] === 3 || wea[0] === 4) {
		let ra = func.random(1, 10);
		if (ra <= 1) {
			return [5, wea[1]]
		} else if (ra <= 3) {
			return [func.random(0, 1), func.random(1, 2)]
		} else if (ra <= 6) {
			return [func.random(2, 4), wea[1]]
		} else {
			return wea
		}
	} else {
		let ra = func.random(1, 10);
		if (ra <= 3) {
			return [func.random(2, 4), wea[1]]
		} else {
			return wea
		}
	}
	return wea
}

function randTime (l) {
	l ??= variate.dataSaver.level;
	return func.random(variate.minTime[l], variate.maxTime[l])
}

function gr (l, bei) {
	l ??= variate.dataSaver.getLevel;
	bei ??= 1;
	return func.random(bei * variate.minGet[l], bei * variate.maxGet[l])
}

function getType () {
	let ty = func.random(1, 1e4);
	for (let i = 0; i <= 6; i++) {
		ty -= fishGai[variate.dataSaver.gan][i];
		if (ty <= 0) {
			return i
		}
	}
	return 0
}
async function get (isBig, type) {
	func.clear();
	if (variate.dataSaver.hungry <= 2) {
		await func.printa("你钓到了一条", fishColor[type], fishName[type], isBig ? "大" : "", "鱼[m, 因饥饿已食用");
		variate.dataSaver.hungry += type + 3;
		return
	}
	let pri = gr(variate.dataSaver.getLevel, (isBig + 1) * fishAdd[type]);
	if (type === 4 && isBig) {
		func.clear();
		await func.printa("你钓到了一条", fishColor[type], "鸡蛋鱼[m, 价值$", pri)
	} else {
		await func.printa("你钓到了一条", fishColor[type], fishName[type], isBig ? "大" : "", "鱼[m, 价值$", pri)
	}
	let cnt = 0;
	for (let i = 0; i <= 6; i++) {
		cnt += variate.dataSaver.aqFishCnt[i]
	}
	let i;
	for (i = 0; i < type; i++) {
		if (variate.dataSaver.aqFishCnt[i]) {
			break
		}
	}
	if (variate.dataSaver.aqCnt && (cnt < variate.dataSaver.aqCnt || !variate.dataSaver.aqFishCnt[i] || i === type)) {
		if (await func.printYn("是否放入水族馆")) {
			variate.dataSaver.aqFishCnt[type]++;
			if (cnt >= variate.dataSaver.aqCnt) {
				variate.dataSaver.aqFishCnt[i]--
			}
			return
		}
	}
	fish[type].push(10);
	variate.dataSaver.cnt++
}
var lmi = 0;
var lma = 0;
var lst = 0;
var swp = false;

function draw (mi, ma) {
	mi ??= 0;
	ma ??= 0;
	variate.dataSaver.simple = variate.dataSaver.simple != swp;
	let wcg = false,
		wcgd = false;
	const now = func.time();
	while (now - la > 10) {
		let nweather = change(weather);
		if (nweather != weather) {
			wcg = true
		}
		weather = nweather;
		if (weather[0] <= 1) {
			lw = weather[0]
		}
		if (now - la > 100) {
			la = now - 100
		}
		la += 10
	}
	let needCl = swp;
	if (lmi != mi || lma != ma) {
		lmi = mi;
		lma = ma;
		wcg = true;
		needCl = true
	}
	if (lst != nowStatus) {
		lst = nowStatus;
		wcg = true;
		needCl = true
	}
	while (la2 > .2) {
		la2 -= .2;
		for (let i = weaPoint.length - 1; i >= 0; i--) {
			weaPoint[i][0] += 1;
			wcgd = true;
			if (weaPoint[i][0] > 10) {
				let tmp = weaPoint[i];
				weaPoint[i] = weaPoint[weaPoint.length - 1];
				weaPoint[weaPoint.length - 1] = tmp;
				weaPoint.pop()
			}
		}
		if (maCnt[weather[1]]) {
			wcgd = true;
			weaPoint.push([0, func.random(0, 44)])
		}
		for (let i = 1; i <= maCnt[weather[1]] / 6 - 1 && weaPoint.length < maCnt[weather[1]]; i++) {
			if (weaPoint.length < maCnt[weather[1]] && func.random(1, 2) <= 1) {
				wcgd = true;
				weaPoint.push([0, func.random(0, 44)])
			}
		}
	}
	let start = 0;
	let nowSize = func.consoleSize;
	const sizeOk1 = nowSize.rows < 20,
		sizeOk2 = nowSize.cols < 51;
	if (JSON.stringify(paint) !== JSON.stringify(last)) {
		wcgd = true;
		last = paint.map(inner => [...inner])
	}
	if (terBig != nowSize) {
		terBig = nowSize;
		needCl = true
	}
	if (variate.dataSaver.simple || sizeOk1 || sizeOk2) {
		if (needCl) {
			func.printnl("c[?25l")
		} else if (variate.dataSaver.simple || wcg) {
			func.printnl("[H")
		} else {
			return
		}
		if (!variate.dataSaver.simple) {
			if (sizeOk1) {
				func.print("屏幕高度需至少为20行");
				func.print("当前为 ", nowSize.rows, " 行")
			}
			if (sizeOk2) {
				func.print("屏幕宽度需至少为51列");
				func.print("当前为 ", nowSize.cols, " 列")
			}
		}
	} else {
		if (needCl) {
			func.printnl("c[?25l")
		} else if (wcg || wcgd) {
			func.printnl("[H")
		} else {
			return
		}
		if (weather[0] === 3 || weather[0] === 4 || weather[0] === 2) {
			start = 4;
			for (let i = 0; i < 4; i++) {
				func.print(weatherpcr[weather[0] - 2][i])
			}
		}
		for (let i = start; i < 15; i++) {
			for (let j = 0; j < 45; j++) {
				let b = false;
				for (let p of weaPoint) {
					if (p[0] === i && p[1] === j) {
						b = true;
						break
					}
				}
				if (paint[i][j] === " " && b) {
					func.printnl("[m", fuColor[lw], fu[lw], "[m")
				} else {
					func.printnl("[m", color[i][j], paint[i][j], "[m")
				}
			}
			func.print()
		}
	}
	func.print("当前状态: ", statuses[nowStatus]);
	func.print("累计钓鱼数量: ", variate.dataSaver.cnt, " 当前天气: ", ty[weather[1]], wea[weather[0]]);
	if (ma > 0) {
		if (mi > 0) {
			func.print("预计剩余时间: ", mi / 2, " min ~ ", ma / 2, " min")
		} else {
			func.print("预计剩余时间: < ", ma / 2, " min")
		}
	}
	func.print(variate.dataSaver.simple ? "按 e 键退出简洁模式" : "按 e 键进入简洁模式");
	swp = false
}
async function sleepCheck (s) {
	for (let c of func.getch2s()) {
		if (c === "e") {
			swp = !swp
		}
	}
	await func.sleep(s)
}
async function slep (s) {
	s = Math.floor(s * 100 + .5) / 100;
	if (s < .01) {
		s = .01
	}
	while (s > .1) {
		await sleepCheck(.1);
		draw();
		s -= .1;
		la2 += .1
	}
	await sleepCheck(s);
	draw();
	la2 += s
}
async function wait (s) {
	s = Math.floor(s * 100 + .5) / 100;
	let mi = variate.minTime[variate.dataSaver.level] * 10,
		ma = variate.maxTime[variate.dataSaver.level] * 10;
	if (s && s < .01) {
		s = .01
	}
	while (s > .1) {
		await sleepCheck(.1);
		if (mi > 10) {
			mi -= 1
		}
		if (ma > 10) {
			ma -= 1
		}
		s -= .1;
		la2 += .1;
		draw(Math.floor((mi - 10) / 300), Math.floor(Math.max((ma + 290) / 300, 1)))
	}
	if (s) {
		await sleepCheck(s);
		draw(Math.floor((mi - 10) / 300), Math.floor(Math.max((ma + 290) / 300, 1)))
	}
	la2 += s
}
async function fishing (isBig, type) {
	const hungSpeed = variate.dataSaver.hungry < 5 ? 3 : variate.dataSaver.hungry < 10 ? 2 : variate.dataSaver.hungry < 30 ? 1 : variate.dataSaver.hungry < 35 ? .8 : .5;
	func.printnl("[?25l");
	color[11][18] = "[1;34m";
	paint[11][18] = "~";
	color[10][19] = fishColor[type];
	paint[11][19] = "^";
	paint[10][19] = "O";
	await slep(.5 * hungSpeed * (isBig + 1) / variate.dataSaver.stime);
	color[11][19] = "[1;34m";
	paint[11][19] = "~";
	color[9][19] = fishColor[type];
	paint[10][19] = "^";
	paint[9][19] = "O";
	await slep(.5 * hungSpeed * (isBig + 1) / variate.dataSaver.stime);
	for (let i = 8; i >= 5; i--) {
		color[i + 2][19] = "";
		paint[i + 2][19] = " ";
		color[i][19] = fishColor[type];
		paint[i + 1][19] = "^";
		paint[i][19] = "O";
		await slep(.5 * hungSpeed * (isBig + 1) / variate.dataSaver.stime)
	}
	paint[9][24] = paint[8][24] = paint[7][24] = paint[6][24] = "|";
	paint[8][23] = paint[7][22] = paint[6][21] = paint[5][20] = paint[5][19] = paint[6][19] = " ";
	color[5][19] = color[6][19] = "";
	paint[5][23] = ">";
	paint[5][24] = "O";
	color[5][23] = color[5][24] = fishColor[type];
	await slep(.5 * hungSpeed * (isBig + 1) / variate.dataSaver.stime);
	paint[9][26] = "V";
	paint[8][24] = paint[7][24] = paint[6][24] = paint[5][23] = paint[5][24] = " ";
	color[5][23] = color[5][24] = "";
	paint[9][26] = paint[8][26] = paint[7][26] = paint[6][26] = "|";
	paint[9][24] = "/";
	paint[5][25] = ">";
	paint[5][26] = "O";
	color[5][25] = color[5][26] = fishColor[type];
	await slep(.5 * hungSpeed * (isBig + 1) / variate.dataSaver.stime);
	paint[9][26] = paint[8][27] = paint[7][28] = paint[6][29] = "/";
	color[5][25] = color[5][26] = "";
	paint[8][26] = paint[7][26] = paint[6][26] = paint[5][25] = paint[5][26] = " ";
	paint[5][29] = ">";
	paint[5][30] = "O";
	color[5][29] = color[5][30] = fishColor[type];
	await slep(.5 * hungSpeed * (isBig + 1) / variate.dataSaver.stime);
	paint[8][27] = paint[7][28] = paint[6][29] = paint[5][29] = paint[5][30] = " ";
	paint[9][26] = "\\";
	paint[9][27] = paint[9][28] = paint[9][29] = paint[9][30] = paint[9][31] = paint[9][32] = paint[9][33] = paint[9][34] = "-";
	paint[8][35] = "V";
	paint[9][35] = "O";
	color[9][35] = color[8][35] = fishColor[type];
	color[5][29] = color[5][30] = "";
	await slep(.5 * hungSpeed * (isBig + 1) / variate.dataSaver.stime);
	paint[10][35] = "O";
	paint[8][35] = " ";
	paint[9][35] = "V";
	color[10][35] = fishColor[type];
	color[8][35] = "";
	await slep(.5 * (isBig + 1) / variate.dataSaver.stime);
	paint[11][34] = "\\";
	paint[11][36] = "/";
	for (let i = 11; i <= 12; i++) {
		paint[i][35] = "O";
		paint[i - 2][35] = " ";
		paint[i - 1][35] = "V";
		color[i][35] = fishColor[type];
		color[i - 2][35] = "";
		await slep(.5 * (isBig + 1) / variate.dataSaver.stime)
	}
	paint[11][34] = paint[11][35] = paint[11][36] = "~";
	paint[13][35] = "O";
	paint[12][35] = "V";
	color[13][35] = fishColor[type];
	color[11][35] = "[1;34m";
	await slep(.5 * (isBig + 1) / variate.dataSaver.stime);
	paint[13][36] = "O";
	paint[12][35] = " ";
	paint[13][35] = ">";
	color[13][36] = fishColor[type];
	color[12][35] = "";
	await slep(.5 * (isBig + 1) / variate.dataSaver.stime);
	for (let i = 37; i <= 38; i++) {
		paint[13][i] = "O";
		paint[13][i - 2] = " ";
		paint[13][i - 1] = ">";
		color[13][i] = fishColor[type];
		color[13][i - 2] = "";
		await slep(.5 * (isBig + 1) / variate.dataSaver.stime)
	}
	paint[13][38] = paint[13][37] = " ";
	color[13][38] = color[13][37] = "";
	func.printnl("[?25h");
	await get(isBig, type)
}
async function fishingslip (isBig, type) {
	const hungSpeed = variate.dataSaver.hungry < 5 ? 3 : variate.dataSaver.hungry < 10 ? 2 : variate.dataSaver.hungry < 30 ? 1 : variate.dataSaver.hungry < 35 ? .8 : .5;
	func.printnl("[?25l");
	color[11][18] = "[1;34m";
	paint[11][18] = "~";
	color[10][19] = fishColor[type];
	paint[11][19] = "^";
	paint[10][19] = "O";
	await slep(.3 * hungSpeed * (isBig + 1) / variate.dataSaver.stime);
	nowStatus = 4;
	color[11][19] = "[1;34m";
	paint[11][19] = "~";
	color[10][19] = "";
	paint[10][19] = " ";
	paint[10][20] = "^";
	paint[9][19] = "O";
	color[10][20] = color[9][19] = fishColor[type];
	await slep(.3 * hungSpeed * (isBig + 1) / variate.dataSaver.stime);
	paint[10][20] = paint[9][19] = " ";
	color[10][20] = color[9][19] = "";
	paint[9][18] = "^";
	paint[8][19] = "O";
	color[9][18] = color[8][19] = fishColor[type];
	await slep(.3 * hungSpeed * (isBig + 1) / variate.dataSaver.stime);
	paint[9][18] = paint[8][19] = " ";
	color[9][18] = color[8][19] = "";
	paint[8][20] = "^";
	paint[7][19] = "O";
	color[8][20] = color[7][19] = fishColor[type];
	await slep(.3 * hungSpeed * (isBig + 1) / variate.dataSaver.stime);
	paint[6][19] = "j";
	color[8][20] = "";
	paint[8][20] = " ";
	color[7][20] = fishColor[type];
	paint[7][20] = "<";
	await slep(.3 * hungSpeed * (isBig + 1) / variate.dataSaver.stime);
	color[7][20] = "";
	paint[5][19] = "j";
	paint[7][20] = paint[6][19] = " ";
	color[8][19] = fishColor[type];
	paint[7][19] = "V";
	paint[8][19] = "O";
	await slep(.5 * (isBig + 1) / variate.dataSaver.stime);
	color[7][19] = "";
	color[9][19] = fishColor[type];
	paint[7][19] = " ";
	paint[8][19] = "V";
	paint[9][19] = "O";
	await slep(.5 * (isBig + 1) / variate.dataSaver.stime);
	color[8][19] = "";
	color[10][19] = fishColor[type];
	paint[8][19] = " ";
	paint[9][19] = "V";
	paint[10][19] = "O";
	await slep(.5 * (isBig + 1) / variate.dataSaver.stime);
	paint[11][18] = "\\";
	paint[11][20] = "/";
	for (let i = 11; i <= 12; i++) {
		color[i - 2][19] = "";
		color[i][19] = fishColor[type];
		paint[i - 2][19] = " ";
		paint[i - 1][19] = "V";
		paint[i][19] = "O";
		await slep(.5 / (isBig + 1) / variate.dataSaver.stime)
	}
	paint[11][18] = paint[11][20] = paint[11][19] = "~";
	color[11][19] = "[1;34m";
	color[13][19] = fishColor[type];
	paint[12][19] = "V";
	paint[13][19] = "O";
	await slep(.5 / (isBig + 1) / variate.dataSaver.stime);
	paint[12][19] = " ";
	color[12][19] = "";
	color[14][19] = fishColor[type];
	paint[13][19] = "V";
	paint[14][19] = "O";
	await slep(.5 / (isBig + 1) / variate.dataSaver.stime);
	paint[13][19] = " ";
	color[13][19] = "";
	paint[14][19] = "V";
	await slep(.5 / (isBig + 1) / variate.dataSaver.stime);
	paint[14][19] = " ";
	color[14][19] = "";
	await slep(.5 / (isBig + 1) / variate.dataSaver.stime);
	paint[8][23] = paint[7][22] = paint[6][21] = paint[5][20] = paint[5][19] = " ";
	paint[9][24] = "/";
	func.printnl("[?25h")
}
async function frontFishing (isBig, type) {
	terBig = [0, 0];
	la = func.time();
	const hungSpeed = variate.dataSaver.hungry < 5 ? 3 : variate.dataSaver.hungry < 10 ? 2 : variate.dataSaver.hungry < 30 ? 1 : variate.dataSaver.hungry < 35 ? .8 : .5;
	nowStatus = 0;
	func.printnl("[?25l");
	last = Array.from({
		length: 15
	}, () => Array(45).fill(0));
	paint = old.map(inner => [...inner]);
	color = Array.from({
		length: 15
	}, () => Array(45).fill(""));
	for (let i = 0; i <= 22; i++) {
		color[11][i] = "[1;34m"
	}
	for (let i = 31; i <= 42; i++) {
		color[11][i] = "[1;34m"
	}
	if (variate.fishMan) {
		paint[8][25] = " ";
		paint[9][25] = "O";
		color[9][25] = color[10][24] = color[10][26] = fishColor[6];
		variate.fishMan = false
	}
	await slep(.5 * hungSpeed / variate.dataSaver.stime);
	for (let i = 27; i <= 34; i++) {
		paint[9][i] = " "
	}
	paint[9][26] = "V";
	paint[8][27] = paint[7][28] = paint[6][29] = paint[5][30] = "/";
	await slep(.5 * hungSpeed / variate.dataSaver.stime);
	paint[8][27] = paint[7][28] = paint[6][29] = paint[5][30] = " ";
	paint[9][26] = paint[8][26] = paint[7][26] = paint[6][26] = paint[5][26] = "|";
	await slep(.5 * hungSpeed / variate.dataSaver.stime);
	paint[9][26] = "\\";
	paint[8][26] = paint[7][26] = paint[6][26] = paint[5][26] = " ";
	paint[9][24] = paint[8][24] = paint[7][24] = paint[6][24] = paint[5][24] = "|";
	await slep(.5 * hungSpeed / variate.dataSaver.stime);
	paint[8][24] = paint[7][24] = paint[6][24] = paint[5][24] = " ";
	paint[9][24] = "V";
	paint[8][23] = paint[7][22] = paint[6][21] = paint[5][20] = "\\";
	await slep(.5 * hungSpeed / variate.dataSaver.stime);
	paint[5][19] = "j";
	await slep(.5 * hungSpeed / variate.dataSaver.stime);
	for (let i = 6; i <= 10; i++) {
		paint[i - 1][19] = "|";
		paint[i][19] = "j";
		await slep(.5 * hungSpeed / variate.dataSaver.stime)
	}
	paint[10][19] = "|";
	paint[11][19] = "j";
	color[11][19] = "";
	let stime = randTime();
	if (weather[0] === 0) {
		stime = Math.max(0, stime - 5 * weather[1])
	}
	if (weather[0] === 1) {
		stime = Math.max(0, stime + 5 * weather[1])
	}
	nowStatus = 1;
	await wait(stime);
	nowStatus = 2;
	color[11][0] = fishColor[type];
	paint[11][0] = "O";
	await slep(.5 * (isBig + 1) / variate.dataSaver.stime);
	color[11][1] = fishColor[type];
	paint[11][0] = ">";
	paint[11][1] = "O";
	await slep(.5 * (isBig + 1) / variate.dataSaver.stime);
	for (let i = 2; i <= 19; i++) {
		if (i === 19) {
			nowStatus = 3
		}
		color[11][i - 2] = "[1;34m";
		paint[11][i - 2] = "~";
		color[11][i] = fishColor[type];
		paint[11][i - 1] = ">";
		paint[11][i] = "O";
		await slep(.5 * (isBig + 1) / variate.dataSaver.stime)
	}
	func.print("[?25h");
	let slip = func.random(1, 100) <= variate.dataSaver.slip + (weather[0] === 5) * 10;
	if (slip) {
		await fishingslip(isBig, type)
	} else {
		await fishing(isBig, type)
	}
	weaPoint.length = 0
}
async function fishingChoose () {
	let b = func.random(1, 100) <= variate.dataSaver.bf;
	if (variate.big) {
		b = true;
		variate.big--
	}
	let type = getType();
	if (variate.diamond) {
		type = 6;
		variate.diamond--
	}
	await frontFishing(b, type)
}

function fresh (a) {
	if (a >= 8) {
		return 1.25
	} else if (a <= 2) {
		return .8
	} else {
		return 1
	}
}
async function getGan () {
	func.clear();
	func.print("鱼竿兑换");
	func.print("当前鱼竿: ", fishName[variate.dataSaver.gan], "鱼竿");
	let b = Array(8).fill(false);
	let s = "";
	for (let i = 0; i <= 6; i++) {
		b[i] = Boolean(fish[i].length);
		if (b[i]) {
			s += i;
			s += ". ";
			s += fishName[i];
			s += "鱼竿";
			s += ", "
		}
	}
	b[7] = true;
	if (!s.length) {
		func.print("暂无");
		return
	}
	s += "7.退出";
	func.print(s);
	let d;
	while (true) {
		let c = await func.getch();
		c -= "0";
		if (c >= 0 && c <= 7) {
			if (b[c]) {
				d = c;
				break
			}
		}
	}
	if (d === 7) {
		return
	}
	if (fish[d].length) {
		fish[d].pop()
	}
	variate.dataSaver.gan = d
}
async function aqua () {
	{
		let cnt = 0;
		for (let i = 0; i <= 6; i++) {
			cnt += variate.dataSaver.aqFishCnt[i]
		}
		for (let i = 6; i >= 1 && cnt > 0; i--) {
			while (variate.dataSaver.aqFishCnt[i] > 0) {
				variate.dataSaver.aqFishCnt[i]--
			}
		}
	}
	func.clear();
	func.print("水族馆");
	func.print("提示: 只有在水族馆里才能获得水族馆的收益");
	func.print("1.退出");
	variate.aqnow = func.time();
	for (let i = 0; i <= 6; i++) {
		func.print(fishColor[i], fishName[i], "鱼: ", variate.dataSaver.aqFishCnt[i], "只[m")
	}
	while (await func.getch() != "1");
	let cnt = 0;
	for (let i = 0; i <= 6; i++) {
		cnt += aquaGet[i] * variate.dataSaver.aqFishCnt[i]
	}
	variate.aqother += func.time() - variate.aqnow;
	variate.aqnow = 0;
	cnt *= variate.aqother / 60;
	variate.aqother %= 60;
	variate.dataSaver.money += cnt;
	func.print("你共获得 ", cnt, "$ 的收益")
}
async function makeFood () {
	while (true) {
		func.clear();
		func.print("生鱼肉");
		func.print("当前数量: ");
		let b = Array(8).fill(false);
		let s = "";
		for (let i = 0; i <= 6; i++) {
			b[i] = Boolean(fish[i].length);
			if (b[i]) {
				s += i;
				s += ". ";
				s += fishName[i];
				s += "鱼: ";
				s += ", "
			}
		}
		b[7] = true;
		if (!s.length) {
			func.print("暂无");
			await func.sleep(.5);
			return
		}
		s += "7.退出";
		for (let i = 1; i <= 6; i++) {
			func.print(fishColor[i], fishName[i], "鱼: ", "[m");
			if (fish[i].length) {
				func.print("    鱼池: ", fish[i].length, " 只")
			}
			if (variate.dataSaver.fish[i][0]) {
				func.print("    生鱼: ", variate.dataSaver.fish[i][0], " 只")
			}
			if (variate.dataSaver.fish[i][1]) {
				func.print("    烤鱼: ", variate.dataSaver.fish[i][1], " 只")
			}
			if (!fish[i].length && !variate.dataSaver.fish[i][0] && !variate.dataSaver.fish[i][1]) {
				func.print("    暂无[m")
			}
		}
		func.print();
		func.print(s);
		let d;
		while (true) {
			let c = await func.getch();
			c -= "0";
			if (c >= 0 && c <= 7) {
				if (b[c]) {
					d = c;
					break
				}
			}
		}
		if (d === 7) {
			break
		}
		if (!fish[d].length) {
			continue
		}
		fish[d].pop();
		variate.dataSaver.fish[d][0]++
	}
}
async function roastFood () {
	func.clear();
	func.print("制作烤鱼");
	func.print("当前数量: ");
	let b = Array(8).fill(false);
	let s = "";
	for (let i = 0; i <= 6; i++) {
		b[i] = variate.dataSaver.fish[i][0];
		if (b[i]) {
			s += i;
			s += ". ";
			s += fishName[i];
			s += "鱼: , "
		}
	}
	b[7] = true;
	if (!s.length) {
		func.print("暂无");
		await func.sleep(.5);
		return
	}
	s += "7.退出";
	for (let i = 1; i <= 6; i++) {
		func.print(fishColor[i], fishName[i], "鱼: ", "[m");
		if (fish[i].length) {
			func.print("    鱼池: ", fish[i].length, " 只")
		}
		if (variate.dataSaver.fish[i][0]) {
			func.print("    生鱼: ", variate.dataSaver.fish[i][0], " 只")
		}
		if (variate.dataSaver.fish[i][1]) {
			func.print("    烤鱼: ", variate.dataSaver.fish[i][1], " 只")
		}
		if (!fish[i].length && !variate.dataSaver.fish[i][0] && !variate.dataSaver.fish[i][1]) {
			func.print("    暂无[m")
		}
	}
	func.print();
	func.print(s);
	let d;
	while (true) {
		let c = await func.getch();
		c -= "0";
		if (c >= 0 && c <= 7) {
			if (b[c]) {
				d = c;
				break
			}
		}
	}
	if (d === 7) {
		await func.sleep(.5);
		return
	}
	if (!variate.dataSaver.fish[d][0]) {
		return
	}
	const l = 0,
		r = variate.dataSaver.fish[d][0];
	let a = 0;
	while (true) {
		func.clear();
		func.print("按 A 减少, D 增加, 按 Enter 制作, 按 Backspace 退出");
		func.print("制作熟鱼肉: ", fishColor[d], fishName[d], "鱼: ", "[m");
		func.print(a === l ? "[1;31m" : "[1m", " < [m", a, " 只", a === r ? "[1;31m" : "[1m", " > [m");
		let c = await func.getch();
		if (c === "a" || c === "A") {
			a--;
			if (a < l) {
				a = l
			}
		} else if (c === "d" || c === "D") {
			a++;
			if (a > r) {
				a = r
			}
		} else if (c === "\r") {
			if (a > variate.dataSaver.fish[d][0] || a < 0 || !variate.dataSaver.roast) {
				func.clear();
				return
			}
			variate.dataSaver.fish[d][0] -= a;
			variate.dataSaver.fish[d][1] += a;
			func.clear();
			let time = (a + variate.dataSaver.roast - 1) / variate.dataSaver.roast;
			for (let i = 0; i < time; i++) {
				for (let j = 0; j < 20; j++) {
					func.clear();
					func.print("烤制中");
					let ok = i * 20 + j,
						all = time;
					let done = Math.min(1 * ok / all * 3);
					let d2 = done & 1;
					done = Math.floor(done / 2);
					for (let k = 1; k <= done; k++) {
						func.printnl("[32;1m=[m")
					}
					if (done < 30) {
						func.printnl(d2 ? "[32;1m-[m" : "[31;1m=[m")
					}
					for (let k = done + 1; k < 30; k++) {
						func.printnl("[31;1m=[m")
					}
					func.print();
					func.print(i * variate.dataSaver.roast, "/", a, " 完成");
					await func.sleep(.5)
				}
			}
			func.clear();
			func.print("烤制完成");
			for (let k = 0; k < 30; k++) {
				func.printnl("[32;1m=[m")
			}
			func.print();
			func.print(a, "/", a, " 完成");
			await func.sleep(.5);
			return
		} else if (c === "\b") {
			func.clear();
			return
		}
	}
}
async function eatFood () {
	while (true) {
		func.clear();
		func.print("食用生鱼肉");
		func.print("当前饱食度: ", variate.dataSaver.hungry < 10 ? "[31;1m" : variate.dataSaver.hungry < 30 ? "" : variate.dataSaver.hungry < 35 ? "[32m" : "[32;1m", variate.dataSaver.hungry, "[m");
		func.print("当前数量: ");
		let b = Array(8).fill(false);
		let s = "";
		for (let i = 0; i <= 6; i++) {
			b[i] = variate.dataSaver.fish[i][0];
			if (b[i]) {
				s += i;
				s += ". ";
				s += fishName[i];
				s += "生鱼, "
			}
		}
		b[7] = true;
		if (!s.length) {
			func.print("暂无");
			await func.sleep(.5);
			return
		}
		s += "7.退出";
		for (let i = 1; i <= 6; i++) {
			func.print(fishColor[i], fishName[i], "鱼: ", "[m");
			if (variate.dataSaver.fish[i][0]) {
				func.print("    生鱼: ", variate.dataSaver.fish[i][0], " 只 +", i + 3)
			}
			if (!variate.dataSaver.fish[i][0] && !variate.dataSaver.fish[i][1]) {
				func.print("    暂无[m")
			}
		}
		func.print();
		func.print(s);
		let d;
		while (true) {
			let c = await func.getch();
			c -= "0";
			if (c >= 0 && c <= 7) {
				if (b[c]) {
					d = c;
					break
				}
			}
		}
		if (d === 7) {
			await func.sleep(.5);
			return
		}
		if (variate.dataSaver.fish[d][0] < 1) {
			await func.sleep(.5);
			return
		}
		variate.dataSaver.fish[d][0]--;
		variate.dataSaver.hungry += d + 3;
		variate.dataSaver.hungry = Math.min(variate.dataSaver.hungry, 40);
		await func.sleep(.5)
	}
}
async function eatFoodRoast () {
	while (true) {
		func.clear();
		func.print("食用熟鱼肉");
		func.printnl("当前饱食度: ");
		func.print(variate.dataSaver.hungry < 10 ? "[31;1m" : variate.dataSaver.hungry < 30 ? "" : variate.dataSaver.hungry < 35 ? "[32m" : "[32;1m", variate.dataSaver.hungry, "[m");
		func.print("当前数量: ");
		let b = Array(8).fill(false);
		let s = "";
		for (let i = 0; i <= 6; i++) {
			b[i] = variate.dataSaver.fish[i][1];
			if (b[i]) {
				s += i;
				s += ". ";
				s += fishName[i];
				s += "熟鱼, "
			}
		}
		b[7] = true;
		if (!s.length) {
			func.print("暂无");
			await func.sleep(.5);
			return
		}
		s += "7.退出";
		for (let i = 1; i <= 6; i++) {
			func.print(fishColor[i], fishName[i], "鱼: [m");
			if (variate.dataSaver.fish[i][1]) {
				func.print("    烤鱼: ", variate.dataSaver.fish[i][1], " 只 +", i + 7)
			}
			if (!variate.dataSaver.fish[i][0] && !variate.dataSaver.fish[i][1]) {
				func.print("    暂无[m")
			}
		}
		func.print();
		func.print(s);
		let d;
		while (true) {
			let c = await func.getch();
			if (/[0-7]/.test(c)) {
				if (b[c]) {
					d = c;
					break
				}
			}
		}
		if (d === 7) {
			await func.sleep(.5);
			return
		}
		if (variate.dataSaver.fish[d][1] < 1) {
			return
		}
		variate.dataSaver.fish[d][1]--;
		variate.dataSaver.hungry += d + 7;
		variate.dataSaver.hungry = Math.min(variate.dataSaver.hungry, 40);
		await func.sleep(.5)
	}
}
async function noRoast () {
	while (true) {
		func.clear();
		func.print("1.制作食物, 2.食用生鱼肉, 3.退出");
		func.printnl("当前饱食度: ");
		func.print(variate.dataSaver.hungry < 10 ? "[31;1m" : variate.dataSaver.hungry < 30 ? "" : variate.dataSaver.hungry < 35 ? "[32m" : "[32;1m", variate.dataSaver.hungry, "[m");
		func.print("当前数量: ");
		for (let i = 1; i <= 6; i++) {
			func.print(fishColor[i], fishName[i], "鱼: [m");
			if (fish[i].length) {
				func.print("    鱼池: ", fish[i].length, " 只")
			}
			if (variate.dataSaver.fish[i][0]) {
				func.print("    生鱼: ", variate.dataSaver.fish[i][0], " 只")
			}
			if (variate.dataSaver.fish[i][1]) {
				func.print("    烤鱼: ", variate.dataSaver.fish[i][1], " 只")
			}
			if (!fish[i].length && !variate.dataSaver.fish[i][0] && !variate.dataSaver.fish[i][1]) {
				func.print("    暂无[m")
			}
		}
		while (true) {
			let c = await func.getch();
			if (c === "1") {
				await makeFood();
				break
			} else if (c === "2") {
				await eatFood();
				break
			} else if (c === "3") {
				return
			}
		}
		await func.sleep(.5)
	}
}
async function roast () {
	if (!variate.dataSaver.roast) {
		await noRoast();
		return
	}
	while (true) {
		func.clear();
		func.print("1.制作食物, 2.烤制食物, 3.食用生鱼肉, 4.食用熟鱼肉, 5.退出");
		func.printnl("当前饱食度: ");
		func.print(variate.dataSaver.hungry < 10 ? "[31;1m" : variate.dataSaver.hungry < 30 ? "" : variate.dataSaver.hungry < 35 ? "[32m" : "[32;1m", variate.dataSaver.hungry, "[m");
		func.print("当前数量: ");
		for (let i = 1; i <= 6; i++) {
			func.print(fishColor[i], fishName[i], "鱼: ", "[m");
			if (fish[i].length) {
				func.print("    鱼池: ", fish[i].length, " 只")
			}
			if (variate.dataSaver.fish[i][0]) {
				func.print("    生鱼: ", variate.dataSaver.fish[i][0], " 只")
			}
			if (variate.dataSaver.fish[i][1]) {
				func.print("    烤鱼: ", variate.dataSaver.fish[i][1], " 只")
			}
			if (!fish[i].length && !variate.dataSaver.fish[i][0] && !variate.dataSaver.fish[i][1]) {
				func.print("    暂无[m")
			}
		}
		func.print();
		while (true) {
			let c = await func.getch();
			if (c === "1") {
				await makeFood();
				break
			} else if (c === "2") {
				await roastFood();
				break
			} else if (c === "3") {
				await eatFood();
				break
			} else if (c === "4") {
				await eatFoodRoast();
				break
			} else if (c === "5") {
				return
			}
		}
		await func.sleep(.5)
	}
}
export default async function () {
	while (true) {
		func.clear();
		if (dirty >= 10) {
			func.printnl("[31m");
			func.print("当前污染已达极限, 大部分鱼因病死亡[m");
			func.print("1.清理鱼池");
			for (let i = 0; i <= 6; i++) {
				fish[i].length = 0;
				variate.dataSaver.aqFishCnt[i] = 0
			}
			while (await func.getch() === "1") {
				variate.dataSaver.money -= 1e3
			}
		}
		func.print("1.开始钓鱼, 2.清理鱼池, 3.购买钓竿, 4.查看水族馆, 5.制作食物, 6.全部卖出, 7.全部卖出并退出");
		func.printnl("当前饱食度: ");
		func.print(variate.dataSaver.hungry < 10 ? "[31;1m" : variate.dataSaver.hungry < 30 ? "" : variate.dataSaver.hungry < 35 ? "[32m" : "[32;1m", variate.dataSaver.hungry, "[m");
		func.print("当前鱼竿: ", fishName[variate.dataSaver.gan], "鱼竿");
		func.print("当前污染等级: ", dirty);
		for (let i = 0; i <= 6; i++) {
			func.print(fishColor[i], fishName[i], "鱼: ", "[m");
			for (let j = 0; j < fish[i].length; j++) {
				if (fish[i][j] >= 8) {
					func.printnl("[1;32m")
				} else if (fish[i][j] <= 2) {
					func.printnl("[1;31m")
				} else {
					func.printnl("[1m")
				}
				func.print("    新鲜度:", fish[i][j], "[m")
			}
			if (!fish[i].length) {
				func.print("    暂无[m")
			}
		}
		while (true) {
			let c = await func.getch();
			if (c === "1") {
				for (let i = 0; i <= 6; i++) {
					for (let j = 0; j < fish[i].length; j++) {
						fish[i][j] -= dirty + 1;
						if (fish[i][j] <= 0) {
							if (i === 0) {
								dirty++
							} else {
								fish[i - 1].push(10)
							}
							for (let k = j + 1; k < fish[i].length; k++) {
								fish[i][k - 1] = fish[i][k]
							}
							fish[i].pop();
							j--
						}
					}
				}
				await fishingChoose();
				variate.dataSaver.hungry--;
				break
			} else if (c === "2") {
				func.clear();
				if (!dirty) {
					func.print("无需清理");
					break
				}
				while (true) {
					if (variate.dataSaver.cleaningBall) {
						func.print("1.清理, 2.退出");
						func.print("当前污染等级: ", variate.dataSaver.cleaningBall);
						func.print("当前清洁剂个数: ", variate.dataSaver.cleaningBall);
						let c = 0;
						while (true) {
							c = await func.getch();
							if (c === "1" || c === "2") {
								break
							}
						}
						if (c === "1") {
							variate.dataSaver.cleaningBall--;
							dirty -= variate.dataSaver.cleaningSub;
							if (dirty < 0) {
								dirty = 0
							}
						} else {
							break
						}
					} else {
						func.print("1.购买清洁剂并清理, 2.退出");
						func.print("当前污染等级: ", variate.dataSaver.cleaningBall);
						func.print("清洁剂: ");
						func.print("    购买花费: $20, 当前金币数量: $", variate.dataSaver.money);
						let c = 0;
						while (true) {
							c = await func.getch();
							if (c === "1" || c === "2") {
								break
							}
						}
						if (c === "1") {
							if (variate.dataSaver.money < 20) {
								func.print("金币不足");
								break
							} else {
								variate.dataSaver.money -= 20;
								dirty -= variate.dataSaver.cleaningSub;
								if (dirty < 0) {
									dirty = 0
								}
							}
						} else {
							break
						}
					}
					if (!dirty) {
						func.print("清理完成");
						break
					}
				}
				break
			} else if (c === "3") {
				await getGan();
				await func.sleep(.5);
				break
			} else if (c === "4") {
				if (variate.dataSaver.aqCnt) {
					await aqua();
					await func.sleep(.5)
				} else {
					func.print("请在购买水族馆后在来查看");
					await func.sleep(.5)
				}
				break
			} else if (c === "5") {
				await roast();
				break
			} else if (c === "6") {
				for (let i = 0; i <= 6; i++) {
					for (let j = 0; j < fish[i].length; j++) {
						variate.dataSaver.money += Math.floor(gr() * (1 - .02 * dirty) * fresh(fish[i][j]))
					}
					fish[i].length = 0
				}
				func.clear();
				break
			} else if (c === "7") {
				for (let i = 0; i <= 6; i++) {
					for (let j = 0; j < fish[i].length; j++) {
						variate.dataSaver.money += Math.floor(gr() * (1 - .02 * dirty) * fresh(fish[i][j]))
					}
					fish[i].length = 0
				}
				return
			}
		}
		await func.sleep(.5)
	}
}
