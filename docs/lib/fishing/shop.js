import variate from "./variate.js";
import func from "./func.js";
async function shop0 () {
	if (variate.dataSaver.aqCnt > 30) {
		variate.dataSaver.aqCnt = 30
	}
	while (true) {
		func.clear();
		func.print("1.升级上钩速度, 2.升级钓鱼收益, 3.脱钩概率, 4.购买清洁剂, 5.升级清洁剂, 6.升级水族馆容量, 7.购买烤箱, 8.返回。");
		func.print("上钩速度: ");
		if (variate.dataSaver.level === variate.maxLevel) {
			func.print("    等级已满")
		} else {
			func.print("    当前平均时间: ", func.toStringF((variate.minTime[variate.dataSaver.level] + variate.maxTime[variate.dataSaver.level]) / 2), ", 升级后平均时间: ", func.toStringF((variate.minTime[variate.dataSaver.level + 1] + variate.maxTime[variate.dataSaver.level + 1]) / 2));
			func.print("    升级花费: $", variate.cost[variate.dataSaver.level + 1] + ", 当前金币数量: $" + variate.dataSaver.money)
		}
		func.print("钓鱼收益: ");
		if (variate.dataSaver.getLevel === variate.maxLevel2) {
			func.print("    等级已满")
		} else {
			func.print("    当前平均收益: ", func.toStringF((variate.minGet[variate.dataSaver.getLevel] + variate.maxGet[variate.dataSaver.getLevel]) / 2), ", 升级后平均收益: " + func.toStringF((variate.minGet[variate.dataSaver.getLevel + 1] + variate.maxGet[variate.dataSaver.getLevel + 1]) / 2));
			func.print("    升级花费: $", variate.cost2[variate.dataSaver.getLevel + 1], ", 当前金币数量: $", variate.dataSaver.money)
		}
		func.print("脱钩概率: ");
		if (variate.dataSaver.slip === 0) {
			func.print("    等级已满")
		} else {
			if (variate.dataSaver.slip > 10) {
				variate.dataSaver.slip -= variate.dataSaver.slip % 10;
				func.print("    当前脱钩概率: ", variate.dataSaver.slip, "%, 升级后脱钩概率: ", variate.dataSaver.slip - 10, "%");
				func.print("    升级花费: $100, 当前金币数量: $", variate.dataSaver.money)
			} else if (variate.dataSaver.slip > 5) {
				variate.dataSaver.slip = 10;
				func.print("    当前脱钩概率: 10%, 升级后脱钩概率: 5%");
				func.print("    升级花费: $100, 当前金币数量: $", variate.dataSaver.money)
			} else if (variate.dataSaver.slip > 1) {
				func.print("    当前脱钩概率: ", variate.dataSaver.slip, "%, 升级后脱钩概率: ", variate.dataSaver.slip - 1, "%");
				func.print("    升级花费: $100, 当前金币数量: $", variate.dataSaver.money)
			} else {
				func.print("    当前脱钩概率: 1%, 升级后脱钩概率: 0%");
				func.print("    升级花费: $500, 当前金币数量: $", variate.dataSaver.money)
			}
		}
		func.print("清洁剂: ");
		func.print("    当前清洁剂个数: ", variate.dataSaver.cleaningBall);
		func.print("    购买花费: $10, 当前金币数量: $", variate.dataSaver.money);
		func.print("清洁效率: ");
		if (variate.dataSaver.cleaningSub >= 10) {
			func.print("    等级已满")
		} else {
			func.print("    当前清洁效率: 一次降低", variate.dataSaver.cleaningSub, "级, 升级后清洁效率: 一次降低", variate.dataSaver.cleaningSub + 1, "级");
			func.print("    购买花费: $30, 当前金币数量: $", variate.dataSaver.money)
		}
		func.print("水族馆容量: ");
		if (variate.dataSaver.aqCnt >= 30) {
			func.print("    等级已满")
		} else {
			func.print("    当前水族馆容量: ", variate.dataSaver.aqCnt, "只, 升级后水族馆容量: ", variate.dataSaver.aqCnt + 2, "只");
			func.print("    购买花费: $", (variate.dataSaver.aqCnt + 2) * 100, ", 当前金币数量: $", variate.dataSaver.money)
		}
		func.print("烤箱数量: ");
		if (variate.dataSaver.roast >= 3) {
			func.print("    数量已满")
		} else {
			func.print("    当前烤箱数量: ", variate.dataSaver.roast);
			if (variate.dataSaver.roast < 1) {
				func.print("    购买花费: $50, 当前金币数量: $", variate.dataSaver.money)
			} else if (variate.dataSaver.roast === 1) {
				func.print("    购买花费: $1000, 当前金币数量: $", variate.dataSaver.money)
			} else {
				func.print("    购买花费: $2000, 当前金币数量: $", variate.dataSaver.money)
			}
		}
		while (true) {
			let type = await func.getch();
			if (type === "1") {
				if (variate.dataSaver.level === variate.maxLevel) {
					func.print("等级已满");
					await func.sleep(.5);
					break
				} else if (variate.dataSaver.money < variate.cost[variate.dataSaver.level + 1]) {
					func.print("金币不足");
					await func.sleep(.5);
					break
				} else {
					variate.dataSaver.money -= variate.cost[++variate.dataSaver.level];
					func.print("购买成功");
					await func.sleep(.5);
					break
				}
			} else if (type === "2") {
				if (variate.dataSaver.getLevel === variate.maxLevel2) {
					func.print("等级已满");
					await func.sleep(.5);
					break
				} else if (variate.dataSaver.money < variate.cost2[variate.dataSaver.getLevel + 1]) {
					func.print("金币不足");
					await func.sleep(.5);
					break
				} else {
					variate.dataSaver.money -= variate.cost2[++variate.dataSaver.getLevel];
					func.print("购买成功");
					await func.sleep(.5);
					break
				}
			} else if (type === "3") {
				if (variate.dataSaver.slip === 0) {
					func.print("等级已满");
					await func.sleep(.5);
					break
				} else if (variate.dataSaver.slip === 1) {
					if (variate.dataSaver.money < 500) {
						func.print("金币不足");
						await func.sleep(.5);
						break
					} else {
						variate.dataSaver.money -= 500;
						variate.dataSaver.slip = 0;
						func.print("购买成功");
						await func.sleep(.5);
						break
					}
				} else {
					if (variate.dataSaver.money < 100) {
						func.print("金币不足");
						await func.sleep(.5);
						break
					} else {
						variate.dataSaver.money -= 100;
						if (variate.dataSaver.slip > 10) {
							variate.dataSaver.slip -= 10
						} else if (variate.dataSaver.slip > 5) {
							variate.dataSaver.slip = 5
						} else if (variate.dataSaver.slip > 0) {
							variate.dataSaver.slip -= 1
						}
						func.print("购买成功");
						await func.sleep(.5);
						break
					}
				}
			} else if (type === "4") {
				if (variate.dataSaver.money < 10) {
					func.print("金币不足");
					await func.sleep(.5);
					break
				} else {
					variate.dataSaver.cleaningBall++;
					func.print("购买成功");
					variate.dataSaver.money -= 10;
					break
				}
			} else if (type === "5") {
				if (variate.dataSaver.cleaningSub === 10) {
					func.print("等级已满");
					await func.sleep(.5);
					break
				} else if (variate.dataSaver.money < 30) {
					func.print("金币不足");
					await func.sleep(.5);
					break
				} else {
					variate.dataSaver.money -= 30;
					variate.dataSaver.cleaningSub++;
					func.print("购买成功");
					await func.sleep(.5);
					break
				}
			} else if (type === "6") {
				if (variate.dataSaver.aqCnt === 30) {
					func.print("等级已满");
					await func.sleep(.5);
					break
				} else if (variate.dataSaver.money < (variate.dataSaver.aqCnt + 2) * 100) {
					func.print("金币不足");
					await func.sleep(.5);
					break
				} else {
					variate.dataSaver.money -= (variate.dataSaver.aqCnt + 2) * 100;
					variate.dataSaver.aqCnt += 2;
					func.print("购买成功");
					await func.sleep(.5);
					break
				}
			} else if (type === "7") {
				if (variate.dataSaver.roast >= 3) {
					func.print("    数量已满");
					await func.sleep(.5);
					break
				} else {
					if (variate.dataSaver.roast < 1) {
						if (variate.dataSaver.money < 50) {
							func.print("金币不足");
							await func.sleep(.5);
							break
						} else {
							variate.dataSaver.money -= 50;
							variate.dataSaver.roast = 1;
							func.print("购买成功");
							await func.sleep(.5);
							break
						}
					} else if (variate.dataSaver.roast === 1) {
						if (variate.dataSaver.money < 1e3) {
							func.print("金币不足");
							await func.sleep(.5);
							break
						} else {
							variate.dataSaver.money -= 1e3;
							variate.dataSaver.roast = 2;
							func.print("购买成功");
							await func.sleep(.5);
							break
						}
					} else {
						if (variate.dataSaver.money < 2e3) {
							func.print("金币不足");
							await func.sleep(.5);
							break
						} else {
							variate.dataSaver.money -= 2e3;
							variate.dataSaver.roast = 3;
							func.print("购买成功");
							await func.sleep(.5);
							break
						}
					}
				}
			} else if (type === "8") {
				return
			}
		}
	}
}
async function shop1 () {
	while (true) {
		func.clear();
		await func.printa("这里是超级商店, 可以买一些特殊的商品。");
		func.clear();
		func.print("1.甩杆倍速, 2.升级大鱼概率, 3.返回。");
		func.print("甩杆倍速: ");
		if (variate.dataSaver.stime >= 10) {
			func.print("    等级已满")
		} else {
			func.print("    当前倍速: ", variate.dataSaver.stime, "倍, 升级后游戏倍速: ", variate.dataSaver.stime + 1, "倍");
			func.print("    升级花费: $1000, 当前金币数量: $", variate.dataSaver.money)
		}
		func.print("大鱼概率: ");
		if (variate.dataSaver.bf >= 60) {
			func.print("    等级已满")
		} else {
			func.print("    当前大鱼概率: ", variate.dataSaver.bf, "%, 升级后大鱼概率", variate.dataSaver.bf + 5, "%");
			func.print("    升级花费: $1000, 当前金币数量: $", variate.dataSaver.money)
		}
		while (true) {
			let type = await func.getch();
			if (type === "1") {
				if (variate.dataSaver.stime >= 10) {
					func.print("等级已满");
					await func.sleep(.5);
					break
				} else if (variate.dataSaver.money < 1e3) {
					func.print("金币不足");
					await func.sleep(.5);
					break
				} else {
					variate.dataSaver.money -= 1e3;
					variate.dataSaver.stime++;
					func.print("购买成功");
					await func.sleep(.5);
					break
				}
			} else if (type === "2") {
				if (variate.dataSaver.bf >= 60) {
					func.print("等级已满");
					await func.sleep(.5);
					break
				} else if (variate.dataSaver.money < 1e3) {
					func.print("金币不足");
					await func.sleep(.5);
					break
				} else {
					variate.dataSaver.money -= 1e3;
					variate.dataSaver.bf += 5;
					func.print("购买成功");
					await func.sleep(.5);
					break
				}
			} else if (type === "3") {
				await func.sleep(.5);
				return
			}
		}
	}
}
export default async function () {
	while (true) {
		func.clear();
		func.print("1.普通商店, 2.超级商店, 3.退出。");
		let type;
		while (true) {
			type = await func.getch();
			if (type === "1") {
				await shop0();
				break
			} else if (type === "2") {
				await shop1();
				break
			} else if (type === "3") {
				return
			}
		}
	}
}
