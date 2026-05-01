const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "tenant"],
      default: "tenant",
    },
    contactNumber: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

/**
 * PASSWORD HASHING HOOK (Modern Async Style)
 * Inalis na natin ang 'next' parameter dito. 
 * Dahil async ito, automatic na maghihintay ang Mongoose bago i-save.
 */
UserSchema.pre("save", async function () {
  // 1. Check kung binago ang password. Kung hindi, exit na agad.
  if (!this.isModified("password")) {
    return;
  }

  try {
    // 2. Hashing process
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
    // NOTE: Wala nang next() dito para iwas "next is not a function" error.
  } catch (error) {
    // 3. I-throw ang error para masalo ng catch block sa controller mo
    throw new Error(error);
  }
});

/**
 * PASSWORD MATCHING METHOD
 */
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);