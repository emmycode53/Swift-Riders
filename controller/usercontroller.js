const JWT = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userModel = require('../schema/userSchema');

const createUser = async (req, res)=>{
    try {
        const {firstName,surnName,email,password, role } = req.body;

        if(!firstName || !surnName || !email || !password || !role){
          return  res.status(403).send('all feilds are required')
        }
        const emailExist = await userModel.findOne({email});

        if(emailExist){
         return   res.status(409).send('this email has already been used')
        };

        const harshedpassword =await bcrypt.hash(password,10);

        const newUser = await userModel.create({firstName, surnName,email,password:harshedpassword,role});

        const payLoad = {
            userId: newUser._id,
            role: newUser.role,
            firstName : newUser.firstName,
            surnName: newUser.surnName,
            email : newUser.email
        };

        const token = JWT.sign(payLoad, process.env.JWT_SECRET)

        res.status(201).send({message:'user successfully created',firstName,surnName, token})


    } catch (error) {
        console.error('error creating user', error);
        res.status(500).send('internal server error' ,error)
    }

};

// const loginUser = async (req, res) =>{
//     try {
//         const {email, passWord} = req.body;

//         if (!email || !passWord) {
//       return res.status(400).send({ message: "Email and password are required" });
//     }

//         const user = await userModel.findOne({ email }).select('+passWord');
//         if (!user) {
//       return res.status(404).send({ message: "Invalid credentials" }); 
//     }
//         const isMatch = await bcrypt.compare(passWord, user.passWord);

//         if(!isMatch){
//             res.status(404).send({message: 'invalid password'});
//         };

//         const token = JWT.sign({
//             userId: user._id, 
//             role: user.role, 
//             firstName: user.firstName, 
//             surnName: user.surnName,
//             email: user.email}, process.env.JWT_SECRET);

//             res.status(201).send({message : 'login successfully',token});

//     } catch (error) {
//         console.error('error trying to login', error);
//         res.status(500).send({message: 'internal server error'});
        
//     };
// };

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    
    if (!email || !password) {
      return res.status(403).send({ message: "Email and password are required" });
    }

    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).send({ message: "Invalid credentials" }); 
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: "Invalid password" }); 
    }

    const token = JWT.sign(
      {
        userId: user._id,
        role: user.role,
        firstName: user.firstName,
        surnName: user.surnName,
        email: user.email,
      },
      process.env.JWT_SECRET
    );

    res.status(200).send({ message: "Login successfully", token });
  } catch (error) {
    console.error("Error trying to login:", error);
    return res.status(500).send({ message: "Internal server error" });
  }
};

const getAlluser = async (req, res)=> {
try {


    const  user = await userModel.find().select("-passWord")
     
    const  userInfo = user.map(x =>({
        userId : x._id,
        firstNname : x.firstName,
        surnName : x.surnName,
        role: x.role,
    }))

    if (user.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).send({message:'users fetched successfully',
        data: userInfo
    })
} catch (error) {
    console.error('error occured', error.message);
    res.status(500).send('internal server error')
    
}
};

const getAllCostumer = async (req , res)=>{
   try {
     const costumer = await userModel.find({role:"costumer"}).select("-passWord");
     if(costumer.length === 0){
        return res.status(404).send({message:'no user found'});
     }
     res.status(200).json({message:'users fetch successfully',
        data: costumer
     });
   } catch (error) {
    console.error('error occured', error.message);
    res.status(500).send('internal error')
   }
};

const getAllRiders = async (req , res)=>{
   try {
     const rider = await userModel.find({role:"rider"}).select("-passWord");
     if(rider.length === 0){
        return res.status(404).send({message:'no user found'});
     }
     res.status(200).json({message:'users fetch successfully',
        data: rider
     });
   } catch (error) {
    console.error('error occured', error.message);
    res.status(500).send('internal error')
   }
};


module.exports={
    createUser,
    loginUser,
    getAlluser,
    getAllCostumer,
    getAllRiders
};
