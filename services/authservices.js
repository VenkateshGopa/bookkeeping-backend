const  mongo  = require('../db/mongo');
const {ObjectId} =  require('mongodb')
const bcrypt = require('bcrypt');
const jwt =  require('jsonwebtoken');
const email = require('../Emailer/emailer');
const schema = require('../schema/authschema');

const services = {

  register: async (req, res) => {
    try{
        const {error, value}= await schema.registerSchema.validate(req.body);
        if(error) return res.status(400).send({error:error.details[0].message});

        value.email = value.email.toLowerCase();

        // checking weather user already registered or not
        const user = await mongo.db.collection('userdetails').findOne({email:value.email});
        if(user) return res.status(403).send({error:"Email already registered!"})

        //encrypting password
        const salt = await bcrypt.genSalt();
        value.password = await bcrypt.hash(value.password , salt);

        // adding user to database
        const registereduser = await mongo.db.collection('userdetails').insertOne(value);
        // adding note 
        // console.log(registereduser)
        // const addnote  = await mongo.db.collection('notes').insertOne({id: (registereduser.insertedId).toString() , name:value.firstname , default:true});
        //sending email
        //await email(value.email , `https://nervous-poitras-54f763.netlify.app/active/${registereduser.insertedId}`);
      await email(value.email , `<h2>Hello ${user.firstname} ${user.lastname},</h2> <p> Book keeping account has been created Successfully. The below Link to Activate your book keeping account.</p>  
      <span><a href="https://nervous-poitras-54f763.netlify.app/active/${registereduser.insertedId}">Click here</a> to activate your account</span>
      <P>(or) Use the below link</p>
      <p>https://nervous-poitras-54f763.netlify.app/active/${registereduser.insertedId}</p>`);
        res.status(201).send({message:"registered Succesfully"});
    }
    catch(error){
        res.status(400).send({error});
    }
  },

  activation : async(req, res) => {
      try{
        const {error, value}= await schema.activationschema.validate(req.body);
        if(error) return res.status(403).send({error:error.details[0].message});

        const checkactivated = await mongo.db.collection('userdetails').findOne({ $and : [{_id: ObjectId(value.id)}, {active: true}] });
        if(checkactivated) return res.status(403).send({error:"Your account already activated "})

        await mongo.db.collection('userdetails').updateOne({_id: ObjectId(value.id)}, {$set:{active: true}})
        res.send({message:'Thank You, Your Book Keeping account is activated'})
      }
      catch{
        res.status(400).send({error:"Invalid link click below button to login"});
      }
  },

  login: async(req, res) => {
     try{
        
        const {error, value}= await schema.loginSchema.validate(req.body);
        if(error) return res.status(403).send({error:error.details[0].message});

        value.email = value.email.toLowerCase();
        // checking weather user exists
        const user = await mongo.db.collection('userdetails').findOne({email:value.email});
        if(!user) return res.status(403).send({error:"Email not registered"})

        // checking weather activated or not 
        const checkactivated = await mongo.db.collection('userdetails').findOne({ $and : [{email:value.email}, {active:{$exists: true}}] });
        if(!checkactivated) return res.status(403).send({error:"Account not activated check your mail and activate your account"})

        //checking weather the entered password is correct or not
        const data = await bcrypt.compare(value.password, user.password);
        if(data){
            const token = await jwt.sign({UserId: user._id }, process.env.pass);
            return res.send({token});
        }
        else{
            return res.status(403).send({error:"email or passwod invalid"})
        }
     }
     catch(error){
        res.status(400).send(error);
     }
  },

  forgotpassword: async(req, res) => {
    try{
      const{error , value} = await schema.forgetPasswordSchema.validate(req.body);
      if(error) return res.status(403).send(error.details[0].message)

      value.email = value.email.toLowerCase();

      // checking weather user exists
      const user = await mongo.db.collection('userdetails').findOne({email:value.email});
      if(!user) return res.status(403).send({error:"Email not registered"})
      const code = Math.random().toString(36).slice(-6);
      await email(value.email , `<h2>Hello ${user.firstname} ${user.lastname},</h2> <p> A request has been received to change the password for your account. The below Link to reset your account password is only valid for 30Minutes.</p>  
      <span><a href="https://nervous-poitras-54f763.netlify.app/${user._id}/${code}">Click here</a> to reset your password</span>
      <P>(or) Use the below link</p>
      <p>https://nervous-poitras-54f763.netlify.app/${user._id}/${code}</p>`);
//       await email(value.email , `https://nervous-poitras-54f763.netlify.app/${user._id}/${code}`);
      await mongo.db.collection('userdetails').updateOne({email:value.email} , {$set:{code: code, time:(value.time +1800000)} })
      res.send({message:"email send successfully"})
    }
    catch(error){
        res.status(400).send(error);
    }
    },

    createnewpassword: async(req, res) =>{
        try{
        const{error , value} = await schema.Newpasswordschema.validate(req.body);
        if(error) return res.status(403).send({error:error.details[0].message})
        const salt = await bcrypt.genSalt();
        value.password = await bcrypt.hash(value.password , salt);
        await mongo.db.collection('userdetails').updateOne({_id: ObjectId(value.id)} , {$set:{password: value.password}, $unset:{code: "" , time:""}})
        return res.send({message: "password changed"})
        }
        catch{
            res.send({error:"failed to change password"})
        }
    },

    linkvalid: async(req, res) =>{
    try{
      const{error , value} = await schema.linkvalid.validate(req.body);
      if(error) return res.status(403).send(error.details[0].message)
      const user = await mongo.db.collection('userdetails').findOne({_id: ObjectId(value.id)});
      if(user.time > value.time ){
          if(user.code === value["code"]){
            return res.send({message:"true"})
          }
          else{
              return res.status(400).send({message:"Copy the link completely"})
          }
      }
      else{
          return res.status(400).send({message:"link expired"})
      }
    }
    catch{
        res.status(400).send({message:"Something went wrong"})
    }
}
};

module.exports = services;
