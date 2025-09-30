
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const authroutes = require('./routes/usersroutes');
const requestroutes = require('./routes/requestroutes');
const paymentroutes = require('./routes/paymentroutes');

const app = express()

app.use((req, res, next) => {
  console.log("🌍 Global logger →", req.method, req.url);
  next();
});



app.use(express.urlencoded({extended:true}));

app.use(express.json());


app.use('/auth', authroutes);
app.use('/request', requestroutes);
app.use('/payment', paymentroutes);
 
mongoose.connect(process.env.MONGO_ATLAS_URI)
.then(()=> console.log('connected to the database'))
.catch((err)=> console.error('error connecting to the database', err))

module.exports = app