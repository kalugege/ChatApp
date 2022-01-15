import mongoose from "mongoose";
import validator from "validator";
const {Schema} = mongoose;
const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [validator.isEmail, "Invalid Email Address"],
    },
    password: { type: String, required: true },
    role: { type: Number, default: 0 },
    emailVerify: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", UserSchema);
