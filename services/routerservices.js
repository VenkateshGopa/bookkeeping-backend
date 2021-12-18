const  mongo  = require('../db/mongo');
const {ObjectId} =  require('mongodb');
const bcrypt = require('bcrypt');
const services = {
    newbook: async (req, res) => {
        try{
            req.body.name = req.body.name.toLowerCase();
            const book = await mongo.db.collection('notes').findOne({ $and : [{id:req.user}, {name:req.body.name}] });

            if(!book)
            await mongo.db.collection('notes').insertOne({id:req.user , name: req.body.name , trans:[]})
            await mongo.db.collection('notes').updateOne(
                { $and : [{id:req.user}, {name:req.body.name}] },
                { $push: { trans: {...req.body} } }
            )
            const data = await mongo.db.collection('notes').findOne({ $and : [{id:req.user}, {name:req.body.name}] })
            let amount = 0;
            for (let i=0; i<data.trans.length ; i++){
                if(data.trans[i].type === 'got')
                {
                    amount = amount + (+data.trans[i].amount)
                }
                else{
                    amount = amount - (+data.trans[i].amount)
                }
            }
            if(amount > 0)
            {
            await mongo.db.collection('notes').updateOne(
                { $and : [{id:req.user}, {name:req.body.name}] },
                { $set: { bal: amount , transaction:"You'll Give" } }
            )
            }
            else
            {
            await mongo.db.collection('notes').updateOne(
                { $and : [{id:req.user}, {name:req.body.name}] },
                { $set: { bal: amount , transaction:"You'll Get" } }
            )
            }
            res.send('added');
        }
        catch(error){
            res.status(400).send({error});
        }
    },
    getbooks: async(req, res) =>{
        const data = await mongo.db.collection('notes').find({id:req.user}).toArray();
        res.send(data)
    },
    profile: async(req, res) =>{
        const data = await mongo.db.collection('userdetails').findOne({_id: ObjectId(req.user)});
        res.send(data)
    },
    changepassword:async(req, res) =>{
        const salt = await bcrypt.genSalt();
        req.body.password = await bcrypt.hash(req.body.password , salt);
        await mongo.db.collection('userdetails').updateOne({_id: ObjectId(req.user)} , {$set:{password: req.body.password}})
        res.send("changed");
    },
}

module.exports = services;
