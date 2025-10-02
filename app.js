const cors = require('cors')
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const {swaggerUi, swaggerSpec} = require('./swagger')
const authroutes = require('./routes/usersroutes');
const requestroutes = require('./routes/requestroutes');
const webhookroute = require('./routes/webhookrout');
const initializePaymentroute = require('./routes/initializepaymentroute')
const app = express()


app.use(cors({origin: '*'}))

app.use('/payment', webhookroute);

app.use(express.urlencoded({extended:true}));

app.use(express.json());



app.use('/api-docs',swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/pay', initializePaymentroute)
app.use('/auth', authroutes);
app.use('/request', requestroutes);

 
mongoose.connect(process.env.MONGO_ATLAS_URI)
.then(()=> console.log('connected to the database'))
.catch((err)=> console.error('error connecting to the database', err))

module.exports = app