/** Common code run before each test */

const db = require("./db");

async function createData() {
  await db.query("DELETE FROM companies");
  await db.query("DELETE FROM invoices");

  await db.query("SELECT setval('invoices_id_seq', 1, false)");

  await db.query(
    `INSERT INTO companies (code, name, description) VALUES ('hoka','HOKA','Thick boi shoes')`
  );
  await db.query(
    `INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) VALUES ('hoka', 100, false, '2024-04-23', null)`
  );
}

module.exports = { createData };
