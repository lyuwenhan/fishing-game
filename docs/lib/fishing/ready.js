import main from "./main.js";
import func from "./func.js";
export function resize (cols, rows) {
	func.consoleSize = {
		cols,
		rows
	}
}
export const setup = main;
export const IOs = func.IOs;
