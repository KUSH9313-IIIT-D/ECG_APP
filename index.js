const express = require('express')
const app = express()
const path = require('path');
const server = require('http').createServer(app);
const WebSocket = require('ws');
const fs = require('fs')
var cron = require('node-cron');
var sendmail = require('./ServerFiles/sendmail');
const {spawn} = require('child_process');

/*             WebSocket                             */

// File Indexing
var assignIndex=0;

//
const wss = new WebSocket.Server({ server:server });
var ValidOTPEmail=new Map();
wss.on('connection', function connection(ws) {
  //console.log('A new client Connected!');
  ws.send('{"Message":"Welcome New Client!"}');

  ws.on('message', function incoming(message) {
    //console.log('received: %s', message);
    //wss.clients.forEach(function each(client) {
    //  if (client !== ws && client.readyState === WebSocket.OPEN) {
    //    client.send(message);
    //  }
    //});
    try {
      var Data = JSON.parse(message);
    if(Data.Type==="SignUp"){
      //{"Type":"SignUp","Name":"Manish","Email":"mkk9313@gmail.com","Password":"123456789","Confirm":"123456789"}
      if(typeof Data.Email === 'undefined'){
      		ws.send(`{"Type":"Error","Message":"Email undefined."}`);
      }
      else if(!(Data.Email in UserDataBase)){
        var email = Data.Email;
        var name = Data.Name;
        var password = Data.Password;
        var confirm = Data.Confirm;
        if(typeof password === 'undefined' || typeof confirm === 'undefined'){
      		ws.send(`{"Type":"Error","Message":"Password or Confirm undefined."}`);
      	}
        else if(password===confirm){
          ValidOTPEmail.set(email,{"OTP":sendmail.sendOTP(email,between(100000,999999),name),"Name":name,"Password":password});
          ws.send(`{"Type":"${Data.Type}","Message":"Successful"}`);
        }
        else{
          ws.send(`{"Type":"Error","Message":"Password!==Confirm"}`);
        }
      }
      else{
        ws.send(`{"Type":"Error","Message":"Email already exist."}`);
      }
    }
    else if(Data.Type==="OTP_Verification"){
      //{"Type":"OTP_Verification","Email":"mkk9313@gmail.com","OTP":8470}
      var email = Data.Email;
      if(ValidOTPEmail.has(email)){
        var name = ValidOTPEmail.get(email).Name;
        var password = ValidOTPEmail.get(email).Password;
        var OTP = Data.OTP;
        if(OTP===ValidOTPEmail.get(email).OTP){
          // Tranfer Files to main database
          UserDataBase[email]={"Name":name,"Password":password,"Email":email,"Files":[]};
          sendmail.sendCreated(email,name,password,email);
          ws.send(`{"Type":"${Data.Type}","Message":"Successful"}`);
        }
        else{
          ws.send(`{"Type":"Error","Message":"Wrong OTP"}`);  
        }
      }
      else{
        ws.send(`{"Type":"Error","Message":"SignUp Please...."}`);
      }

      
    }
    else if(Data.Type==="SignIn"){
      //{"Type":"SignIn","Name":"Manish","Email":"mkk9313@gmail.com","Password":"123456789"}
      var email = Data.Email;
      var password = Data.Password;
      //console.log(UserDataBase.hasOwnProperty(email),UserDataBase[email]);
      if((UserDataBase.hasOwnProperty(email) )){
        if(password===UserDataBase[email].Password){
          ws.send(`{"Type":"${Data.Type}","Message":"Successful"}`);
        }
        else{
          ws.send(`{"Type":"Error","Message":"Incorrect Password"}`);
        }
      }
      else{
        ws.send(`{"Type":"Error","Message":"Incorrect Email"}`);
      }
      
    }

    
    
    else if(Data.Type==="HRV"){
      //{"Email":"mkk9313@gmail.com","Password":"123456789","Type":"HRV","FileName":"covid1.csv"}
      var email = Data.Email;
      var password = Data.Password;
      if((UserDataBase.hasOwnProperty(email) )){
        if(password===UserDataBase[email].Password){
          var filename = "./uploads/"+Data.FileName;
          var dataToSend='';
          const python = spawn('python', ['../PythonFiles/HRV.py',filename]);
          python.stdout.on('data', function (data) {
          //console.log(`Pipe data from python script ...`);
          dataToSend += data.toString();
          });
          python.on('close', (code) => {
          //console.log(`child process close all stdio with code ${code} `);
          if(dataToSend!=="")
            ws.send(dataToSend)
          else
            ws.send(`{"Type":"Error","Message":"File Not Found."}`);
          });
        }
        else{
          ws.send(`{"Type":"Error","Message":"Incorrect Password"}`);
        }
      }
      }

       
      
      else if(Data.Type==="POST_COVID"){
      //{"Email":"mkk9313@gmail.com","Password":"123456789","Type":"POST_COVID","FileName":"covid1.csv"}
      var email = Data.Email;
      var password = Data.Password;
      if((UserDataBase.hasOwnProperty(email) )){
        if(password===UserDataBase[email].Password){
          var filename = "./uploads/"+Data.FileName;
          var dataToSend='';
          const python = spawn('python', ['../PythonFiles/Post_Covid.py',filename]);
          python.stdout.on('data', function (data) {
          //console.log(`Pipe data from python script ...`);
          dataToSend += data.toString();
          });
          python.on('close', (code) => {
          //console.log(`child process close all stdio with code ${code} `);
          if(dataToSend!="")
            ws.send(dataToSend)
          else
            ws.send(`{"Type":"Error","Message":"File Not Found."}`);
          });
        }
        else{
          ws.send(`{"Type":"Error","Message":"Incorrect Password"}`);
        }
      }
      
      else{
        ws.send(`{"Type":"Error","Message":"Incorrect Email"}`);
      }
      
      
    }

    else if(Data.Type==="PLOT_TEST"){
      //{"Email":"mkk9313@gmail.com","Password":"123456789","Type":"POST_COVID","FileName":"covid1.csv"}
      var email = Data.Email;
      var password = Data.Password;
      if((UserDataBase.hasOwnProperty(email) )){
        if(password===UserDataBase[email].Password){
          var filename = "./uploads/"+Data.FileName;
          var dataToSend='';
          const python = spawn('python', ['../PythonFiles/Shap_Value.py',filename]);
          python.stdout.on('data', function (data) {
          //console.log(`Pipe data from python script ...`);
          dataToSend += data.toString();
          });
          python.on('close', (code) => {
          console.log(`child process close all stdio with code ${code} `);
          if(dataToSend!="")
            ws.send(dataToSend)
          else
            ws.send(`{"Type":"Error","Message":"File Not Found."}`);
          });
        }
        else{
          ws.send(`{"Type":"Error","Message":"Incorrect Password"}`);
        }
      }
      
      else{
        ws.send(`{"Type":"Error","Message":"Incorrect Email"}`);
      }
      
      
    }
    
     else if(Data.Type==="File"){
      //{"Email":"mkk9313@gmail.com","Password":"123456789","Type":"File","File":"AAA","Name":"m.csv"}
      var email = Data.Email;
      var password = Data.Password;
      var data = Data.File; 
      if((UserDataBase.hasOwnProperty(email) )){
        if(password===UserDataBase[email].Password){
	var readFile = Buffer.from(data,"base64");
	fs.writeFileSync("./uploads/"+Data.Name,readFile,"utf8");
	ws.send(`{"Type":"FIle","Message":"File Uploaded."}`);
        }
        else{
          ws.send(`{"Type":"Error","Message":"Incorrect Password"}`);
        }
      }
      } 
      
    else if(Data.Type==="FileName"){
      //{"Email":"mkk9313@gmail.com","Password":"123456789","Type":"FileName","FileName":"covid1.csv"}
      var email = Data.Email;
      var password = Data.Password;
      if((UserDataBase.hasOwnProperty(email) )){
        if(password===UserDataBase[email].Password){
          assignIndex=assignIndex+1;
          UserDataBase["AssignIndex"]=assignIndex;
          UserDataBase[email]["Files"].push(`${email}_${2021}_${assignIndex}.csv`);
          ws.send(`{"Type":"${Data.Type}","FileName":"${email}_${2021}_${assignIndex}.csv"}`);
        }
        else{
          ws.send(`{"Type":"Error","Message":"Incorrect Password"}`);
        }
      }
      
      else{
        ws.send(`{"Type":"Error","Message":"Incorrect Email"}`);
      }
    }
    else{
      ws.send(`{"Type":"Error","Message":"Wrong Data Type."}`);
    }
    } catch (error) {
      console.log(error);
      ws.send(`{"Type":"Error","Message":"${error}"}`);
    }
    
    
  });
});

function between(min, max) {  
  return Math.floor(
    Math.random() * (max - min) + min
  )
}
/*             END WebSocket                             */

/*             PAGES                                     */
// Home Page
app.use(express.static(path.join(__dirname,'ServerFiles/venus')));

// Demo Video
app.get('/demo',(req,res)=>{
  res.sendFile(path.join(__dirname,'./','ServerFiles/demo.mp4'));
});



/*             END PAGES                                     */

/*             Save User Data Evey T Mins                   */
let UserDataBase={}
try{
  let rawdata = fs.readFileSync('./Database/DB.json');
  UserDataBase = JSON.parse(rawdata);
  //UserDataBase[email]={"Name":name,"Password":password,"Email":email};
  assignIndex=UserDataBase["AssignIndex"];
  }
catch(e){
  UserDataBase={};
  UserDataBase["AssignIndex"]=0;
  assignIndex=0;

}


var isAnyChangeInDatabase=true;
var Interval = "59"; //mins
cron.schedule(`*/${Interval} * * * *`, () => {
  
  const jsonString = JSON.stringify(UserDataBase);
  //console.log(`Save Data ${isAnyChangeInDatabase} ${UserDataBase.size} ${jsonString}`);
  fs.writeFile('.././Database/DB.json', jsonString, err => {
    if (err) {
        console.log('Error writing file', err)
    } else {
        //console.log('Successfully wrote file')
    }
  })
});

/*             END Save User Data Evey T Mins                   */
var PORT = 8080;
server.listen(PORT, () => console.log(`Lisening on port :${PORT}`))
