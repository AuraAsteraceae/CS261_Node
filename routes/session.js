let crypto = require("crypto");
let tokenSize = 6;

class Session
{
	constructor(id, token, time)
	{
		this.id = id;
		this.token = token;
		this.time = time;
	}
}

let activeSessions = {};

function startSession(id, callback)
{
	//console.log("StartSession Start");
	//if (!findSession(id))
	//{
		let sessionID = crypto.randomBytes(tokenSize).toString("hex");
		let token = crypto.randomBytes(tokenSize).toString("hex");
		//Implement this properly later.
		//let date = new Date();
		let time = 0;
		let session = new Session(sessionID, token, time);
		activeSessions[id] = session;
		console.log("StartSession Callback");
		process.nextTick( () => {callback(activeSessions[id]); } );
	//}
	//else
	//{
		//Session already exists but make a new one cuz dumb.
		
	//}
	//console.log("StartSession End");
}

function endSession(id, callback)
{
	//console.log("EndSession Start");
	let session = findSession(id);

	if (session)
	{
		//Get time
		//let currDate = Date();
		//let currTime = currDate.getSeconds();
		let duration = 0;//currTime - session.time;//GetCurrTime
		
		delete activeSessions[id];
		activeSessions[id] = null;
		console.log("EndSession Callback");
		process.nextTick( () => {callback(duration); } );
	}
	//console.log("EndSession End");
}

function findSession(id)
{
	//console.log("FindSession Start");
	let found = activeSessions[id];
	if (found)
	{
		//console.log("FindSession Success");
		return activeSessions[id];
	}
	else
	{
		//console.log("FindSession Fail");
		return null;
	}
}

module.exports.start = startSession;
module.exports.end = endSession;
module.exports.find = findSession;
