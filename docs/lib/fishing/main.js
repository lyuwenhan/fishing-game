import variate from "./variate.js";
import func from "./func.js";
import checkpoint from "./checkpoint.js";
import parkour from "./parkour.js";
import spin from "./spin.js";
import shop from "./shop.js";
import beat from "./beat.js";
import fishing from "./fishing.js";
async function main () {
	func.clear();
	await func.printaev("2136年, 全球冰山融化了", "海平面上升了许多", "大部分城市被海平面淹没了", "你待在一个小岛上, 等待救援", "你每天只能钓鱼度日");
	while(!await checkpoint.login()){
		await func.sleep(.5);
	}
	await checkpoint.save();
	await func.sleep(.5);
	while (true) {
		func.clear();
		func.print("1.开始钓鱼, 2.进入商店, 3.抽奖, 4.挑战, 5.退出, 其他输入无效。");
		while (true) {
			const type = await func.getch();
			if (type === "1") {
				await fishing();
				break
			} else if (type === "2") {
				await shop();
				break
			} else if (type === "3") {
				await spin();
				break
			} else if (type === "4") {
				if (variate.dataSaver.tryLevel === 0) {
					await parkour()
				} else if (variate.dataSaver.tryLevel === 1) {
					await beat()
				} else {
					func.clear();
					await func.printa("已完成挑战")
				}
				break
			} else if (type === "5") {
				func.clear();
				return;
			}
		}
		await checkpoint.save();
		await func.sleep(.5)
	}
}
export default main;
