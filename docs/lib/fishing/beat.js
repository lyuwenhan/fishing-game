import variate from "./variate.js";
import func from "./func.js";
var america = 0,
	sleepCnt = 0,
	eatCnt = 0,
	e = 0,
	s = 0,
	temple = 0,
	romar = 0,
	headBone = 0,
	draFood = 0;
const things = [{
	title: "简介",
	things: ["你是这个世界的勇者", "你需要经过你的努力打败恶龙", "过程中你会遇到很多的帮助", "以及很多的陷阱"],
	choose: ["开始"],
	cnext: [""],
	cnext2: [1]
}, {
	title: "",
	things: ["你从你的床上醒来", "你要干什么"],
	choose: ["吃早饭", "出去走走", "再睡一会"],
	cnext: ["你吃了早饭", "", "你躺在了床上"],
	cnext2: [-1, 2, -2]
}, {
	title: "",
	things: ["你来到了屋外的路上", "你要干什么"],
	choose: ["回家吃早饭", "回家再睡一会", "去铁匠铺"],
	cnext: ["你回家吃了早饭", "你回家躺在了床上", "你走向了铁匠铺"],
	cnext2: [-1, -2, 3]
}, {
	title: "铁匠铺",
	things: ["你来到了铁匠铺", "铁匠: 听说你要去迎战恶龙", "铁匠: 你需要准备一把称手的武器", "铁匠: 告诉我你需要什么", "铁匠: 没准我能帮上忙"],
	choose: ["离开", "制作武器"],
	cnext: ["你离开了铁匠铺", ""],
	cnext2: [2, 4]
}, {
	title: "铁匠铺",
	things: ["铁匠: 你想要什么样的武器"],
	choose: ["一把长剑"],
	cnext: ["你获得了一把长剑"],
	cnext2: [5]
}, {
	title: "",
	things: ["是时候该出发了"],
	choose: ["沿着东边的小路走", "沿着西边的大路走"],
	cnext: ["", ""],
	cnext2: [6, 14]
}, {
	title: "",
	things: ["你朝着东边走去", "遇到了一个旅馆"],
	choose: ["进入休息", "离开"],
	cnext: ["你进入了旅馆休息", "你在街头搭帐篷过夜"],
	cnext2: [10, 9]
}, {
	title: "",
	things: ["你朝着东边走去", "遇到了一个旅馆"],
	choose: ["进入休息", "离开"],
	cnext: ["你进入了旅馆休息", ""],
	cnext2: [8, 12]
}, {
	title: "Died",
	things: ["你在旅馆被刺杀了"],
	choose: ["重生"],
	cnext: [""],
	cnext2: [1]
}, {
	title: "Died",
	things: ["你在外留宿后冻死在了路边"],
	choose: ["重生"],
	cnext: [""],
	cnext2: [1]
}, {
	title: "",
	things: ["你朝着东边走去", "遇到了一个商人"],
	choose: ["购买食物", "离开"],
	cnext: ["你补充了充足的食物", ""],
	cnext2: [7, 11]
}, {
	title: "Died",
	things: ["你在由于长时间的饥饿死在了路边"],
	choose: ["重生"],
	cnext: [""],
	cnext2: [1]
}, {
	title: "",
	things: ["你遇到了寺庙"],
	choose: ["进入", "离开"],
	cnext: ["", ""],
	cnext2: [13, 11]
}, {
	title: "寺庙",
	things: ["你进入了寺庙", "一心学习佛法", "逐渐修炼成佛", "忘记了你的目的"],
	choose: ["重生"],
	cnext: [""],
	cnext2: [1]
}, {
	title: "",
	things: ["你朝着西边走去", "遇到了一个旅馆"],
	choose: ["进入休息", "离开"],
	cnext: ["你进入了旅馆休息", ""],
	cnext2: [15, 11]
}, {
	title: "旅馆",
	things: ["你听见楼下有说话的声音"],
	choose: ["偷听", "睡觉"],
	cnext: ["", ""],
	cnext2: [16, 8]
}, {
	title: "旅馆",
	things: ["你听见旅馆老板想抢你的钱包"],
	choose: ["跳窗逃走", "与老板战斗"],
	cnext: ["", ""],
	cnext2: [17, 18]
}, {
	title: "Died",
	things: ["你摔死了"],
	choose: ["重生"],
	cnext: [""],
	cnext2: [1]
}, {
	title: "旅馆",
	things: ["你打赢了老板"],
	choose: ["离开"],
	cnext: [""],
	cnext2: [19]
}, {
	title: "",
	things: ["门外有两条路"],
	choose: ["南边的大路", "北边的小路"],
	cnext: ["", ""],
	cnext2: [20, 23]
}, {
	title: "",
	things: ["你朝着南边的大路走去", "遇到了岔路"],
	choose: ["南边的大路", "西边的轮船"],
	cnext: ["", "你走上了轮船"],
	cnext2: [21, 22]
}, {
	title: "罗马",
	things: ["条条大路通罗马", "你到达了罗马"],
	choose: ["重生"],
	cnext: [""],
	cnext2: [1]
}, {
	title: "美洲大陆",
	things: ["你开始了你的大航海", "发现了美洲大陆"],
	choose: ["重生"],
	cnext: [""],
	cnext2: [1]
}, {
	title: "",
	things: ["你朝着北边的小路走去", "发现了山洞"],
	choose: ["进入山洞", "直接离开"],
	cnext: ["你进入了山洞", ""],
	cnext2: [24, 25]
}, {
	title: "山洞",
	things: ["你在山洞里发现了一个土堆", "然后开始刨土", "于是你发现了世界上第一块山顶洞人的完整头盖骨"],
	choose: ["重生"],
	cnext: [""],
	cnext2: [1]
}, {
	title: "",
	things: ["你找到了龙的巢穴"],
	choose: ["进入", "回家吃饭", "回家睡觉"],
	cnext: ["你进入了龙的巢穴", "", ""],
	cnext2: [26, -3, -4]
}, {
	title: "龙巢",
	things: ["你到了龙的巢穴"],
	choose: ["与龙战斗", "回家吃饭", "回家睡觉"],
	cnext: ["你进入了龙的巢穴", "", ""],
	cnext2: [27, -3, -4]
}, {
	title: "龙巢",
	things: ["你打败了恶龙"],
	choose: ["寻找龙蛋"],
	cnext: [""],
	cnext2: [28]
}, {
	title: "龙巢",
	things: ["你找到了龙蛋"],
	choose: ["破坏龙蛋", "孵化龙蛋", "回家吃饭", "回家睡觉"],
	cnext: ["", "", "", ""],
	cnext2: [32, 29, -3, -4]
}, {
	title: "龙巢",
	things: ["你开始孵化龙蛋", "孵化出了小龙"],
	choose: ["杀了吃肉", "放生"],
	cnext: ["", ""],
	cnext2: [30, 31]
}, {
	title: "龙巢",
	things: ["你被小龙杀死了"],
	choose: ["重生"],
	cnext: [""],
	cnext2: [1]
}, {
	title: "龙巢",
	things: ["你完成了你的任务"],
	choose: ["退出"],
	cnext: [""],
	cnext2: [-5]
}, {
	title: "龙巢",
	things: ["你完成了你的任务"],
	choose: ["退出"],
	cnext: [""],
	cnext2: [-5]
}];
var now;

function setup () {
	sleepCnt = eatCnt = temple = romar = america = headBone = e = s = draFood = now = 0
}
async function printBe (a) {
	let title = a.title;
	let things = a.things;
	let choose = a.choose;
	let cnext = a.cnext;
	let cnext2 = a.cnext2;
	if (title.length) {
		func.print(title);
		func.print()
	}
	for (let i = 0; i < things.length; i++) {
		func.print(things[i]);
		await func.sleep(.1)
	}
	func.print();
	switch (now) {
		case 21:
			if (!romar) {
				await func.printa("获得彩蛋: 条条大路通罗马");
				variate.dataSaver.money += 100
			}
			if (romar === 5) {
				await func.printa("获得彩蛋: 误入歧途");
				variate.dataSaver.money += 100
			}
			romar++;
			break;
		case 22:
			if (!america) {
				await func.printa("获得彩蛋: 哥伦布大航海");
				variate.dataSaver.money += 100
			}
			if (america === 5) {
				await func.printa("获得彩蛋: 误入歧途");
				variate.dataSaver.money += 100
			}
			america++;
			break;
		case 24:
			if (!headBone) {
				await func.printa("获得彩蛋: 意外之喜");
				variate.dataSaver.money += 100
			}
			if (headBone === 5) {
				await func.printa("获得彩蛋: 考古专家");
				variate.dataSaver.money += 100
			}
			headBone++;
			break
	}
	let s;
	for (let i = 0; i < choose.length; i++) {
		s += i + 1;
		s += "." + choose[i];
		if (i < choose.length - 1) {
			s += ", "
		}
	}
	func.print(s);
	let code;
	while (true) {
		code = (await func.getch()).charCodeAt(0) - 48;
		if (code > 0 && code <= choose.length) {
			break
		}
	}
	if (cnext[code - 1].length) {
		func.clear();
		await func.printa(cnext[code - 1])
	}
	now = cnext2[code - 1];
	switch (now) {
		case 13:
			if (!temple) {
				await func.printa("获得彩蛋: 学习佛法, 一心向善");
				variate.dataSaver.money += 100
			} else if (temple === 5) {
				await func.printa("获得彩蛋: 修炼成仙");
				variate.dataSaver.money += 100
			}
			temple++;
			break;
		case 30:
			if (eatCnt >= 30 && !draFood) {
				await func.printa("获得彩蛋: 真香");
				variate.dataSaver.money += 100
			}
			draFood++;
			break;
		case -3:
			if (eatCnt >= 30 && e === 0) {
				await func.printa("获得彩蛋: 不忘初心");
				variate.dataSaver.money += 100
			} else if (eatCnt >= 30 && e === 5) {
				await func.printa("获得彩蛋: 牢记使命");
				variate.dataSaver.money += 200
			}
			e++;
			now = 1;
			break;
		case -4:
			if (sleepCnt >= 30 && s === 0) {
				await func.printa("获得彩蛋: 床真软");
				variate.dataSaver.money += 100
			} else if (sleepCnt >= 30 && s === 5) {
				await func.printa("获得彩蛋: 还是睡觉舒服");
				variate.dataSaver.money += 200
			}
			s++;
			now = 1;
			break;
		case -1:
			eatCnt++;
			if (eatCnt === 5) {
				await func.printa("获得彩蛋: 人是铁, 饭是钢, 一顿不吃饿得慌");
				variate.dataSaver.money += 100
			} else if (eatCnt === 10) {
				await func.printa("获得彩蛋: 饿死鬼脱身");
				variate.dataSaver.money += 100
			} else if (eatCnt === 30) {
				await func.printa("获得彩蛋: 贤哉, 回也! 一吨食, 一瓢饮, 在陋巷, 人不堪其忧, 回也不改其乐. 贤哉, 回也! ");
				variate.dataSaver.money += 100
			}
			now = 1;
			break;
		case -2:
			sleepCnt++;
			if (sleepCnt === 5) {
				await func.printa("获得彩蛋: 睡醒了才能出发");
				variate.dataSaver.money += 100
			} else if (sleepCnt === 10) {
				await func.printa("获得彩蛋: 床真舒服");
				variate.dataSaver.money += 100
			} else if (sleepCnt === 30) {
				await func.printa("获得彩蛋: 睡神赋体");
				variate.dataSaver.money += 100
			}
			now = 1;
			break
	}
	func.print();
	await func.sleep(.5)
}
async function main () {
	func.clear();
	setup();
	while (true) {
		func.clear();
		await printBe(things[now]);
		if (now === -5) {
			await func.printa("任务完成");
			variate.dataSaver.tryLevel++;
			variate.dataSaver.money += 100;
			return
		}
	}
}
export default main;
