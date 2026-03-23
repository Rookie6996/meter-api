const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());


// PostgreSQL connection
const pool = new Pool({
  connectionString:
    connectionString: "postgresql://postgres:Terafitoorjabsechadhgayare@db.ewzaadzntrrztofbezx.supabase.co:5432/postgres",
  ssl: {
    rejectUnauthorized: false
  }
});


// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Meter API is running");
});


// CREATE TABLE
app.get("/create_table", async (req, res) => {

  try {

    const query = `
    CREATE TABLE IF NOT EXISTS meter_records (
        id SERIAL PRIMARY KEY,
        meter_number VARCHAR(50),
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        site_id VARCHAR(50),
        user_id VARCHAR(50),
        timestamp BIGINT
    );
    `;

    await pool.query(query);

    res.send("Table created successfully");

  } catch (error) {

    console.log(error);
    res.send(error.message);

  }

});


// SAVE METER DATA
app.post("/save_meter", async (req, res) => {

  const { meter_number, latitude, longitude } = req.body;

  try {

    const query = `
      INSERT INTO meter_records
      (meter_number, latitude, longitude, site_id, user_id, timestamp)
      VALUES ($1,$2,$3,'SITE1','TECH1',EXTRACT(EPOCH FROM NOW()))
    `;

    await pool.query(query, [
      meter_number,
      latitude,
      longitude
    ]);

    res.json({
      status: "success"
    });

  } catch (error) {

    console.error(error);

    res.json({
      status: "error",
      message: error.message
    });

  }

});


// GET ALL METERS
app.get("/meters", async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT * FROM meter_records ORDER BY id DESC"
    );

    res.json(result.rows);

  } catch (error) {

    console.log(error);
    res.send(error.message);

  }

});


// SEARCH METER
app.get("/meter/:meter", async (req, res) => {

  try {

    const meter = req.params.meter;

    const result = await pool.query(
      "SELECT * FROM meter_records WHERE meter_number=$1",
      [meter]
    );

    res.json(result.rows);

  } catch (error) {

    console.log(error);
    res.send(error.message);

  }

});


// DELETE SINGLE METER
app.delete("/delete_meter/:meter", async (req, res) => {

  try {

    const meter = req.params.meter;

    await pool.query(
      "DELETE FROM meter_records WHERE meter_number=$1",
      [meter]
    );

    res.json({
      status: "deleted"
    });

  } catch (error) {

    console.log(error);
    res.send(error.message);

  }

});


// BULK DELETE METERS
app.post("/bulk_delete", async (req,res)=>{

  try{

    const meters = req.body.meters;

    await pool.query(
      "DELETE FROM meter_records WHERE meter_number = ANY($1)",
      [meters]
    );

    res.json({
      status:"deleted"
    });

  }catch(error){

    console.log(error);
    res.send(error.message);

  }

});


// EXPORT ALL METERS TO EXCEL
app.get("/export_excel", async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT meter_number, latitude, longitude, timestamp FROM meter_records ORDER BY timestamp DESC"
    );

    let csv = "meter_number,latitude,longitude,timestamp\n";

    result.rows.forEach(r => {
      csv += `${r.meter_number},${r.latitude},${r.longitude},${r.timestamp}\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment("meter_records.csv");
    res.send(csv);

  } catch (error) {

    console.log(error);
    res.send(error.message);

  }

});


// DAILY CLEANUP JOB
setInterval(async () => {

  try {

    // REMOVE DUPLICATES (keep latest scan)
    await pool.query(`
      DELETE FROM meter_records a
      USING meter_records b
      WHERE a.meter_number = b.meter_number
      AND a.id < b.id
    `);

    console.log("Duplicate records removed");


    // DELETE RECORDS OLDER THAN 5 DAYS
    await pool.query(`
      DELETE FROM meter_records
      WHERE timestamp < EXTRACT(EPOCH FROM NOW()) - (5 * 24 * 60 * 60)
    `);

    console.log("Records older than 5 days deleted");

  } catch (error) {

    console.log(error);

  }

}, 86400000); // runs every 24 hours


// START SERVER
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
