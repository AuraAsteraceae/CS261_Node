//ID Generation
let crypto = require("crypto");
let idSize = 8;

//User account definition
class UserAccount
{
	constructor(username, password, id, avatar)
	{
		this.username = username;
		this.password = password;
		this.id = id;
		this.avatar = avatar;
	}
}

//This defines an empty array object which will take ANY data type.
let userAccountStorage = {};
let userAccountID = {};

function checkUser(username)
{
	let found = userAccountStorage[username];
	if (found)
	{
		return true;
	}
	else
	{
		return false;
	}
}

//This function looks for a user, given a username in the database.
//If one is present, returns it.
module.exports.get = function(username)
{
	let found = userAccountStorage[username];
	if (found)
	{
		//console.log("Get: Found a user: " + username);
		return found;
	}
	else
	{
		//console.log("Get: User not found: " + username);
		return null;
	}
}

module.exports.getByID = function(uID)
{
	let found = userAccountID[uID];
	if (found)
	{
		//console.log("Get: Found an ID: " + uID);
		return found;
	}
	else
	{
		//console.log("Get: ID not found: " + uID);
		return null;
	}
}

//This function creates a user
module.exports.add = function(username, password, avatar, callback)
{
	console.log("Add: Checking user " + username);
	if (!checkUser(username))
	{
		//console.log("Add: Creating user " + username);
		//Generate an id
		let id = crypto.randomBytes(idSize).toString("hex");
		//Create the user account object
		let userAccount = new UserAccount(username, password, id, avatar);
		//Add the username to the directory, using the id as a key.
		userAccountStorage[username] = userAccount;
		userAccountID[id] = userAccount;
		//This will call back to the function.
		process.nextTick( () => {callback(userAccountStorage[username]); } );
	}
	else
		console.log("User " + username + "exists.");
}

