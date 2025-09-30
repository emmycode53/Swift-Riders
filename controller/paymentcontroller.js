const axios = require('axios');
const user = require('../schema/userSchema');
const requestModel = require('../schema/requestSchema');
const crypto = require('crypto');



const initializePayment = async(req, res)=>{
    try {
        const {Email, Amount, requestId} = req.body;

          if (!Email || !Amount || !requestId) {
      return res.status(400).send("Email, Amount, and requestId are required");
    }

        const response = await axios.post("https://api.paystack.co/transaction/initialize",
        {email : Email,
          amount :Amount * 100,
          metadata :{
            userId : req.user.userId,
          requestId : requestId
          }
        },

        {
            headers:{
                Authorization : `Bearer ${process.env.PAYSTACK_SECRET_KEY }`,
                "Content-Type" : "application/json"
            }
        }
        );

        
    res.status(200).json({
      message: "Payment initialized",
      authorization_url: response.data.data.authorization_url, 
      access_code: response.data.data.access_code,
      reference: response.data.data.reference,
    });
    } catch (error) {
      console.error("Payment initialization error:", error.response?.data || error.message);
    res.status(500).send("Payment initialization failed");  
    }

};

const paystackWebhook = async(req,res)=>{
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const hash = crypto.createHmac("sha512", secret).update(JSON.stringify(req.body)).digest("hex");
    if(hash !== req.headers["x-paystack-signature"]){
     return res.status(401).send({message:'invalid signature'});
    }
    const event = req.body;
    if(event.event === "charge.success"){
      const data = event.data;
      const { userId, requestId} = data.metadata

      await requestModel.findByIdAndUpdate(requestId, {
        paymentStatus: "paid",
        paidBy: userId,
        transactionRef: data.reference,

      })
      console.log(`Payment successful for Request ${requestId} by User ${userId}`);
    }
      res.sendStatus(200);

  } catch (error) {
    console.error('webhook error', error.message);
    res.sendStatus(500)
  }
};

module.exports ={
  initializePayment,
  paystackWebhook
};





