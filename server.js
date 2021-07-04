require('dotenv').config();

const config = require("./Nodedetails/config"),
	db = require("./models/db"),
	port = config.port;

const createError = require('http-errors'),
	express = require('express'),
	path = require('path'),
	cookieParser = require('cookie-parser'),
	logger = require('morgan'),
	fs = require("fs"),
	https = require('https'),
	useragent = require('express-useragent'),
	bodyParser = require('body-parser'),
	cors = require('cors'),
	mongoose = require("mongoose"),
	http = require('http'),
	compression = require('compression');

	
const app = express();

// view engine setup
app.use(compression())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

if(process.env.NODE_ENV == 'production') {
	//This if block will block all other origins except the frontend Domain that is provided in this block.
	var whitelist = 'your production domain here';
	var corsOptions = {
		origin: function (origin, callback) {
			if (origin.search("^.*"+whitelist+".*$")>-1) {
					callback(null, true)
			} else {
					callback(new Error('Not allowed by CORS'))
			}
		},
		optionsSuccessStatus: 200, 
		methods:['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
		allowedHeaders:['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'cache-control', 'authorization'],
		credentials: true
	}
	app.use(cors(corsOptions))
}
else{
	app.use(cors());
}



app.use(useragent.express());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const user = require('./routes');

app.use('/api/v1',user);

app.get("/",(req,res)=>{
	return res.json({msg:'Hello'})
})

if(process.env.NODE_ENV == 'local' || !process.env.NODE_ENV){
	var server = http.createServer(app);
}
else if(process.env.NODE_ENV == 'development'){  
	var options = {
		key: fs.readFileSync(config.key),
		cert: fs.readFileSync(config.crt),
	};  
	var server = https.createServer(options,app);
}
else{
	var options = {
		key: fs.readFileSync(config.key),
		cert: fs.readFileSync(config.crt),
	};    
	var server = https.createServer(options,app);
}

server.listen(port, () => console.log(`Express server running on port `+port));

// error handler
app.use(function(err, req, res, next) {
	return res.status(err.status || 500).send(err.message);
});

module.exports = server;


