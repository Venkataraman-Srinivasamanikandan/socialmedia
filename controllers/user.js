//Requiring Files
const common = require("../helpers/common"),
    config = require("../Nodedetails/config");

//Requiring Library
const mongoose = require("mongoose"),
    validator = require("node-validator");

//Requiring DB Collections
const User = mongoose.model('user');

module.exports={
    register:(req,res)=>{
        try{
            var requestData = req.body;
            var check = validator.isObject()
            .withRequired('email',validator.isString({regex:/.+@.+\..+/}))
            .withRequired('name',validator.isString({regex:/^(?=.*[\w\d]).+/}))
            .withRequired('password',validator.isString({regex:/^(?=.*[\w\d]).+/}));
            validator.run(check,requestData,(errCount, errs)=>{
                if(errCount > 0){
                    return res.status(400).send('Invalid parameters');
                }
                requestData.image = req.file ? req.file.filename : "";
                requestData.password = common.encrypt_password(requestData.password);
                User.create(requestData,(err,insertRes)=>{
                    if(err || !insertRes){
                        if(err.code == 11000){
                            return res.status(400).send('Email is already taken');
                        }
                        return res.status(400).send('Something went wrong while registration');
                    }
                    else{
                        return res.json({
                            name: insertRes.name,
                            email: insertRes.email,
                            image: insertRes.image ? config.imageUrl+'userProfile/'+insertRes.image : ""
                        });
                    }
                })
            })
        }
        catch(err){
            return res.status(500).send('Internal server error');
        }
    },
    login:(req,res)=>{
        try{
            var requestData = req.body;
            var check = validator.isObject()
            .withRequired('email',validator.isString({regex:/.+@.+\..+/}))
            .withRequired('password',validator.isString({regex:/^(?=.*[\w\d]).+/}));
            validator.run(check,requestData,(errCount, errs)=>{
                if(errCount > 0){
                    return res.status(400).send('Invalid parameters');
                }
                User.findOne({email:requestData.email},(err,userDetail)=>{
                    if(err || !userDetail){
                        return res.status(400).send("Email doesn't exists");
                    }
                    if(!common.decrypt_password(requestData.password,userDetail.password)){
                        return res.status(400).send("Invalid password");
                    }
                    var JWTtoken = common.createPayload({
                        name: userDetail.name,
                        email: userDetail.email,
                        image: userDetail.image ? config.imageUrl+'userProfile/'+userDetail.image : ""  
                    })
                    return res.json({JWTtoken})
                })
            })
        }
        catch(err){
            return res.status(500).send('Internal server error');
        }
    },
}