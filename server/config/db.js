const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "remove_mongo",
});

const connectDB = () => {
  connection.connect((err) => {
    if (err) {
      console.error("MySQL connection error:", err);
      process.exit(1);
    } else {
      console.log("MySQL connected");
    }
  });
};

module.exports = {
  connectDB,
  connection,
};
