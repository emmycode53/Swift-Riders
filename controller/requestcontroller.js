const requestModel = require('../schema/requestSchema');
const smtp = require('../services/sendmail');
const user = require('../schema/userSchema');

const createdeliveryrequest = async (req, res)=>{
    try {
        const {pickup, dropoff, package_details, cost} = req.body;

        if(!pickup || !dropoff || !package_details || !cost){
            res.status(400).send('all fields are required')
        };

        const request = await requestModel.create({costumerId: req.user.userId,pickup,dropoff,package_details,cost});
        if(!request){
            res.status(303).send('failed to create a request')
        }

        res.status(201).json({
            message: 'request has been created successfully', data:request
        })
    } catch (error) {
        console.error('error creating request', error);
        res.status(500).send('internal server error');
        
    }
};

const getAvailableRequests = async (req, res) => {
  try {
    const requests = await requestModel.find({ status: "pending" });

   if (!requests || requests.length < 1) {
      return res.status(404).send({ message: 'No pending requests are available at the moment' });
    }


    res.status(200).json({
      message: "Available requests",
      data: requests
    });
  } catch (error) {
    res.status(500).send("Internal server error");
  }
};


const acceptRequest = async (req, res) => {
  try {
    const requestId = req.params.id;


    const request = await requestModel.findById(requestId);
    


    if (!request || request.status !== "pending") {
      return res.status(400).send("Request not available");
    }

    request.status = "accepted";
    request.riderId = req.user.userId;

    await request.save();

    const riderName = `${req.user.firstName} ${req.user.surnName}`;

    
    const costumer = await user.findById(request.costumerId);
    if (!costumer) {
      return res.status(404).send("Customer not found");
    }
    smtp.sendMail({
      from: process.env.USER_EMAIL,
      to: costumer.email,
      subject: "Swift Riders",
      text: `Your request has been accepted`,
      html: `<div> 
               <p>Your request has been accepted by ${riderName}.</p>
             </div>`
    }, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
      } else {
        console.log('Email sent successfully:', info.response);
      }
    });

    res.status(200).json({
      message: "Request accepted",
      data: request
    });

  } catch (error) {
    console.error("Error in acceptRequest:", error);
    res.status(500).send("Internal server error");
  }
};


const updateStatus = async (req, res) => {
  try {
    const  requestId  = req.params.id;
    const { status } = req.body;

    if (!["accepted", "in-progress", "completed"].includes(status)) {
      return res.status(400).send("Invalid status");
    }

    const request = await requestModel.findById(requestId);

    if (!request) {
      return res.status(404).send("Request not found");
    }

    request.status = status;
    await request.save();

    res.status(200).json({
      message: `Request status updated to ${status}`,
      data: request
    });

  } catch (error) {
    res.status(500).send("Internal server error");
  }
};

const getAnalytics = async (req, res) => {
  try {
    const totalCostumer = await user.countDocuments({role:'costumer'})
    const totalRider = await user.countDocuments({role:'rider'})
    const totalRequests = await requestModel.countDocuments();
    const completedRequests = await requestModel.countDocuments({ status: "completed" });
    const revenueAgg = await requestModel.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$cost" } } }
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    res.json({
      message: "Analytics",
      data: {
        totalCostumer,
        totalRider,
        totalRequests,
        completedRequests,
        totalRevenue
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching analytics", error: err.message });
  }
};


const getAllRequest = async (req,res)=>{
    try {
      
      const request = await requestModel.find()
      .populate("costumerId","fistName surnName")
      .populate("riderId", "firstName surnName");

      if (!request || request.length === 0) {
      return res.status(404).send('no request found');
     }
    return  res.status(200).json({message:'delivery request successfully fetched',
         data: request});
    } catch (error) {
      console.error('error occured', error.message);
      res.status(500).send('internal error');
    }
};

const getSingleRequest = async (req,res)=>{
  try {
    const id = req.params.id;  
    const request = await requestModel.findById(id)
      .populate("costumerId", "firstName surnName")
      .populate("riderId", "firstName surnName")

    if(!request){
      return res.status(404).json({message:'this request in no longer available'});
    }

    res.status(200).json({message:'successfully fetched request', data:request})
  } catch (error) {
    console.error('an error occured', error.message);
    res.status(500).json({message:'internal error'}) 
  }
};



const deleteSingleRequest = async (req,res)=>{
  try {
  

    const requestId = req.params.id;
    const request = await requestModel.findByIdAndDelete(requestId);
    if(!request){
    return  res.status(404).json({message:'this request is not available'});
    };

   return res.status(200).json({message:"Request has been successfully deleted"})
  } catch (error) {
    console.error('error deleting request', error.message);
    res.status(500).json({message:'internal server error'});
  }
};


const updateRiderLocation = async (req, res) => {
  try {
    console.log('you hit the controllere')
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const request = await requestModel.findOneAndUpdate(
      { _id: req.params.id, riderId: req.user.userId },
      { $set: { riderLocation: { latitude, longitude } } },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: 'Request not found or not assigned to this rider' });
    }

    res.json({ message: 'Location updated successfully', request });
  } catch (err) {
    console.error('Error updating rider location:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const trackRiderLocation = async (req, res) => {
  try {
    const { id } = req.params; 
   

    const request = await requestModel.findById(id);
    

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json({
      message: "Rider location retrieved successfully",
      location: request.riderLocation
    });
  } catch (error) {
    console.error("Error tracking rider location:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



module.exports = {
  createdeliveryrequest,
  getAvailableRequests,
  acceptRequest,
  updateStatus,
  getAnalytics,
  getAllRequest,
  getSingleRequest,
  deleteSingleRequest,
  updateRiderLocation,
  trackRiderLocation
};