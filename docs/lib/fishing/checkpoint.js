import variate from "./variate.js";
import func from "./func.js";
import storage from "./storage.js"

function decode (data) {
	variate.dataSaver = {
		...variate.svariate(),
		...data ?? {}
	}
}

async function save () {
	await storage.setUser(variate.username, variate.pwd, variate.dataSaver)
}
async function login () {
	let username, pwd, pwd2;
	func.clear();
	func.print("登录");
	func.printnl("用户名: ");
	username = await func.getname(1);
	if (!func.checkName(username)) {
		func.print("用户名不合法");
		return false
	}
	func.printnl("密码: ");
	pwd = await func.getline(2);
	if (await storage.checkUser(username)) {
		variate.username = username;
		variate.pwd = pwd;
		func.clear();
		decode(await storage.getUser(username, pwd));
		func.print("登录成功")
	} else {
		func.printnl("请确认密码: ");
		pwd2 = await func.getline(2);
		if (pwd !== pwd2) {
			func.print("两次密码不一致");
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
