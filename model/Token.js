import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
    _userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    token: { type: String, required: true },
    expireAt: { type: Date, default: Date.now, expires: '3600s' }
})

export default mongoose.model('Token',tokenSchema);