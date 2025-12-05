// backend/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home" },
    name: { type: String, default: "" },
    line1: { type: String, default: "" },
    line2: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    country: { type: String, default: "India" },
    phone: { type: String, default: "" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isBlocked: { type: Boolean, default: false },

    // optional/profile fields
    mobile: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },

    // addresses & wishlist stored on user document
    addresses: { type: [addressSchema], default: [] },
    wishlist: { type: [mongoose.Schema.Types.ObjectId], ref: "Product", default: [] },

    // reset token fields (used by your controller)
    resetToken: { type: String },
    resetTokenExp: { type: Number },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare plain password with hashed password
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Provide older alias if other code calls matchPassword
userSchema.methods.matchPassword = function (plain) {
  return this.comparePassword(plain);
};

// Ensure password is not returned by default when using toObject/toJSON
userSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    delete ret.password;
    delete ret.resetToken;
    delete ret.resetTokenExp;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
