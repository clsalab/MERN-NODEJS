import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: { type: String, required:true, trim: true },
    email: { type: String, required:true,trim: true, unique: true },
    password: { type: String, required:true },
    isAdmin: { type: Boolean, default: false },
    
},
{
    timestamps: true,
    versionKey: false
})

export default mongoose.model('Users', UserSchema)