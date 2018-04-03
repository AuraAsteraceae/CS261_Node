//Includes
const redis = require('redis');
const client = redis.createClient();

const uuid = require('uuid/v1');
const mysql = require('mysql');
let async = require('async');

//ID Generation
let crypto = require("crypto");
let idSize = 8;

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
    connection.query("SELECT * FROM user WHERE username=\"" + username + "\";", 
    function (error, results, fields)
    {
        if (error) console.log("Error: checkUser: not found " + err);
        if (results.length === 0) return false;
        else return true;
    });
  //client.hgetall(username, (err, found) =>
  //{
  //  if (err) console.log("Error: checkUser: not found " + err);
  //  if (found) return true;
  //  else return false;
  //});
}

function checkField(req, name)
{
  if('accountKey' in req && name in req.accountKey) 
    return req.accountKey[name];
  return null;
}

function getObjectFromInitialKey(t1Key, callback)
{
  connection.query("SELECT * FROM user WHERE username=\"" + t1Key + "\";", 
  function (error, results, fields)
  {
    if (error || results.length === 0)
    {
      console.log("initial key failed username get " + error);
      connection.query("SELECT * FROM user WHERE id=\"" + t1Key + "\";",
      function (aError, aResults, aFields)
      {
        if (aError || aResults.length === 0)
        {
          console.log("initial key failed id get " + error);
          callback('error', null);
        }
        else callback(error, aResults[0]);
      });
    }
    else callback(error, results[0]);
  });
  //client.hgetall(t1Key, (err, key) =>
  //{
  //  if (key && key.accountKey)
  //  {
  //    client.hgetall(key.accountKey, (err, object) =>
  //    {
  //      if (err)
  //        console.log("HGetAll from initial key failed");
  //      callback(err, object);
  //    });
  //  }
  //  else
  //    callback('error', null);
  //});
}

//This function looks for a user, given a username in the database.
//If one is present, returns it.
module.exports.get = function(username, callback)
{
  getObjectFromInitialKey(username, (err, user) => {
    if (err) console.log("Error: in user.get: " + err);
    if (user)
    {
        //console.log("GetUser: " + user.username);
        //console.log("salt: " + user.salt);
        //console.log("hashedpassword: " + user.passwordhash);
        //console.log("id: " + user.id); 
    }
    callback(err, user);
  });
}

//SELECT id, username FROM user WHERE id=4;

//This function creates a user
module.exports.add = function(username, password, avatar, callback)
{
    //Generate an id
    //let id = crypto.randomBytes(idSize).toString("hex");
    let id = uuid();
    //Create the user account object
    let userAccount = new UserAccount(username, password, id, avatar);
    
    let salt = Math.round((Date.now() * Math.random())) + '';
    let hashpassword = crypto.createHash('sha512')
                   .update(salt + password, 'utf8')
                   .digest('hex');
                   
    console.log("AddUser: " + username);
    console.log("salt: " + salt);
    console.log("hashedpassword: " + hashpassword);
    console.log("Alert!: password: " + password);
    
    //Add the username to the directory, using the id as a key.
    console.log("AddUser: right before sql query");
    connection.query("INSERT INTO user (id,username,passwordhash,salt,avatar_url) VALUES(\"" + id + "\",\"" + username + "\",\"" + hashpassword + "\",\"" + salt + "\",\"" + avatar + "\");", 
    function (err, results, fields)
    {
        console.log("AddUser: After sql query");
        if (err)
        {
          console.log("error in AddUser: " + err);
        }
        console.log("AddUser: After error check, callback is next");
        callback(err, userAccount);
    });
    
    //let key = username + id;
    //client.hmset(username, {accountKey: key}, (err, obj) => {
    //  if (err) console.log("error in addUser(name): " + err);
    //});
    //client.hmset(id, {accountKey: key}, (err, obj) => {
    //  if (err) console.log("error in addUser(id): " + err);
    //});
    //client.hmset(key, userAccount, (err, obj) =>
    //{
    //  if (err) console.log("error in addUser(object): " + err);
    //  callback(err, userAccount);
    //});
}

module.exports.updateUser = function(username, password, id, avatar, callback)
{
    let salt = Math.round((Date.now() * Math.random())) + '';
    let hashpassword = crypto.createHash('sha512')
                   .update(salt + password, 'utf8')
                   .digest('hex');
    connection.query("UPDATE `user` SET passwordhash = \"" + hashpassword + "\", salt = \"" + salt + "\", avatar_url = \"" + avatar + "\"WHERE id=\"" + id + "\";",
    function (err, results, fields)
    {
        if (err) console.log("Error in UpdateUser: " + error);
        callback(err, results[0]);
    });
    
    //let userAccount = new UserAccount(username, password, id, avatar);
    
    //let key = username + id;
    //client.hmset(key, userAccount, (err, obj) =>
    //{
    //  if (err) console.log("error in updateUser: " + err);
    //  callback(err, userAccount);
    //});
}

module.exports.updatePassword = function(id, password, callback)
{
    let salt = Math.round((Date.now() * Math.random())) + '';
    let hashpassword = crypto.createHash('sha512')
                   .update(salt + password, 'utf8')
                   .digest('hex');
    connection.query("UPDATE `user` SET passwordhash = \"" + hashpassword + "\", salt = \"" + salt + "\"WHERE id=\"" + id + "\";",
    function (err, results, fields)
    {
        if (err) console.log("Error in UpdateUser: " + error);
        else 
        {
            console.log("updatePassword: Password updated to " + password);
            console.log("updatePassword: hash updated to " + hashpassword);
        }
        callback(err, results[0]);
    });
}

module.exports.updateAvatar = function(id, avatar, callback)
{
    connection.query("UPDATE `user` SET avatar_url = \"" + avatar + "\"WHERE id=\"" + id + "\";",
    function (err, results, fields)
    {
        if (err) console.log("Error in UpdateUser: " + error);
        else 
        {
            console.log("updateAvatar: Avatar updated to " + avatar);
        }
        callback(err, results[0]);
    });
}

