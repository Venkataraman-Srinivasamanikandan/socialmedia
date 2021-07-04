const mongoose = require('mongoose'),
	mongoose_delete = require("mongoose-delete");

const Schema = mongoose.Schema;

var postschema = new Schema({
	"user_id":{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        index:true
    },
    "title": {
		type: String,
		required: true,
		trim: true,
		index: true
	},
	"description": {
		type: String,
		default: "",
		trim: true
	},
	"image": {
		type: String,
		default: ""
	},
},
{ timestamps: true }
);
postschema.plugin(mongoose_delete,{deletedAt:true});

module.exports = mongoose.model('post', postschema, 'post');
