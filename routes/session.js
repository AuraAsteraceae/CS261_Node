//Includes
const redis = require('redis');
const client = redis.createClient();

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

//let activeSessions = {};

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
    //activeSessions[id] = session;
    client.hmset(id, session, (err, obj) =>
    {
      if (err) console.log("error in startSession: " + err);
      console.log("StartSession Callback");
      process.nextTick( () => { callback(session); } );
    });
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
  findSession(id, (err, session) =>
  {
    if (err) console.log("error in endSession: " + err);
    if (session)
    {
      //Get time
      //let currDate = Date();
      //let currTime = currDate.getSeconds();
      let duration = 0;//currTime - session.time;//GetCurrTime
      //TODO: Delete but we don't need to atm.
      //delete session;
      //client.hdel(id, function(err) {} );
      console.log("EndSession Callback");
      process.nextTick( () => {callback(duration); } );
    }
  });
  //console.log("EndSession End");
}

function findSession(id, callback)
{
  //console.log("FindSession Start");
  //let found = activeSessions[id];
  client.hgetall(id, (err, object) =>
  {
    if (err) console.log("error in findSession: " + err);
    callback(object);
  });
}

module.exports.start = startSession;
module.exports.end = endSession;
module.exports.find = findSession;
