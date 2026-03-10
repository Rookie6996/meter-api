const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  host: "dpg-d6nul3v5gffc738564tg-a",
  user: "meter_db_iy6o_user",
  password: "DRtOxTnkGrxk4CgZtLSS6NkpNnpgrDXe",
  database: "meterdb",
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

app.post("/save_meter", async (req, res) => {

  const { meter_number, latitude, longitude, site_id, user_id, timestamp } = req.body;

  try {

    const query = `
      INSERT INTO meter_records 
      (meter_number, latitude, longitude, site_id, user_id, timestamp)
      VALUES ($1,$2,$3,$4,$5,$6)
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
    res.json({ status: "error" });

  }

});

app.listen(3000, () => {
  console.log("Server running");
});
