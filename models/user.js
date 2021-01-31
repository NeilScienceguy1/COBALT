const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    id:{
        type:String,
        required:true
    },
    todos:{
        type:Array
    },
    emails:{
        type:Array
    },
    city:{
        type:String
    },
    emailFrom:{
        type:String
    }
})