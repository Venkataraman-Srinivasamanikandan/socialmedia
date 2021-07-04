const express = require('express'),
	api = express.Router(),
	path = require('path'),
	multer = require('multer');

const controllers = require('../controllers/index'),
	common = require('../helpers/common')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
		if(req.url === '/register'){
			cb(null,'./public/images/userProfile')
		}
		else{
			cb(null, './public/images/posts')
		}
	},
    filename: (req, file, cb) => {
		cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ 
	storage: storage,
    fileFilter: function (req, file, cb) {
		if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
			cb(null, true);
		} else {
			cb(null, false);
			return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
		}
    },
    limits:{
		files: 1,
        fileSize: 1024 * 1024
    }
 });

//USER ROUTES 
api.post('/user/register', upload.single('image'), controllers.user.register)
api.post('/user/login', controllers.user.login)

//POST ROUTES
api.post('/post/addPost', common.tokenMiddleware, upload.single('image') ,controllers.post.addPost)
api.post('/post/getPosts', upload.none(), common.tokenMiddleware ,controllers.post.getPosts)
api.get('/post/getSinglePost/:postId', upload.none(), common.tokenMiddleware ,controllers.post.getSinglePost)
api.put('/post/editPost/:postId', upload.single('image'), common.tokenMiddleware ,controllers.post.editPost)
api.delete('/post/deletePost/:postId', upload.none(), common.tokenMiddleware ,controllers.post.deletePost)

module.exports = api;