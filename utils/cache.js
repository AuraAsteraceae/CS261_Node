let redis = require('redis');

let cache = null;

//Connects to the cache server, making a singleton instance
let connect = function (options, callback)
{
  if (cache)
  {
    return process.nextTick(function()
    {
      callback(null)
    });
  }
  else
  {
    console.log("Connecting to the Redis server at " + options.host + ":"
      + options.port);
    cache = redis.createClient(options.port, options.host);
    cache.on('error', function (err)
    {
      console.log(err);
    });
    cache.on('connect', function()
    {
      console.log("Successfully connected to the Redis server at "
        + options.host + ":" + options.port);
    });
  }
}

module.exports.connect = connect;

