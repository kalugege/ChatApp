import mongoose from "mongoose";
const { Schema } = mongoose;

const MessageSchema = new Schema({
  message: {
    type: String
  },
  time: { type: Date, default: Date.now },
});

export default mongoose.model("Msg", MessageSchema);
