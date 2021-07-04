const server = require('../server');

const chai = require('chai'),
    chaiHttp = require('chai-http'),
    faker = require('faker');

chai.use(chaiHttp);
chai.should();

const common = {
    email : faker.internet.email(),
    emailWithImage : faker.internet.email(),
}

describe('REGISTER API TEST CASES', () => {
    it("It should not register the user if they didn't send the required parameters", (done)=>{
        let requestData = {};
        chai
            .request(server)
            .post("/api/v1/user/register")
            .send(requestData)
            .end((err,res)=>{
                res.status.should.be.equal(400);
                res.text.should.be.equal('Invalid parameters');
                done();
            })
    })
    it("It should not register the user if they upload profile image other than .png, .jpg and .jpeg format", (done)=>{
        let requestData = {
            email:faker.internet.email(),
            password:"welcome",
            name:faker.internet.userName()
        };
        chai
            .request(server)
            .post("/api/v1/user/register")
            .set('Content-type', "application/x-www-form-urlencoded")
            .field(requestData)
            .attach("image",__dirname+"/testFiles/dummy.pdf")
            .end((err,res)=>{
                res.status.should.be.equal(500);
                res.text.should.be.equal('Only .png, .jpg and .jpeg format allowed!');
                done();
            })
    })
    it("It should not register the user if they upload profile image larger than 1mb", (done)=>{
        let requestData = {
            email:faker.internet.email(),
            password:"welcome",
            name:faker.internet.userName()
        };
        chai
            .request(server)
            .post("/api/v1/user/register")
            .set('Content-type', "application/x-www-form-urlencoded")
            .field(requestData)
            .attach("image",__dirname+"/testFiles/Sample-jpg-image-2mb.jpg")
            .end((err,res)=>{
                res.status.should.be.equal(500);
                res.text.should.be.equal('File too large');
                done();
            })
    })
    it("It should register the user if they provide all the required parameters (with out profile image)", (done)=>{
        let requestData = {
            email:common.email,
            password:"welcome",
            name:faker.internet.userName()
        };
        chai
            .request(server)
            .post("/api/v1/user/register")
            .send(requestData)
            .end((err,res)=>{
                res.status.should.be.equal(200);
                res.body.should.be.a("object");
                done();
            })
    })
    it("It should register the user if they provide all the required parameters (with profile image)", (done)=>{
        let requestData = {
            email:common.emailWithImage,
            password:"welcome",
            name:faker.internet.userName()
        };
        chai
            .request(server)
            .post("/api/v1/user/register")
            .set('Content-type', "application/x-www-form-urlencoded")
            .field(requestData)
            .attach("image",__dirname+"/testFiles/point-shoot-zoom-digital-camera-9433239.jpg")
            .end((err,res)=>{
                res.status.should.be.equal(200);
                res.body.should.be.a("object");
                done();
            })
    })
    it("It should not register the user if the provided email already exists", (done)=>{
        let requestData = {
            email:common.email,
            password:"welcome",
            name:faker.internet.userName()
        };
        chai
            .request(server)
            .post("/api/v1/user/register")
            .send(requestData)
            .end((err,res)=>{
                res.status.should.be.equal(400);
                res.text.should.be.equal('Email is already taken');
                done();
            })
    })
    it("It should not register the user if the provided email already exists (should not be case sensitive)", (done)=>{
        let requestData = {
            email:common.email.toUpperCase(),
            password:"welcome",
            name:faker.internet.userName()
        };
        chai
            .request(server)
            .post("/api/v1/user/register")
            .send(requestData)
            .end((err,res)=>{
                res.status.should.be.equal(400);
                res.text.should.be.equal('Email is already taken');
                done();
            })
    })
})
describe('LOGIN API TEST CASES', () => {
    it("It should not login the user if they didn't send the required parameters", (done)=>{
        let requestData = {};
        chai
            .request(server)
            .post("/api/v1/user/login")
            .send(requestData)
            .end((err,res)=>{
                res.status.should.be.equal(400);
                res.text.should.be.equal('Invalid parameters');
                done();
            })
    })
    it("It should not login the user if the provided email dosen't exists", (done)=>{
        let requestData = {
            email:faker.internet.email(),
            password:"welcome",
        };
        chai
            .request(server)
            .post("/api/v1/user/login")
            .send(requestData)
            .end((err,res)=>{
                res.status.should.be.equal(400);
                res.text.should.be.equal("Email doesn't exists");
                done();
            })
    })
    it("It should not login the user if the provided password is incorrect", (done)=>{
        let requestData = {
            email:common.email,
            password:"welcomee",
        };
        chai
            .request(server)
            .post("/api/v1/user/login")
            .send(requestData)
            .end((err,res)=>{
                res.status.should.be.equal(400);
                res.text.should.be.equal("Invalid password");
                done();
            })
    })
    it("It should login the user if provided credentials are correct", (done)=>{
        let requestData = {
            email:common.email,
            password:"welcome",
        };
        chai
            .request(server)
            .post("/api/v1/user/login")
            .send(requestData)
            .end((err,res)=>{
                res.status.should.be.equal(200);
                done();
            })
    })
    it("It should login the user if provided credentials are correct (to check email with image)", (done)=>{
        let requestData = {
            email:common.emailWithImage,
            password:"welcome",
        };
        chai
            .request(server)
            .post("/api/v1/user/login")
            .send(requestData)
            .end((err,res)=>{
                res.status.should.be.equal(200);
                done();
            })
    })
    it("It should login the user if provided credentials are correct (should not be case sensitive)", (done)=>{
        let requestData = {
            email:common.email.toUpperCase(),
            password:"welcome"
        };
        chai
            .request(server)
            .post("/api/v1/user/login")
            .send(requestData)
            .end((err,res)=>{
                res.status.should.be.equal(200);
                done();
            })
    })
})
describe('SAMPLE API', () => {
    it("It should send success", (done)=>{
        chai
            .request(server)
            .get("")
            .end((err,res)=>{
                res.status.should.be.equal(200);
                done();
            })
    })
})