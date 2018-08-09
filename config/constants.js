const ROUTES = {
	INDEX: "/",
	EXISTS: "/exists",
	UPDATE: "/update",
	UPDATE_TOKEN: "/update/token",
	UPDATE_COORDINATES: "/update/coordinates",
	FIND_NEARBY_USERS: "/nearbyUsers",
	GET_ALL_USERS: "/allUsers",
	LOGIN: "/login",
	REGISTER: "/register",
	SHUTDOWN: "/shutdown",
	TURNON: "/turnon",
	CHANGE_PASSWORD: "/changepwd",
};

// const VIEWS = {
//     LOGIN: "login",
//     INDEX: "index"
// };

const COLLECTION = {
	STATUS: "status",
	USER: "user",
};

const CONSTANTS = {
	ROUTES: ROUTES,
	// VIEWS: VIEWS,
	COLLECTION: COLLECTION
};

module.exports = CONSTANTS;
