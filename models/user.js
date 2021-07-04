const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var userschema = new Schema({
	"name": {
		type: String,
		required: true,
		trim: true
	},
	"email": {
		type: String,
		match: /.+@.+\..+/,
		required: true,
		lowercase: true,
		unique: true,
		index: true
	},
	"password": {
		type: String,
		required: true
	},
	"image": {
		type: String,
		default: ""
	},
},
{ timestamps: true }
);

module.exports = mongoose.model('user', userschema, 'user');
