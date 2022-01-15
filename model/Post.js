import mongoose from "mongoose";
const { Schema } = mongoose;

const PostSchema = new Schema({
  image: {
    type: String,
  },
  description: {
    type: String,
  },
  time: { type: Date, default: Date.now },
  
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

export default mongoose.model("Post", PostSchema);
