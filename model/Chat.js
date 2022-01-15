import mongoose from "mongoose";
const { Schema } = mongoose;

const ChatSchema = Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    messages: [{
        type: Schema.Types.ObjectId,
        ref: 'Msg'
    }]
})

export default mongoose.model("Chat", ChatSchema);