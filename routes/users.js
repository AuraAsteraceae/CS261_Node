let userAccounts = require('./../models/user.js');
let userSessions = require('./session.js');

//Helper function to check whether a given property is valid or not.
function isValid(property)
{
  if (typeof property !== 'undefined' && property)
    return true;
  return false;
}

function checkField(req, name)
{
  if('query' in req && name in req.query) 
    return req.query[name];
  if('body' in req && name in req.body)
    return req.body[name];
  if('params' in req && name in req.params)
    return req.params[name];
  return null;
}
//query, body, params.

function createUser(req, res)
{
  console.log("CreateUser started");
  let username = checkField(req, 'username');
  let password = checkField(req, 'password');
  let avatar = checkField(req, 'avatar');
  console.log("Username: " + username);  

  //1. Validate input
  if (!isValid(username))
  {
    //log.message("No username was given");
    let response =
    {
      "status": "failure",
      "reason":
      {
        "username" : "No username given."
      }
    }
    res.send(JSON.stringify(response));
  }
  else if (!isValid(password))
  {
    //log.message("No password was given");
    let response =
    {
      "status": "failure",
      "reason":
      {
        "password" : "No password given."
      }
    }
    res.send(JSON.stringify(response));
  }
  
  //2. Create account here
  else
  {
    //Add user to database.
    userAccounts.get(username, (err, obj) => {
      if (!obj)
      {
        console.log("Info: Create: Attempt to create user");
        userAccounts.add(username, password, avatar, (err, userData) =>
        {
          if (err) console.log("Error: createUser failed with: " + err);
          else if(userData)
          {
            let response =
            {
              "status": "success",
              "data":
              {
                "id" : userData.id,
                "username" : userData.username
              }
            }
            res.send(JSON.stringify(response));
          }
          else
          {
            //You shouldn't get here.
            console.log("UserAccounts returned a value of: " +userData);
          }
        });
      }
      else
      {
        let response =
        {
          "status": "fail",
          "reason": 
          {
            "username": "Already taken"
          }
        }
        res.send(JSON.stringify(response));
      }
    console.log("Info: Create User exiting"); 
    });
  return;
  }

  console.log("Error: Create User failed");
}

function loginUser(req, res)
{
  let username = checkField(req, 'username');
  let password = checkField(req, 'password');
  
  console.log("Info: Login Attempted: " + username);
  
  userAccounts.get(username, (err, existingUser) => {
    if (err) console.log("Error: error in loginUser: " + err);
    if (!existingUser)
    {
      console.log("Session failed with: " + username + " User did not exist");
      let response =
      {
        "status": "fail",
        "reason": "Username/password mismatch"
      }
      res.send(JSON.stringify(response));
    }
    else if (existingUser.password !== password)
    {
      console.log("Session failed with: " + username + " Wrong password");
      console.log("pass: " + existingUser.password + ", passed in: " + password);
      let response =
      {
        "status": "fail",
        "reason": "Username/password mismatch"
      }
      res.send(JSON.stringify(response));
    }
    else
    {
      console.log("Session start attempt with: " + username);
      userSessions.start(existingUser.id, function(newSession)
      {
        console.log("Session started with: " + username);
        
        let response =
        {
          "status": "success",
          "data":
          {
            "id": existingUser.id,
            "session": newSession.id,
            "token": newSession.token
          }
        }
        res.send(JSON.stringify(response));
        console.log("Info: Login Success");
      });
    }
  
  });
  console.log("Info: Login user function exited.");
}

function logoutUser(req, res, next)
{
  //console.log("Logout user function entered.");
  let session = checkField(req, '_session');
  let token = checkField(req, '_token');
  
  if (!isValid(session) || !isValid(token))
  {
    //console.log("Invalid parameters");
    
    let response =
    {
      "status": "fail",
      "reason": "Invalid session/token"
    }
    res.send(JSON.stringify(response));
  }
  
  let existingSession = userSessions.find(session);

  if (!existingSession)
  {
    //Session does not exist
    let response =
    {
      "status": "fail",
      "reason": "Error: Session does not exist"
    }
    res.send(JSON.stringify(response));
  }

  else
  {
    if (existingSession.token === token)
    {
      userSessions.end(session, function(duration)
      {
        //console.log("Successful logout");
        let response =
        {
          "status": "success",
          "duration": duration,
          "reason": "The user has logged out successfully!"
        }
        res.send(JSON.stringify(response));
        
        next();
      });
    }
    else
    {
      let response =
      {
        "status": "fail",
        "reason": "Error: Session does not exist"
      }
      res.send(JSON.stringify(response));
    }
  }
  //console.log("Logout user function exited.");
}

function getUser(req, res, next)
{
  let id = checkField(req, 'id');

  if (!isValid(id))
  {
    let response =
    {
      "status": "fail",
      "reason":
      {
        "id": "User does not exist."
      }
    }
    res.send(JSON.stringify(response));
  }
  else
  {
    userAccounts.get(id, (err, user) => {
       if (user)
      {
        let response =
        {
          "status": "success",
          "data":
          {
            "id": user.id,
            "username": user.username,
            "avatar": user.avatar
          }
        }
        res.send(JSON.stringify(response));
             
        next();
      }
      else
      {
        let response =
        {
          "status": "fail",
          "reason": "Error: user does not exist."
        }
        res.send(JSON.stringify(response));
      }
    });
  }
}

function findUser(req, res, next)
{
  //console.log("FindUser Entered.");
  let username = checkField(req, 'username');
  
  console.log("CheckField returned: " + username);
  if (!isValid(username))
  {
    console.log("Invalid params.");
    let response =
    {
      "status": "fail",
      "reason": "Error: Invalid parameter."
    }
    res.send(JSON.stringify(response));
  }
  else
  {
    userAccounts.get(username, (err, user) => {
      if (user)
      {
        let response =
        {
          "status": "success",
          "data":
          {
            "id": user.id,
            "username": user.username,
            "avatar": user.avatar
          }
        }
        res.send(JSON.stringify(response));
        
        next();
      }
      else
      {
        let response =
        {
          "status": "fail",
          "reason": "Error: user does not exist."
        }
        res.send(JSON.stringify(response));
      }
    });
  }
  //console.log("FindUser Exited.");
}

function updateUser(req, res, next)
{
  console.log("UpdateUser Entered.");
  let id = checkField(req, 'id');
  let oldPassword = checkField(req, 'oldPassword');
  let newPassword = checkField(req, 'newPassword');
  let avatar = checkField(req, 'avatar');
  //user -> id
  //session -> token && session
  userAccounts.get(id, (err, user) => 
  {
    if (err) console.log("Error: updateUser: userAccounts.get " + err); 
    if (!user)
    {
      let response =
      {
        "status": "fail",
        "reason":
        {
          "id": "Forbidden"
        }
      }
      res.send(JSON.stringify(response));
      console.log("Error: updateUser: no user found");
    }
    else
    {
      userSessions.find(id, (err, session) => 
      {
        if (!session)
        {
          let response =
          {
            "status": "fail",
            "reason":
            {
              "id": "Forbidden"
            }
          }
          res.send(JSON.stringify(response));
          console.log("Error: updateUser: no session found");
        }
        else
        {
          if (oldPassword)
          {
            if (oldPassword === user.password)
            {
              userAccounts.updateUser(user.username, newPassword, id, user.avatar, (err, status) =>
              {
                if (err) console.log("Error: updateUser password change: could not update. " + err);
                let response =
                {
                  "status": "success",
                  "data":
                  {
                    "passwordChanged": true,
                    "avatar": user.avatar
                  }
                }
                if (avatar)
                {
                  userAccounts.updateUser(user.username, newPassword, id, avatar, (err, status) =>
                  {
                    if (err) console.log("Error: updateUser avatar & password. " + err);
                    response.data.avatar = avatar;
                  });
                }
                res.send(JSON.stringify(response));
                console.log("Success");
                //next();
              });
            }
            else
            {
              let response =
              {
                "status": "fail",
                "reason":
                {
                  "id": "Forbidden",
                  "oldPassword": "Forbidden"
                }
              }
              res.send(JSON.stringify(response));
              console.log("Error: updateUser: Incorrect old password");
            }
          }
          else if (avatar)
          {
            user.avatar = avatar;
            let response =
            {
              "status": "success",
              "data":
              {
                "passwordChanged": false,
                "avatar": avatar
              }
            }
            res.send(JSON.stringify(response));
            console.log("Info: updateUser: Just avatar change");
            //next();
          }
          else
          {
            let response =
            {
              "status": "success",
              "data":
              {
                "passwordChanged": false,
                "avatar": avatar
              }
            }
            res.send(JSON.stringify(response));
            console.log("Info: updateUser: Nothing changed");
            //next();
          }
        }
      });
      
    }
  });
  
  console.log("Info: UpdateUser Exited.");
}

module.exports.register = function(app, root)
{
  app.post(root + 'create', createUser);
  app.get(root + 'login', loginUser);
  app.get(root + 'logout', logoutUser);
  app.get(root + ':id/get', getUser);
  app.get(root + 'find/:username', findUser);
  app.post(root + ':id/update', updateUser);
}
