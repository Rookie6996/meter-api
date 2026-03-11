const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  host: "dpg-d6nul3v5gffc738564tg-a.oregon-postgres.render.com",
  user: "meter_db_iy6o_user",
  password: "DRtOxTnkGrxk4CgZtLSS6NkpNnpgrDXe",
  database: "meter_db_iy6o",
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

// ✅ ADD THIS PART HERE
app.get("/", (req, res) => {
  res.send("Meter API is running");
});

app.post("/save_meter", async (req, res) => {

  const { meter_number, latitude, longitude, site_id, user_id, timestamp } = req.body;

  try {

    const query = `
      INSERT INTO meter_records 
      (meter_number, latitude, longitude, site_id, user_id, timestamp)
      VALUES ($1,$2,$3,'SITE1','TECH1',EXTRACT(EPOCH FROM NOW()))
    `;

    await pool.query(query, [
      meter_number,
      latitude,
      longitude,
      site_id,
      user_id,
      timestamp
    ]);

    res.json({ status: "success" });

  } catch (error) {

    console.error(error);
    res.json({status:"error", message: error.message});

  }

});

app.listen(3000, () => {
  console.log("Server running");
});





