// server/scripts/fixUserPassword.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function fixPasswords() {
  await mongoose.connect(process.env.MONGO_URI);

  const users = await User.find({});
  console.log(`Found ${users.length} users.`);

  for (const user of users) {
    const isHashed = user.password.startsWith("$2b$");

    if (!isHashed) {
      console.log(`Fixing password for: ${user.email}`);
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      await user.save();
    } else {
      console.log(`OK: ${user.email} (already hashed)`);
    }
  }

  console.log("✅ Completed password fix!");
  process.exit();
}

fixPasswords().catch(err => {
  console.error(err);
  process.exit(1);
});
