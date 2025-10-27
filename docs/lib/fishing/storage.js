function isObject (obj) {
	return obj && typeof obj === "object" && !Array.isArray(obj)
}

function toObject (obj) {
	return isObject(obj) ? obj : {}
}

var store;
try {
	store = toObject(JSON.parse(window.localStorage.getItem("gameStorage")))
} catch {
	store = {}
}

async function getUser (username) {
	return toObject(store[username])
}
async function checkUser (username) {
	return Boolean(store[username])
}
async function setUser (username, pwd, saveData) {
	store[username] = saveData;
	window.localStorage.setItem("gameStorage", JSON.stringify(store))
}
export default {
	getUser,
	checkUser,
	setUser
};
