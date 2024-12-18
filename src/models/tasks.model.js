import mongoose from "mongoose";


const taskSchema = new mongoose.Schema({
    title: { type: String, required:true, trim: true },
    description: { type: String,trim: true},
    date: { type: Date, default: Date.now },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true}
    
},
{
    timestamps: true,
    versionKey: false
})

export default mongoose.model("Task", taskSchema)