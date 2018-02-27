//Includes
const redis = require('redis');
const client = redis.createClient();
let async = require('async');

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

function checkUser(username)
{
  client.hgetall(username, (err, found) =>
  {
    if (err) console.log("Error: checkUser: not found " + err);
    if (found) return true;
    else return false;
  });
}

function checkField(req, name)
{
  if('accountKey' in req && name in req.accountKey) 
    return req.accountKey[name];
  return null;
}

function getObjectFromInitialKey(t1Key, callback)
{
  client.hgetall(t1Key, (err, key) =>
  {
    if (key && key.accountKey)
    {
      client.hgetall(key.accountKey, (err, object) =>
      {
        if (err)
          console.log("HGetAll from initial key failed");
        callback(err, object);
      });
    }
    else
      callback('error', null);
  });
}

//This function looks for a user, given a username in the database.
//If one is present, returns it.
module.exports.get = function(username, callback)
{
  getObjectFromInitialKey(username, (err, user) => {
    if (err) console.log("Error: in user.get: " + err);
    callback(err, user);
  });
}

//This function creates a user
module.exports.add = function(username, password, avatar, callback)
{
    //Generate an id
    let id = crypto.randomBytes(idSize).toString("hex");
    //Create the user account object
    let userAccount = new UserAccount(username, password, id, avatar);
    
    //Add the username to the directory, using the id as a key.
    
    let key = username + id;
    client.hmset(username, {accountKey: key}, (err, obj) => {
      if (err) console.log("error in addUser(name): " + err);
    });
    client.hmset(id, {accountKey: key}, (err, obj) => {
      if (err) console.log("error in addUser(id): " + err);
    });
    client.hmset(key, userAccount, (err, obj) =>
    {
      if (err) console.log("error in addUser(object): " + err);
      callback(err, userAccount);
    });
}

module.exports.updateUser = function(username, password, id, avatar, callback)
{
    let userAccount = new UserAccount(username, password, id, avatar);
    
    let key = username + id;
    client.hmset(key, userAccount, (err, obj) =>
    {
      if (err) console.log("error in updateUser: " + err);
      callback(err, userAccount);
    });
}

