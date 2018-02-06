let userAccounts = require('./../models/user.js');
let userSessions = require('./session.js');

//Helper function to check whether a given property is valid or not.
function isValid(property)
{
	if (typeof property !== 'undefined' && property)
		return true;
	return false;
}

function checkField(req, name)
{
	if('query' in req && name in req.query) 
		return req.query[name];
	if('body' in req && name in req.body)
		return req.body[name];
	if('params' in req && name in req.params)
		return req.params[name];
	return null;
}
//query, body, params.

function createUser(req, res)
{
	let username = checkField(req, 'username');
	let password = checkField(req, 'password');
	let avatar = checkField(req, 'avatar');
	
	//1. Validate input
	if (!isValid(username))
	{
		//log.message("No username was given");
		let response =
		{
			"status": "failure",
			"reason":
			{
				"username" : "No username given."
			}
		}
		res.send(JSON.stringify(response));
	}
	else if (!isValid(password))
	{
		//log.message("No password was given");
		let response =
		{
			"status": "failure",
			"reason":
			{
				"password" : "No password given."
			}
		}
		res.send(JSON.stringify(response));
	}
	
	//2. Create account here
	else
	{
		//Add user to database.
		let obj = userAccounts.get(username);
		if (!obj)
		{
			//console.log("Attempt to create user");
			userAccounts.add(username, password, avatar, function(userData)
			{
				let response =
				{
					"status": "success",
					"data":
					{
						"id" : userData.id,
						"username" : userData.username
					}
				}
				res.send(JSON.stringify(response));
			});
		}
		else
		{
			let response =
			{
				"status": "fail",
				"reason": 
				{
					"username": "Already taken"
				}
			}
			res.send(JSON.stringify(response));
		}
		//console.log("User created: " + username);
		return;
	}

	//console.log("Create User failed");
}

function loginUser(req, res)
{
	let username = checkField(req, 'username');
	let password = checkField(req, 'password');
	
	//console.log("Login Attempted: " + username);
	
	let existingUser = userAccounts.get(username);

	if (!existingUser)
	{
		//console.log("Session failed with: " + username + " User did not exist");
		let response =
		{
			"status": "fail",
			"reason": "Username/password mismatch"
		}
		res.send(JSON.stringify(response));
	}
	else if (existingUser.password !== password)
	{
		//console.log("Session failed with: " + username + " Wrong password");
		//console.log(existingUser.password + ", passed in: " + password);
		let response =
		{
			"status": "fail",
			"reason": "Username/password mismatch"
		}
		res.send(JSON.stringify(response));
	}
	else
	{
		//console.log("Session start attempt with: " + username);
		userSessions.start(existingUser.id, function(newSession)
		{
			console.log("Session started with: " + username);
			
			let response =
			{
				"status": "success",
				"data":
				{
					"id": existingUser.id,
					"session": newSession.id,
					"token": newSession.token
				}
			}
			res.send(JSON.stringify(response));
		});
	}
	//console.log("Login user function exited.");
}

function logoutUser(req, res, next)
{
	//console.log("Logout user function entered.");
	let session = checkField(req, '_session');
	let token = checkField(req, '_token');
	
	if (!isValid(session) || !isValid(token))
	{
		//console.log("Invalid parameters");
		
		let response =
		{
			"status": "fail",
			"reason": "Invalid session/token"
		}
		res.send(JSON.stringify(response));
	}
	
	let existingSession = userSessions.find(session);

	if (!existingSession)
	{
		//console.log("Session doesn't exist");
		//Session does not exist
		let response =
		{
			"status": "fail",
			"reason": "Error: Session does not exist"
		}
		res.send(JSON.stringify(response));
	}

	else
	{
		if (existingSession.token === token)
		{
			userSessions.end(session, function(duration)
			{
				//console.log("Successful logout");
				let response =
				{
					"status": "success",
					"duration": duration,
					"reason": "The user has logged out successfully!"
				}
				res.send(JSON.stringify(response));
				
				next();
			});
		}
		else
		{
			let response =
			{
				"status": "fail",
				"reason": "Error: Session does not exist"
			}
			res.send(JSON.stringify(response));
		}
	}
	//console.log("Logout user function exited.");
}

function getUser(req, res, next)
{
	let id = checkField(req, 'id');

	if (!isValid(id))
	{
		let response =
		{
			"status": "fail",
			"reason":
			{
				"id": "User does not exist."
			}
		}
		res.send(JSON.stringify(response));
	}
	else
	{
		let user = userAccounts.getByID(id);
		if (user)
		{
			let response =
			{
				"status": "success",
				"data":
				{
					"id": user.id,
					"username": user.username,
					"avatar": user.avatar
				}
			}
			res.send(JSON.stringify(response));
			
			next();
		}
		else
		{
			let response =
			{
				"status": "fail",
				"reason": "Error: user does not exist."
			}
			res.send(JSON.stringify(response));
		}
	}
}

function findUser(req, res, next)
{
	//console.log("FindUser Entered.");
	let username = checkField(req, 'username');
	
	console.log("CheckField returned: " + username);
	if (!isValid(username))
	{
		console.log("Invalid params.");
		let response =
		{
			"status": "fail",
			"reason": "Error: Invalid parameter."
		}
		res.send(JSON.stringify(response));
	}
	else
	{
		let user = userAccounts.get(username);
		if (user)
		{
			let response =
			{
				"status": "success",
				"data":
				{
					"id": user.id,
					"username": user.username,
					"avatar": user.avatar
				}
			}
			res.send(JSON.stringify(response));
			
			next();
		}
		else
		{
			let response =
			{
				"status": "fail",
				"reason": "Error: user does not exist."
			}
			res.send(JSON.stringify(response));
		}
	}
	//console.log("FindUser Exited.");
}

function updateUser(req, res, next)
{
	//console.log("UpdateUser Entered.");
	let id = checkField(req, 'id');
	let oldPassword = checkField(req, 'oldPassword');
	let newPassword = checkField(req, 'newPassword');
	let avatar = checkField(req, 'avatar');
	//user -> id
	//session -> token && session
	let user = userAccounts.getById(id);
	if (!user)
	{
		let response =
		{
			"status": "fail",
			"id": "Forbidden"
		}
		res.send(JSON.stringify(response));
	}
	else
	{
		let session = userSessions.find(id);
		if (!session)
		{
			let response =
			{
				"status": "fail",
				"id": "Forbidden"
			}
			res.send(JSON.stringify(response));
		}
		else
		{
			if (oldPassword)
			{
				if (oldPassword === user.password)
				{
					user.password = newPassword;
					let response =
					{
						"status": "success",
						"passwordChanged": true
					}
					if (avatar)
					{
						user.avatar = avatar;
						response.avatar = avatar;
					}
					res.send(JSON.stringify(response));
				}
			}
			else if (avatar)
			{
				user.avatar = avatar;
				let response =
				{
					"status": "success",
					"passwordChanged": false,
					"avatar": avatar
				}
				res.send(JSON.stringify(response));
			}
			else
			{
				let response =
				{
					"status": "success",
					"passwordChanged": false,
					"avatar": avatar
				}
				res.send(JSON.stringify(response));
			}
		}
	}
	
	//console.log("UpdateUser Exited.");
}

module.exports.register = function(app, root)
{
	app.post(root + 'create', createUser);
	app.get(root + 'login', loginUser);
	app.get(root + 'logout', logoutUser);
	app.get(root + ':id/get', getUser);
	app.get(root + 'find/:username', findUser);
	app.post(root + ':id/update', updateUser);
}
