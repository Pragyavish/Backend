const bcrypt = require("bcrypt");
const { connection } = require("../config/db");

// Create user
exports.createUser = async ({ firstName, lastName, email, password }) => {
  const hashedPassword = await bcrypt.hash(password, 12);
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)";
    connection.query(
      sql,
      [firstName, lastName, email, hashedPassword],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
};

// Get user by email
exports.findByEmail = (email) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      (err, results) => {
        if (err) return reject(err);
        resolve(results[0]); // single user
      }
    );
  });
};

// Get user by ID
exports.findById = (id) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT id, firstName, lastName, email FROM users WHERE id = ?",
      [id],
      (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      }
    );
  });
};

// Update reset token
exports.setResetToken = (email, token, expiry) => {
  return new Promise((resolve, reject) => {
    const sql =
      "UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE email = ?";
    connection.query(sql, [token, expiry, email], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Get user by reset token
exports.findByResetToken = (token) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT * FROM users WHERE resetToken = ? AND resetTokenExpiry > NOW()";
    connection.query(sql, [token], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};

// Reset password
exports.resetPassword = async (id, password) => {
  const hashedPassword = await bcrypt.hash(password, 12);
  return new Promise((resolve, reject) => {
    const sql =
      "UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE id = ?";
    connection.query(sql, [hashedPassword, id], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};
