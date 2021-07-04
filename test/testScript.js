const common = require("../helpers/common");

const faker = require('faker'),
    mongoose = require('mongoose'),
    jwt = require('jsonwebtoken');

const User = mongoose.model('user'),
    Post = mongoose.model('post');

module.exports.getInvalidToken = () =>{
    return new Promise((resolve,reject)=>{
        var JWTtoken = common.createPayload({
            name:faker.internet.userName(),
            email:faker.internet.email()
        })
        return resolve(JWTtoken)
    })
}
module.exports.getValidToken = (type="") =>{
    return new Promise((resolve,reject)=>{
        User.findOne({},(err,data)=>{
            if(!data){
                User.create({
                    name:faker.internet.userName(),
                    email:faker.internet.email(),
                    password:'welcome'
                },(err,resdata)=>{
                    var JWTtoken = common.createPayload({
                        name:resdata.name,
                        email:resdata.email
                    })
                    if(type == 'withId'){
                        return resolve({JWTtoken,id:resdata._id})
                    }
                    else{
                        return resolve(JWTtoken)                    
                    }
                })
            }
            else{
                var JWTtoken = common.createPayload({
                    name:data.name,
                    email:data.email
                })
                if(type == 'withId'){
                    return resolve({JWTtoken,id:data._id})
                }
                else{
                    return resolve(JWTtoken)                    
                }
            }
        })
    })
}
module.exports.getPostId = (userId) =>{
    return new Promise((resolve,reject)=>{
        Post.findOne({user_id:userId,deleted:false},(err,data)=>{
            if(!data){
                Post.create({
                    title:faker.internet.userName(),
                    user_id:userId
                },(err,resdata)=>{
                    return resolve(resdata._id)
                })
            }
            else{
                return resolve(data._id) 
            }
        })
    })
}