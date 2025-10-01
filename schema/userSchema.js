const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName :{
        type : String,
        required : true
    },

    surnName:{
        type: String,
        required: true
    },

    email :{
        type: String,
        required: true,
        unique: true
    },

    password:{
        type: String,
        required : true,
        select : false
    },

    role: {
   type: String,
   enum: ["customer", "rider", "admin"], 
   default: "customer"
   },

    createdAt : {type : Date, default:Date.now  }
});

const users = mongoose.model('users', userSchema);
module.exports = users