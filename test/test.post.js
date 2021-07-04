const server = require('../server'),
    testScript = require('./testScript')

const chai = require('chai'),
    chaiHttp = require('chai-http'),
    faker = require('faker');

chai.use(chaiHttp);
chai.should();

describe('ADD POST API TEST CASES', () => {
    var JWTtoken = "",
        invalidJWT = "";
    before(async()=>{
        JWTtoken = await testScript.getValidToken();
        invalidJWT = await testScript.getInvalidToken();
    })
    it("It should not allow the user to access if JWT is not provided", (done)=>{
        let requestData = {};
        chai
            .request(server)
            .post("/api/v1/post/addPost")
            .send(requestData)
            .end((err,res)=>{
                res.status.should.be.equal(401);
                done();
            })
    })
    it("It should not allow the user to access if JWT is not provided(Empty string)", (done)=>{
        let requestData = {};
        chai
            .request(server)
            .post("/api/v1/post/addPost")
            .send(requestData)
            .set("Authorization", "Bearer ")
            .end((err,res)=>{
                res.status.should.be.equal(401);
                done();
            })
    })
    it("It should not allow the user to access if userId in JWT is invalid", (done)=>{
        let requestData = {};
        chai
            .request(server)
            .post("/api/v1/post/addPost")
            .send(requestData)
            .set("Authorization", "Bearer "+invalidJWT)
            .end((err,res)=>{
                res.status.should.be.equal(401);
                done();
            })
    })
    it("It should not add post if mandatory datas are not provided", (done)=>{
        let requestData = {};
        chai
            .request(server)
            .post("/api/v1/post/addPost")
            .send(requestData)
            .set("Authorization", "Bearer "+JWTtoken)
            .end((err,res)=>{
                res.status.should.be.equal(400);
                res.text.should.be.equal("Invalid parameters");
                done();
            })
    })
    it("It should add post if mandatory datas are provided(without image)", (done)=>{
        let requestData = {
            title:"Test"
        };
        chai
            .request(server)
            .post("/api/v1/post/addPost")
            .set("Authorization", "Bearer "+JWTtoken)
            .field(requestData)
            .end((err,res)=>{
                res.status.should.be.equal(200);
                done();
            })
    })
    it("It should add post if mandatory datas are provided", (done)=>{
        let requestData = {
            title:"Test"
        };
        chai
            .request(server)
            .post("/api/v1/post/addPost")
            .set("Authorization", "Bearer "+JWTtoken)
            .attach("image",__dirname+"/testFiles/point-shoot-zoom-digital-camera-9433239.jpg")
            .field(requestData)
            .end((err,res)=>{
                res.status.should.be.equal(200);
                done();
            })
    })
})
describe('GET POST API TEST CASES', () => {
    var JWTtoken = "";
    before(async()=>{
        JWTtoken = await testScript.getValidToken();
    })
    it("It should not fetch post if mandatory datas are not provided", (done)=>{
        let requestData = {};
        chai
            .request(server)
            .post("/api/v1/post/getPosts")
            .send(requestData)
            .set("Authorization", "Bearer "+JWTtoken)
            .end((err,res)=>{
                res.status.should.be.equal(400);
                res.text.should.be.equal("Invalid parameters");
                done();
            })
    })
    it("It should fetch post if mandatory datas are provided (default pagination Data)", (done)=>{
        let requestData = {
            search:""
        };
        chai
            .request(server)
            .post("/api/v1/post/getPosts")
            .send(requestData)
            .set("Authorization", "Bearer "+JWTtoken)
            .end((err,res)=>{
                res.status.should.be.equal(200);
                done();
            })
    })
    it("It should fetch post if mandatory datas are provided(with pagination)", (done)=>{
        let requestData = {
            search:"",
            pageNumber:1,
            pageSize:5
        };
        chai
            .request(server)
            .post("/api/v1/post/getPosts")
            .send(requestData)
            .set("Authorization", "Bearer "+JWTtoken)
            .end((err,res)=>{
                res.status.should.be.equal(200);
                done();
            })
    })
})
describe('GET SINGLE POST API TEST CASES', () => {
    var userDetail = "",postId = "";
    before(async()=>{
        userDetail = await testScript.getValidToken("withId");
        postId = await testScript.getPostId(userDetail.id);
    })
    it("It should not fetch post if valid key is not provided", (done)=>{
        chai
            .request(server)
            .get("/api/v1/post/getSinglePost/sdasd")
            .set("Authorization", "Bearer "+userDetail.JWTtoken)
            .end((err,res)=>{
                res.status.should.be.equal(400);
                res.text.should.be.equal("Invalid post id");
                done();
            })
    })
    it("It should fetch post if provided key is not in DB", (done)=>{
        chai
            .request(server)
            .get("/api/v1/post/getSinglePost/60e097fc528ac52cecdc1a0c")
            .set("Authorization", "Bearer "+userDetail.JWTtoken)
            .end((err,res)=>{
                res.status.should.be.equal(400);
                res.text.should.be.equal("Invalid id post not found");
                done();
            })
    })
    it("It should fetch post if mandatory datas are provided", (done)=>{
        chai
            .request(server)
            .get("/api/v1/post/getSinglePost/"+postId)
            .set("Authorization", "Bearer "+userDetail.JWTtoken)
            .end((err,res)=>{
                res.status.should.be.equal(200);
                done();
            })
    })
})
describe('EDIT POST API TEST CASES', () => {
    var userDetail = "",postId = "";
    before(async()=>{
        userDetail = await testScript.getValidToken("withId");
        postId = await testScript.getPostId(userDetail.id);
    })
    it("It should not edit post if mandatory datas are not provided", (done)=>{
        let requestData = {};
        chai
            .request(server)
            .put("/api/v1/post/editPost/"+postId)
            .send(requestData)
            .set("Authorization", "Bearer "+userDetail.JWTtoken)
            .end((err,res)=>{
                res.status.should.be.equal(400);
                res.text.should.be.equal("Invalid parameters");
                done();
            })
    })
    it("It should not edit post if valid data are not provided", (done)=>{
        let requestData = {
            title:"asdasd"
        };
        chai
            .request(server)
            .put("/api/v1/post/editPost/60e097fc528ac52cecdc1a0c")
            .send(requestData)
            .set("Authorization", "Bearer "+userDetail.JWTtoken)
            .end((err,res)=>{
                res.status.should.be.equal(400);
                res.text.should.be.equal("You don't have access to edit this post");
                done();
            })
    })
    it("It should edit post if mandatory datas are provided(without image)", (done)=>{
        let requestData = {
            title:"Test"
        };
        chai
            .request(server)
            .put("/api/v1/post/editPost/"+postId)
            .set("Authorization", "Bearer "+userDetail.JWTtoken)
            .field(requestData)
            .end((err,res)=>{
                res.status.should.be.equal(200);
                done();
            })
    })
    it("It should edit post if mandatory datas are provided", (done)=>{
        let requestData = {
            title:"Test"
        };
        chai
            .request(server)
            .put("/api/v1/post/editPost/"+postId)
            .set("Authorization", "Bearer "+userDetail.JWTtoken)
            .attach("image",__dirname+"/testFiles/point-shoot-zoom-digital-camera-9433239.jpg")
            .field(requestData)
            .end((err,res)=>{
                res.status.should.be.equal(200);
                done();
            })
    })
})
describe('DELETE POST API TEST CASES', () => {
    var userDetail = "",postId = "";
    before(async()=>{
        userDetail = await testScript.getValidToken("withId");
        postId = await testScript.getPostId(userDetail.id);
    })
    it("It should not delete post if mandatory datas are not provided", (done)=>{
        chai
            .request(server)
            .delete("/api/v1/post/deletePost/hgcjghcjh")
            .set("Authorization", "Bearer "+userDetail.JWTtoken)
            .end((err,res)=>{
                res.status.should.be.equal(400);
                res.text.should.be.equal("Invalid post id");
                done();
            })
    })
    it("It should not delete post if valid data are not provided", (done)=>{
        chai
            .request(server)
            .delete("/api/v1/post/deletePost/60e097fc528ac52cecdc1a0c")
            .set("Authorization", "Bearer "+userDetail.JWTtoken)
            .end((err,res)=>{
                res.status.should.be.equal(400);
                res.text.should.be.equal("You don't have access to delete this post");
                done();
            })
    })
    it("It should delete post if mandatory datas are provided", (done)=>{
        chai
            .request(server)
            .delete("/api/v1/post/deletePost/"+postId)
            .set("Authorization", "Bearer "+userDetail.JWTtoken)
            .end((err,res)=>{
                res.status.should.be.equal(200);
                done();
            })
    })
})