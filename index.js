//Includes
let express = require('express');
let routes = require('./routes/routes.js');

//Fields
let port = 8124;

//Initialize the web server (with express)
let app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

//Import all routes
routes.register(app);

//Have the server listen on the specified port
app.listen(port);


//const http = require('http');
//
//const server = http.createServer( (request, response) => {
//  if(request.url === '/')
//  {
//    response.end("Hello World! You are caller number " + hits);
//    hits = hits + 1;
//  }
//  else
//  {
//    response.end();
//  }
//});

//server.listen(8124);
console.log("Listening!");
