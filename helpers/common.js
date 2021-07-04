const bcrypt = require('bcrypt'),
	mongoose = require("mongoose"),
	jwt = require('jsonwebtoken');

const User = mongoose.model('user');

const saltRounds = 10,
	authKey = 'dJHQbHirBcmVtQvO';


exports.encrypt_password = (password)=>{
	return bcrypt.hashSync(password, saltRounds);
}

exports.decrypt_password = (check_password,password)=>{
	return bcrypt.compareSync(check_password, password);
}

exports.createPayload = (key) => {
	let payload = { secret : key }
	let token = jwt.sign(payload, authKey, { expiresIn: 180 * 60 });
	return token;    
}

exports.tokenMiddleware = (req,res,next) => {
	try{
		let token = req.headers['authorization'];
		if(!token){
			return res.status(401).send('unauthorized')
		}
		token = token.split(' ')[1];
		if(!token){
			return res.status(401).send('unauthorized')
		} else {
			let payload = jwt.verify(token, authKey)
			User.findOne({email:payload.secret.email},(err,userData)=>{
				if(err || !userData){
					return res.status(401).send('unauthorized')
				}
				req.userDetail = userData;
				next();
			})
		}
	}
	catch(e){
		console.log(e)
		return res.status(401).send('unauthorized')
	}
}