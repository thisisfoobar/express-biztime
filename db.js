const { Client } = require("pg");
// Need to create a password file before running
const password = require("./secretpassword")

let dbName;

// If we're running in test "mode", use our test db
// Make sure to create both databases!
if (process.env.NODE_ENV === "test") {
  dbName = "biztime_test";
} else {
  dbName = "biztime";
}

let db = new Client({
  user: 'thisisfoobar',
  host: 'localhost',
  database: dbName,
  password: password,
  port: 5432
});

db.connect()
  .then(() => console.log("Connected to PostgreSQL database:",dbName))
  .catch(err => console.error("Error connecting to PostgreSQL database:", err));

module.exports = db;
