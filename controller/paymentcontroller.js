const axios = require('axios');
const userModel = require('../schema/userSchema');
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

// const paystackWebhook = async(req,res)=>{
//   try {
//     const secret = process.env.PAYSTACK_SECRET_KEY;
//     const hash = crypto.createHmac("sha512", secret).update(req.body).digest("hex");
//     if(hash !== req.headers["x-paystack-signature"]){
//      return res.status(401).send({message:'invalid signature'});
//     }
//     res.sendStatus(200);

//     console.log('Webhook payload:', req.body); 
//     const event = JSON.parse(req.body.toString());
    
// console.log(event.event); 
// console.log(event.data.reference); 
// console.log(event.data.metadata); 


//     if(event.event === "charge.success"){
//       const data = event.data;
//       const { userId, requestId} = data.metadata

//       await requestModel.findByIdAndUpdate(requestId, {
//         paymentStatus: "paid",
//         paidBy: userId,
//         transactionRef: data.reference,

//       })
//       console.log(`Payment successful for Request ${requestId} by User ${userId}`);
//     }
      

//   } catch (error) {
//     console.error('webhook error', error.message);
//     res.sendStatus(500)
//   }
// };

// const paystackWebhook = async (req, res) => {
//   try {
//     const secret = process.env.PAYSTACK_SECRET_KEY;

//     if (!req.body) {
//       console.error("❌ Webhook received with empty body");
//       return res.sendStatus(400);
//     }

    
//     const hash = crypto
//       .createHmac("sha512", secret)
//       .update(req.body)
//       .digest("hex");

//     if (hash !== req.headers["x-paystack-signature"]) {
//       return res.status(401).send({ message: "Invalid signature" });
//     }

    
//     const event = JSON.parse(req.body.toString());
//     console.log("✅ Webhook Event:", event.event);
//     console.log("Reference:", event.data.reference);
//     console.log("Metadata:", event.data.metadata);

  
//     if (event.event === "charge.success") {
//       try {
//         const { userId, requestId } = event.data.metadata;

//         await requestModel.findByIdAndUpdate(requestId, {
//           paymentStatus: "paid",
//           paidBy: userId,
//           transactionRef: event.data.reference,
//         });

//         console.log(`💰 Payment successful for Request ${requestId} by User ${userId}`);
//       } catch (dbError) {
//         console.error("❌ DB update failed:", dbError.message);
//         return res.sendStatus(500); 
//       }
//     }

    
//     res.sendStatus(200);

//   } catch (error) {
//     console.error("❌ Webhook error:", error.message);
//     res.sendStatus(500);
//   }
// };

const paystackWebhook = async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    const rawBody = req.body.toString();

    const hash = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(401).json({ message: "invalid signature" });
    }

    const body = JSON.parse(rawBody);
    const event = body.event;
    const reference = body.data?.reference;
    const metadata = body.data?.metadata;

    console.log("✅ Webhook Event:", event);
    console.log("Reference:", reference);
    console.log("Metadata:", metadata);

    
    if (event === "charge.success") {
    
      const updatedRequest = await requestModel.findByIdAndUpdate(
        metadata.requestId,
        {
          paymentStatus: "paid",
          paymentReference: reference,
        },
        { new: true }
      );

      
      await userModel.findByIdAndUpdate(
        metadata.userId,
        { $push: { payments: reference } },
        { new: true }
      );

      console.log(
        `💰 Payment successful for Request ${metadata.requestId} by User ${metadata.userId}`
      );

      return res.json({
        message: "Webhook processed successfully ✅",
        event,
        reference,
        metadata,
        request: updatedRequest,
        note: `💰 Payment successful for Request ${metadata.requestId} by User ${metadata.userId}`,
      });
    }

    res.json({
      message: "Event received but no action taken",
      event,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
};


module.exports ={
  initializePayment,
  paystackWebhook
};





