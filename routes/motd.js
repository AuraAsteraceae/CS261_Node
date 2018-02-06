function getMotd(req, res)
{
	let response =
	{
		status: 'success',
		data:
		{
			lastModified: new Date().toISOString(),
			motd: 'We have nothing to say right now.'
		}
	}
	
	res.send(JSON.stringify(response));
}

module.exports.register = function(app)
{
	app.get(root + 'get', getMotd);
}
