//Includes
//let express = require('express');
let routes = require('./routes/routes.js');

let cache = require('./utils/cache');
let redis = require('redis');
let client = redis.createClient(); //creates a new client.

//For assignment 4
require('dotenv').config();
let httpPort    = process.env.NODE_PORT;
let logLevel    = process.env.NODE_LOG_LEVEL;
let udpPort     = process.env.UDP_PORT;

//Stupid env never works
httpPort = 80; //Arbitrary value
logLevel = 0;
udpPort = 8128;

const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const jsonUtils = require('./utils/json');
const users = require('./routes/users');
const replication = require('./replicationServer/dumbClientReplication');

const app = express();

app.use(logger(logLevel));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(jsonUtils.requestMiddleware);
app.use(jsonUtils.responseMiddleware);

cache.connect({
  'host': "127.0.0.1",
  'port': "6379"
  },
  (err) => {
   Console.log("Error: Connection error.")
  }
);

//Fields
let port = 8123;

//Initialize the web server (with express)
//let app = express();

//const bodyParser = require('body-parser');
app.use(bodyParser.json());

//Import all routes
routes.register(app);

//Have the server listen on the specified port
app.listen(port);

const httpServer = app.listen(httpPort, (err) => {
  console.log("Node app " + __filename + " is listening on HTTP port " + httpPort + "!");
});

const udpServer = replication.listen(udpPort, (err) => {
    console.log("Node app " + __filename + " is listening on UDP port " + udpPort + "!");
});

module.exports = app;


//server.listen(8124);
console.log("Listening!");
