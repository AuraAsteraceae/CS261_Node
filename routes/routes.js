//Routes
let express = require('express');
let motd = require('./motd.js');
let users = require('./users.js');

//Locals
let hits = 1;
let apiRoot = "/api/v1/";

//Root route
function getRoot(req, res)
{
	res.send("Routes EDITION: Hello! You are caller number " + hits + "!\n");
	hits = hits + 1;
}

//All routes are registered here:
module.exports.register = function(app)
{
	app.get('/', getRoot);
	motd.register(app, apiRoot + "motd/");
	users.register(app, apiRoot + "users/");
	
}
