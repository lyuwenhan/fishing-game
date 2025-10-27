function isObject (obj) {
	return obj && typeof obj === "object" && !Array.isArray(obj)
}

function toObject (obj) {
	return isObject(obj) ? obj : {}
}

function send (content) {
	return fetch(`/api`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			content
		})
	}).then(response => response.json())
}
var store;
try {
	store = toObject(JSON.parse(window.localStorage.getItem("gameStorage")))
} catch {
	store = {}
}
async function getUser (name, password) {
	return send({
		type: "get",
		name,
		password
	})
}
async function checkUser (name) {
	return send({
		type: "check",
		name
	})
}
async function setUser (name, password, data) {
	return send({
		type: "save",
		name,
		password,
		data
	})
}
export default {
	getUser,
	checkUser,
	setUser
};
