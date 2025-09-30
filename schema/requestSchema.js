const mongoose = require('mongoose');

const requstSchema = new mongoose.Schema({
    costumerId :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'users'
    },

    pickup:{
        address:{type: String, require: true},
        Ln : {type : Number, require: true},
        Lt : {type : Number, require: true}
    },

    dropoff :{
         address:{type: String, require: true},
         Ln : {type : Number, require: true},
         Lt : {type : Number, require: true}
    },

    package_details :{
        type : String,
        require : true
    },

    riderId :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'users'
    },
     riderLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
    updatedAt: { type: Date }
     },
    status:{
        type: String,
        enum : ["pending", "accepted", "in-progress", "completed"],
        default: "pending"
    },

     paymentStatus: {
         type: String,
         enum: ['unpaid','paid'], default: 'unpaid'
         },

    cost :{
        type : Number,
        require: true
    },

    createdAt :{
        type: Date,
        default: Date.now
    }
});

const request = mongoose.model('request', requstSchema);
module.exports = request;