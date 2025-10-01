const cors = require('cors')
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const {swaggerUi, swaggerSpec} = require('./swagger')
const authroutes = require('./routes/usersroutes');
const requestroutes = require('./routes/requestroutes');
const paymentroutes = require('./routes/paymentroutes');

const app = express()


app.use(cors())


app.use(express.urlencoded({extended:true}));

app.use(express.json());


app.use('/api-docs',swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/auth', authroutes);
app.use('/request', requestroutes);
app.use('/payment', paymentroutes);
 
mongoose.connect(process.env.MONGO_ATLAS_URI)
.then(()=> console.log('connected to the database'))
.catch((err)=> console.error('error connecting to the database', err))

module.exports = app