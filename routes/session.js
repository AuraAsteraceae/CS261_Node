//Includes
const redis = require('redis');
const client = redis.createClient();
const mysql = require('mysql');

let crypto = require("crypto");
let tokenSize = 6;

class Session
{
  constructor(id, token)//, time)
  {
    this.id = id;
    this.token = token;
    //this.time = time;
  }
}

//MySQL Stuff
//Hide this away somehow.
let dbusername = "cs261-app";
let dbuserpass = "CS261-DBUser";
let dbip = "172.31.22.157"; //Private ip?

let connection = mysql.createConnection(
{
  host: dbip,
  user: dbusername,
  password: dbuserpass
});

connection.connect();

connection.query('USE masterroids');

//let activeSessions = {};

function startSession(id, callback)
{
  //console.log("StartSession Start");
  //if (!findSession(id))
  //{
    let sessionID = crypto.randomBytes(tokenSize).toString("hex");
    let token = crypto.randomBytes(tokenSize).toString("hex");
    
    let session = new Session(sessionID, token);//, time);
    
    connection.query("INSERT INTO sessions (keyID,id,token) VALUES(\"" + id + "\",\"" + sessionID + "\",\"" + token + "\");", 
    function (err, results, fields)
    {
        if (err)
        {
          console.log("error in startSession: " + err);
        }
        console.log("AddUser: After error check, callback is next");
        process.nextTick( () => { callback(session); } );
    });
    //let time = Date.now();
    
    //activeSessions[id] = session;
    //client.hmset(id, session, (err, obj) =>
    //{
    //  if (err) console.log("error in startSession: " + err);
    //  console.log("StartSession Callback");
    //  process.nextTick( () => { callback(session); } );
    //});
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
      let duration = 0;//(Date.now() - session.time) / 1000;//GetCurrTime
      //client.hdel(id, function(err) {} );
      console.log("EndSession Callback");
      process.nextTick( () => {callback(duration); } );
    }
  });
  //console.log("EndSession End");
}

function findSession(id, callback)
{
  console.log("FindSession Start");
  
  connection.query("SELECT * FROM sessions WHERE keyID=\"" + id + "\";", 
  function (error, results, fields)
  {
    if (error || results.length === 0)
    {
      console.log("findSession failed with: " + error);
    }
    else callback(error, results[0]);
  });
  //client.hgetall(id, (err, object) =>
  //{
  //  if (err) console.log("Error: findSession: " + err);
  //  callback(err, object);
  //});
}

module.exports.start = startSession;
module.exports.end = endSession;
module.exports.find = findSession;
