let sessions = require('./../routes/session.js');

function isValidSession(object)
{
	if (object !== undefined)
	{
		if (isValid(object.params)
		{
			if (isValid(object.body))
			{
				return true;
				
			}
			if (isValid(object.query))
			{
				return true;
			}	
		}
	}
	return false;
}

module.exports = function(req, res, next)
{
	let session = req.body._sesion || req.query._session;
	let token = req.body._token || req.query._token;
	
	if (!validate.property(session) || !validate.property(token))
	{
		let response = 
		{
			"status": "fail",
			"reason": "Failed to provide session or token!"
		}
		res.send(JSON.stringify(response));
	}
	else
	{
		//Look up the session value from our session cache.
		sessions.find(session, function(expistingSession)
		{
			//If found, check that the sesion was valid
			if (existingSession)
			{
				//If the token matches
				if (existingSession.token === token)
				{
					next();
				}
				//If the token does not match
				else
				{
				}
			}
			//If not found, send back an error, terminating the response.
			else
			{
				
			}
		});
	}
}

