import validator from "validator";
import User from "../models/user.model.js";

// Check if email is valid
export const checkEmail = async (req,res) => {
  try{
    const email=req?.query?.email
  const isRealEmail = validator.isEmail(email); // Boolean
  if (isRealEmail) {
      return res.status(200).json({ message: "correct email",isCorrect:true }); // 
    }else{
    res.status(200).json({"message":"email not available",isCorrect:true });
    }
  }catch (err) {
    // Proper error response
    throw new Error(`Error checking email availability: ${err.message}`);
  }
  
  
};

// Check if username is available
export const checkUsernameAvailable = async (req, res) => {
  try {
    // countDocuments returns a number
    const username = req.query.username;
    const count = await User.countDocuments({ userName: username }).limit(1);

    
    
    if (!(count===0)) {
      return res.status(200).json({ error: "Username already taken",available: false }); // Conflict
    }
    res.json({ available: true });
    
  } catch (err) {
    // Proper error response
    throw new Error(`Error checking username availability: ${err.message}`);
  }
};

