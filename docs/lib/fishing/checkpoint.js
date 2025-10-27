import variate from "./variate.js";
import func from "./func.js";
import storage from "./storage.js";

function decode (data) {
	variate.dataSaver = {
		...variate.svariate(),
		...data ?? {}
	}
}
async function save () {
	const status = await storage.setUser(variate.username, variate.pwd, variate.dataSaver)
	if (status.type !== "successed") {
		await func.printa(status.message ?? status.type);
	}
}
async function login () {
	let username, pwd, pwd2;
	func.clear();
	func.print("登录");
	func.printnl("用户名: ");
	username = await func.getname(1);
	if (!func.checkName(username)) {
		await func.printa("用户名不合法");
		return false
	}
	func.printnl("密码: ");
	pwd = await func.getline(2);
	const isUser = await storage.checkUser(username);
	if (isUser.type !== "successed") {
		await func.printa(isUser.message ?? isUser.type);
		return false
	}
	if (isUser.isValid) {
		variate.username = username;
		variate.pwd = pwd;
		func.clear();
		const userData = await storage.getUser(username, pwd);
		if (userData.type !== "successed") {
			func.printa(userData.message ?? userData.type);
			return false
		}
		decode(userData.data);
		func.print("登录成功")
	} else {
		func.printnl("请确认密码: ");
		pwd2 = await func.getline(2);
		if (pwd !== pwd2) {
			await func.printa("两次密码不一致");
			return false
		}
		variate.pwd = pwd;
		variate.username = username;
		func.clear();
		func.print("注册成功");
		await func.sleep(.5);
		await func.choose()
	}
	return true
}
export default {
	save,
	login
};
