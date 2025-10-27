const maxLevel = 25;
const minTime = [50, 40, 40, 40, 30, 30, 30, 30, 20, 20, 10, 9, 7, 5, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 1, 1];
const maxTime = [100, 100, 90, 80, 80, 70, 60, 50, 50, 40, 40, 40, 40, 40, 40, 35, 30, 25, 20, 10, 5, 4, 4, 3, 3, 2];
const cost = [0, 5, 5, 5, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 150, 200, 200, 200, 300, 350, 400, 500, 600, 700, 700];
const maxLevel2 = 29;
const maxGet = [20, 20, 20, 30, 30, 40, 40, 40, 50, 50, 55, 60, 60, 60, 70, 70, 80, 80, 90, 100, 105, 110, 120, 130, 135, 140, 145, 150, 170, 200];
const minGet = [10, 12, 15, 15, 20, 20, 25, 30, 35, 40, 40, 40, 45, 50, 60, 60, 60, 70, 80, 85, 85, 90, 95, 100, 100, 100, 100, 100, 100, 100];
const cost2 = [0, 20, 20, 20, 30, 40, 50, 60, 70, 80, 80, 80, 80, 90, 100, 150, 200, 200, 200, 300, 350, 400, 500, 600, 700, 700, 700, 700, 700, 700];
var ltime = 0;
var left = 0;
var username = "";
var fishMan = false;
var big = 0;
var diamond = 0;
var aqnow = 0;
var aqother = 0;
var pwd = "";
const svariate = () => ({
	//[0,]
	money: 20,
	//[0,maxLevel]
	level: 0,
	//[0,maxLevel2]`
	getLevel: 0,
	//[0,]
	cnt: 0,
	//[0,100]
	bf: 20,
	//[1,10]
	stime: 1,
	//[0,100]
	slip: 50,
	//[0,]
	cleaningBall: 0,
	//[1,]
	cleaningSub: 1,
	//[0,6]
	gan: 1,
	//[0,]
	aqCnt: 0,
	//[1,3]
	speed: 2,
	//[0,]
	tryLevel: 0,
	//[0,]
	roast: 0,
	//[0,40]
	hungry: 20,
	//[0,]
	aqFishCnt: new Array(7).fill(0),
	fish: Array.from({
		length: 7
	}, () => new Array(2).fill(0)),
	simple: false
});
var dataSaver = svariate();
export default {
	maxLevel,
	minTime,
	maxTime,
	cost,
	maxLevel2,
	maxGet,
	minGet,
	cost2,
	ltime,
	left,
	username,
	fishMan,
	big,
	diamond,
	aqnow,
	aqother,
	pwd,
	svariate,
	dataSaver
};
