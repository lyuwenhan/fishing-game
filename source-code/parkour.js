export default function createParkour(functions, lang, data, io) {
	let level = 0;
	let x = 0;
	let y = 0;
	let sx = 1;
	let sy = 0;
	const born = functions.deepFreeze([
		[1, 30],
		[33, 30],
		[66, 30],
		[98, 11],
		[42, 14]
	]);
	const map = Object.freeze(["|     | |   |                                                                                       |", "+---+ +>+   |                                                                                +---   |", "|   | | | +-+          +---+                     --                          -      -      --+   \\  |", "|   | | | |            |   |                    /                                                 | |", "|   | | | |            |   +-------------------+*****Z****Z****Z****Z****Z******Z******Z**********| |", "+^^^+ +^+ +---------+  |   |  finish           +--------------------------------------------------+ |", "|   | | | |         |  |   |     \\             |                                                  | |", "|   | | | |   +---+ |  +---+      \\            |  -   -   -   -   -   -   -   -   -   -   -   -   | |", "|   |   |     |   |        |       \\           |</ \\ / \\ / \\ / \\ / \\ / \\ / \\ / \\ / \\ / \\ / \\ / \\    |", "+^^^+--^+-----+---+--------+--------+-----------+-+-+---+---+---+---+---+---+---+---+---+---+---+---+", "|   |   |     |                                                                                 |...|", "|   |   |     |                                                                                 | |.|", "|   |   |     |                                                      |                          | |.|", "+^^^+ +-+  +--+ +-----     ------             |                   +--+      ---                 | |.|", "|   | | |  |  | |                \\        +---+                   |        |***\\                | |.|", "|   | | |  |  | |                 \\       |             ZZ        |        |****+--   -------     |.|", "|     |    |    |                  \\      |                       |        |*****************\\    |.|", "+^^^--+^---+^^--+^^^^^---+          \\     |******ZZ***********Z***|*****ZZ*|******************\\   |.|", "+-----+----+----+--------+-------+---+----+-----------------+-----+--------+-------------------+--+.|", "|                                |                          |     |                               |.|", "|                                |              ---+--+---- |     |                    +---       |.|", "|                                |                 |  |           |                   /           |.|", "|                                |       -------   |  |           |                  /            |.|", "|                         +----+ |                 |           /| |            -----+     |.......|.|", "|                    -----+    | |                 |  +-------+ | |                       |.......|.|", "|                              | +--------                      | |      +----+           |.......|.|", "|             |                | |                              | |     /      \\          |.......|.|", "|        -----+------          | |                              | |    /        \\         |.......|.|", "|             |                | |        -----+                | |   /          \\        |.......|.|", "|             |                |               |                |    /            \\       |.........|", "+-------------+----------------+---------------+----------------+---+--------------+------+---------|"]);

	function cellAt(rowNumber, colNumber) {
		if (rowNumber < 0 || rowNumber >= map.length) {
			return ""
		}
		const row = map[rowNumber];
		if (!row || colNumber < 0 || colNumber >= row.length) {
			return ""
		}
		return row[colNumber]
	}

	function isAirAbove() {
		return cellAt(y - 1, x) === " "
	}

	function isLavaCell() {
		return cellAt(y, x) === "*"
	}

	function isFinishCell(x2, y2) {
		const c = cellAt(y2 - 1, x2);
		return c === "f" || c === "i" || c === "n" || c === "s" || c === "h"
	}

	function canMoveTo(x2, y2) {
		const c = cellAt(y2 - 1, x2);
		return c === " " || c === "."
	}

	function getSlideDirection(x2, y2) {
		const c = cellAt(y2 - 1, x2);
		return c === "/" ? 1 : c === "\\" ? -1 : 0
	}
	async function show() {
		let a = Math.max(x - 30, 0);
		let b = Math.max(y - 5, 0);
		if (a + 59 > 100) {
			a = 100 - 59
		}
		if (b > 21) {
			b = 21
		}
		for (let i = b; i < b + 10; i++) {
			for (let j = a; j < a + 60; j++) {
				if (i === y - 1 && j === x) {
					await io.write("O")
				} else {
					const mapIJ = cellAt(i, j);
					if (mapIJ === ".") {
						await io.write("\x1b[34;1m \x1b[m")
					} else if (mapIJ === "*") {
						await io.write("\x1b[31;1m*\x1b[m")
					} else if (mapIJ === "Z") {
						await io.write("\x1b[32;1mZ\x1b[m")
					} else if (mapIJ === "^") {
						await io.write("\x1b[33;1m^\x1b[m")
					} else if (mapIJ === ">") {
						await io.write("\x1b[33;1m>\x1b[m")
					} else if (mapIJ === "<") {
						await io.write("\x1b[33;1m<\x1b[m")
					} else if (isFinishCell(j, i + 1)) {
						await io.write("\x1b[33;1m" + mapIJ + "\x1b[m")
					} else {
						await io.write(mapIJ)
					}
				}
			}
			await io.write("\n")
		}
	}

	function tryMove(x2, y2) {
		if (x2 <= 0) {
			return
		}
		if (y2 <= 0) {
			return
		}
		if (y2 > 31) {
			return
		}
		if (x2 >= 100) {
			return
		}
		if (canMoveTo(x2, y2)) {
			x = x2;
			y = y2
		}
	}
	async function run() {
		if (data.gameState.dataSaver.challengeLevel !== 0) {
			return
		}
		x = born[level][0];
		y = born[level][1];
		await io.clear();
		let sinkTimer = 0;
		let jumpCarry = false;
		while (true) {
			if (x <= 0) {
				x = 1
			}
			if (y <= 0) {
				y = 1
			}
			await io.clear();
			if (level + 1 < born.length && x === born[level + 1][0] && y === born[level + 1][1]) {
				level++
			}
			if (isAirAbove()) {
				sinkTimer = 0;
				await io.write(lang.current.parkour.jumpTip + "\n");
				await show();
				let shouldJump = false;
				let shouldRespawn = false;
				for (const c of io.getch2s()) {
					if (c === "") {
						return
					}
					if (c === "w" || c === " ") {
						shouldJump = true;
						jumpCarry = true
					}
					if (c === "r") {
						shouldRespawn = true
					}
				}
				if (isFinishCell(x, y - 1)) {
					await io.clear();
					await io.printa(lang.current.parkour.challengeCompleteReward);
					data.gameState.dataSaver.money += 500;
					data.gameState.dataSaver.challengeLevel = 1;
					return
				}
				if (isLavaCell()) {
					await io.print(lang.current.parkour.deathMessage);
					if (!await io.printYn(lang.current.parkour.respawnConfirm)) {
						return
					}
					x = born[level][0];
					y = born[level][1];
					continue
				}
				if (shouldRespawn) {
					x = born[level][0];
					y = born[level][1];
					continue
				}
				const mapXY = cellAt(y, x);
				if (mapXY === "^") {
					sy = 0;
					tryMove(x, y - 4);
					await functions.sleep(.1);
					continue
				}
				if (mapXY === ">") {
					sy = 0;
					tryMove(x + 4, y);
					await functions.sleep(.1);
					continue
				}
				if (mapXY === "<") {
					sy = 0;
					tryMove(x - 4, y);
					await functions.sleep(.1);
					continue
				}
				if (mapXY === "Z") {
					sy = 3
				}
				for (let i = 1; i <= sy; i++) {
					tryMove(x, y - 1);
					if (!isAirAbove()) {
						sy = 0;
						continue
					}
				}
				if (canMoveTo(x, y + 1)) {
					sy--
				} else {
					sy = 0
				}
				if (sy) {
					for (let i = 1; i <= sy; i++) {
						tryMove(x, y - 1);
						if (!isAirAbove()) {
							sy = 0;
							continue
						}
					}
					for (let i = 1; i <= -sy; i++) {
						tryMove(x, y + 1);
						if (!isAirAbove()) {
							sy = 0;
							continue
						}
					}
				}
				if (!canMoveTo(x + sx, y)) {
					if (sx === getSlideDirection(x + sx, y) && canMoveTo(x + sx, y - 1) || getSlideDirection(x, y + 1) !== 0) {
						tryMove(x, y - 1);
						if (!isAirAbove()) {
							sy = 0;
							continue
						}
					} else {
						sx *= -1
					}
				}
				tryMove(x + sx, y);
				if ((shouldJump || jumpCarry) && !sy && !canMoveTo(x, y + 1)) {
					jumpCarry = false;
					sy = 2;
					for (let i = 1; i <= sy; i++) {
						tryMove(x, y - 1);
						if (!isAirAbove()) {
							sy = 0;
							continue
						}
					}
				}
				if (!canMoveTo(x, y + 1)) {
					sy = 0
				}
				await functions.sleep(.1)
			} else {
				jumpCarry = false;
				await io.write(lang.current.parkour.swimTip + "\n");
				await show();
				sinkTimer++;
				sinkTimer %= 5;
				let moveUp = false;
				let moveDown = false;
				let moveLeft = false;
				let moveRight = false;
				let shouldRespawn = false;
				for (const c of io.getch2s()) {
					if (c === "") {
						return
					}
					if (c === "r") {
						shouldRespawn = true
					}
					if (c === "w") {
						moveUp = true
					}
					if (c === "a") {
						moveLeft = true
					}
					if (c === "s") {
						moveDown = true
					}
					if (c === "d") {
						moveRight = true
					}
				}
				if (isLavaCell()) {
					await io.print(lang.current.parkour.deathMessage);
					if (!await io.printYn(lang.current.parkour.respawnConfirm)) {
						return
					}
					x = born[level][0];
					y = born[level][1];
					continue
				}
				if (shouldRespawn) {
					x = born[level][0];
					y = born[level][1];
					continue
				}
				if (moveUp && !moveDown) {
					tryMove(x, y - 1)
				}
				if (moveDown && !moveUp) {
					tryMove(x, y + 1)
				}
				if (!moveUp && !moveDown && !sinkTimer) {
					tryMove(x, y + 1)
				}
				if (moveLeft && !moveRight) {
					tryMove(x - 1, y)
				}
				if (!moveLeft && moveRight) {
					tryMove(x + 1, y)
				}
				await functions.sleep(.1)
			}
		}
	}
	return run
}
