//Logger
const util = require('util');
let isLogging = true;
//For strings
function log(message)
{
	if (isLogging)
	{
		console.log(message);
	}
}

//For objects
function logObject(object)
{
	if (isLogging)
	{
		console.log(util.inspect(object, showHidden=false, depth=2, colorize=true)));
	}
}

module.exports.log = function(string)
{
	//I dunno how to export lol
}
