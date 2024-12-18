import mongoose from "mongoose";

export const connectDB = async () => {
    try{
        await mongoose.connect('mongodb://localhost/merndb');
        console.log("**** Concexión exitosa BD **** ");
        
    } catch (error) {
        console.log(error);
        
    }
};

