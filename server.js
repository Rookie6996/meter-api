const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: "postgresql://meter_db_iy6o_user:DRtOxTnkGrxk4CgZtLSS6NkpNnpgrDXe@dpg-d6nul3v5gffc738564tg-a.oregon-postgres.render.com/meter_db_iy6o",
  ssl: {
    rejectUnauthorized: false
  }
});

app.get("/", (req, res) => {
  res.send("Meter API is running");
});

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

    res.json({ status: "success" });

  } catch (error) {

    console.error(error);
    res.json({
      status:"error",
      message:error.message
    });

  }

});

app.listen(3000, () => {
  console.log("Server running");
});
