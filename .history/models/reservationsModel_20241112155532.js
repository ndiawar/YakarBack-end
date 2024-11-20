const mongoose = require('mongoose');


// User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});