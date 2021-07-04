//Requiring Files
const common = require("../helpers/common"),
    config = require("../Nodedetails/config");

//Requiring Library
const mongoose = require("mongoose"),
    validator = require("node-validator"),
    async = require("async");
const { search } = require("../routes");

//Requiring DB Collections
const Post = mongoose.model('post');

module.exports={
    addPost:(req,res)=>{
        try{
            var requestData = req.body;
            var check = validator.isObject()
            .withRequired('title',validator.isString({regex:/^(?=.*[\w\d]).+/}))
            .withOptional('description',validator.isString())
            validator.run(check,requestData,(errCount, errs)=>{
                if(errCount > 0){
                    return res.status(400).send('Invalid parameters');
                }
                requestData['user_id'] = req.userDetail._id;
                requestData['image'] = req.file ? req.file.filename : "";
                Post.create(requestData,(err,InsertedData)=>{
                    if(err || !InsertedData){
                        return res.status(400).send('Something went wrong while uploading post');
                    }
                    else{
                        return res.json({
                            title: InsertedData.title,
                            description: InsertedData.description,
                            image: InsertedData.image ? config.imageUrl+'posts/'+InsertedData.image : ""
                        });
                    }
                })
            })
        }
        catch(err){
            return res.status(500).send('Internal server error');
        }
    },
    getPosts:(req,res)=>{
        try{
            var requestData = req.body;
            var check = validator.isObject()
            .withRequired('search',validator.isString())
            .withOptional('pageNumber',validator.isNumber({min:1}))
            .withOptional('pageSize',validator.isNumber({min:5}))
            validator.run(check,requestData,(errCount, errs)=>{
                if(errCount > 0){
                    return res.status(400).send('Invalid parameters');
                }
                var limit = requestData.pageSize ? requestData.pageSize : 5;
                var skip = requestData.pageNumber ? (requestData.pageNumber-1) * limit : 0;
                async.parallel({
                    total:(cb)=>{
                        Post.countDocuments({
                            title:{$regex:requestData.search,$options:'i'},
                            'deleted':{'$ne':true}
                        }).exec(cb)
                    },
                    data:(cb)=>{
                        Post.aggregate([
                            {
                              '$match': {
                                'title': {
                                  '$regex': requestData.search,
                                  '$options': 'i'
                                },
                                'deleted':{'$ne':true}
                              }
                            }, {
                              '$sort': {
                                '_id': -1
                              }
                            }, {
                              '$skip': skip
                            }, {
                              '$limit': limit
                            }, {
                              '$lookup': {
                                'from': 'user', 
                                'localField': 'user_id', 
                                'foreignField': '_id', 
                                'as': 'userDetail'
                              }
                            }, {
                              '$unwind': {
                                'path': '$userDetail'
                              }
                            }, {
                              '$project': {
                                'title': 1, 
                                'description': 1, 
                                'image': {
                                    '$concat': [
                                        config.imageUrl+"posts/", '$image'
                                    ]
                                }, 
                                'userDetail': {
                                  'name': '$userDetail.name', 
                                  'email': '$userDetail.email', 
                                  'image': '$userDetail.image'
                                }
                              }
                            }
                        ]).exec(cb)
                    },
                },(err,result)=>{
                    if(err){
                        return res.status(400).send('Something went wrong while finding post');
                    }
                    var pagination = {
                        total:result.total,
                        currentPage: requestData.pageNumber ? requestData.pageNumber : 1,
                        endPage: parseInt((result.total + limit -1) / limit)
                    }
                    return res.json({data:result.data,pagination})
                })         
            })
        }
        catch(err){
            return res.status(500).send('Internal server error');
        }
    },
    getSinglePost:(req,res)=>{
        try{
            var {postId} = req.params; 
            if(!mongoose.mongo.ObjectID.isValid(postId)){
                return res.status(400).send('Invalid post id');
            }
            Post.aggregate([
                {
                  '$match': {
                    '_id': mongoose.mongo.ObjectId(postId),
                    'deleted':{'$ne':true}
                  }
                }, {
                  '$lookup': {
                    'from': 'user', 
                    'localField': 'user_id', 
                    'foreignField': '_id', 
                    'as': 'userDetail'
                  }
                }, {
                  '$unwind': {
                    'path': '$userDetail'
                  }
                }, {
                  '$project': {
                    'title': 1, 
                    'description': 1, 
                    'image': {
                        '$concat': [
                            config.imageUrl+"posts/", '$image'
                        ]
                    },
                    'userDetail': {
                      'name': '$userDetail.name', 
                      'email': '$userDetail.email', 
                      'image': '$userDetail.image'
                    }
                  }
                }
            ]).exec((err,postDetail)=>{
                if(err || !postDetail){
                    return res.status(400).send('Something went wrong while fetching the post detail');
                }
                else if(postDetail.length === 0){
                    return res.status(400).send('Invalid id post not found');
                }
                return res.json(postDetail[0])
            })
        }
        catch(err){
            return res.status(500).send('Internal server error');
        }
    },
    editPost:(req,res)=>{
        try{
            var requestData = req.body;
            var {postId} = req.params;
            var check = validator.isObject()
            .withRequired('title',validator.isString({regex:/^(?=.*[\w\d]).+/}))
            .withOptional('description',validator.isString())
            validator.run(check,requestData,(errCount, errs)=>{
                if(errCount > 0){
                    return res.status(400).send('Invalid parameters');
                }
                if(req.file){
                  requestData['image'] = req.file.filename;
                }
                Post.updateOne({_id:postId,user_id:req.userDetail._id,deleted:{$ne:true}},{$set:requestData},(err,updateRes)=>{
                  if(err){
                    return res.status(400).send('Something went wrong while updating post');
                  }
                  if(updateRes.n === 0){
                    return res.status(400).send("You don't have access to edit this post");
                  }
                  return res.status(200).send("Post edited successfully");
                })
            })
        }
        catch(err){
            return res.status(500).send('Internal server error');
        }
    },
    deletePost:(req,res)=>{
      try{
          var {postId} = req.params; 
          if(!mongoose.mongo.ObjectID.isValid(postId)){
              return res.status(400).send('Invalid post id');
          }
          Post.delete({_id:postId,user_id:req.userDetail._id},(err,updateRes)=>{
            if(err){
              return res.status(400).send('Something went wrong while deleting post');
            }
            if(updateRes.n === 0){
              return res.status(400).send("You don't have access to delete this post");
            }
            return res.status(200).send("Post deleted successfully");
          })
      }
      catch(err){
          return res.status(500).send('Internal server error');
      }
  },
}