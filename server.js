const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "YOUR_DB_HOST",
  user: "YOUR_DB_USER",
  password: "YOUR_DB_PASSWORD",
  database: "meterdb"
});

app.post("/save_meter", (req, res) => {

  const { meter_number, latitude, longitude, site_id, user_id, timestamp } = req.body;

  const sql = "INSERT INTO meter_records (meter_number, latitude, longitude, site_id, user_id, timestamp) VALUES (?,?,?,?,?,?)";

  db.query(sql, [meter_number, latitude, longitude, site_id, user_id, timestamp], (err,result)=>{
      if(err){
          return res.json({status:"error"});
      }
      res.json({status:"success"});
  });

});

app.listen(3000,()=>{
  console.log("Server running");
});