import variate from "./variate.js";
import func from "./func.js";
export default async function () {
	while (true) {
		func.clear();
		func.print("1.转盘, 2.退出");
		func.print("转盘消耗: 100累积钓鱼数量+1000金币 当前钓鱼数量: ", variate.dataSaver.cnt, " 当前金币数量: ", variate.dataSaver.money);
		func.print("愚人节彩蛋: 20%");
		func.print("大鱼诱饵: 20%");
		func.print("钻石鱼: 1%");
		while (true) {
			const c = await func.getch();
			if (c === "1") {
				if (variate.dataSaver.cnt < 100 && variate.dataSaver.money < 1e3) {
					func.print("获得成就: 江湖骗子");
					await func.sleep(.5);
					break
				}
				if (variate.dataSaver.cnt < 100) {
					func.print("获得成就: 缺斤少两");
					await func.sleep(.5);
					break
				}
				if (variate.dataSaver.money < 1e3) {
					func.print("获得成就: 老赖");
					await func.sleep(.5);
					break
				}
				variate.dataSaver.cnt -= 100;
				variate.dataSaver.money -= 1e3;
				const ran = func.random(1, 100);
				if (ran <= 20) {
					func.print("获得愚人节彩蛋*1");
					func.print("获得成就: 鱼人节快乐");
					variate.fishMan = true
				} else if (ran <= 40) {
					func.print("大鱼诱饵*1");
					variate.big++
				} else if (ran <= 41) {
					func.print("钻石鱼*1");
					func.print("获得成就: 传说中的鱼");
					variate.diamond++
				} else {
					func.print("谢谢惠顾")
				}
				await func.sleep(.5);
				break
			} else if (c === "2") {
				return
			}
		}
	}
}
