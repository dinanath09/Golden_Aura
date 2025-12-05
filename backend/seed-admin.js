// backend/seed-admin.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const exists = await User.findOne({ email: "admin@goldenaura.test" });
  if (exists) { console.log("Admin exists"); return process.exit(0); }
  const user = await User.create({
    name: "Admin",
    email: "admin@goldenaura.test",
    password: "Admin@123",
    role: "admin",
  });
  console.log("Admin created:", user.email);
  process.exit(0);
})();
