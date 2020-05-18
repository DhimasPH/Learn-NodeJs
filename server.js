// Set up requirement
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const app = express();
const router = express.Router();

//set up local
const config = require('./app/config');
const User = require('./app/models/user');
const port = 4000;

app.use(cors())
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
mongoose.connect(config.database, { useNewUrlParser: true , useUnifiedTopology: true });
app.set('secretKey',config.secret);

// API
router.post('/login',function(req,res){
    var username = req.body.email;
    var pass = req.body.password;
    User.findOne({
        email : username
    }, function (err,user){
        if(err) throw err;

        if(!user){
            res.json({'success' : false , 'message' : 'User not found'})
        }else{
            if(user.password != pass){
                res.json({'success' : false , 'message' : 'Wrong password'})                
            }else{
                //mebuat token
                var token = jwt.sign(user.toJSON(),app.get('secretKey'),{
                    expiresIn : '24h'
                });

                //ngirim token
                res.json({
                    success : true, 
                    message : 'token berhasil di dapatkan',
                    token : token
                })
            }
        }
    }
    )
})


// set route
router.get('/', function(req,res){
    res.send('ini di route home');
});

//proteksi route dengan token
router.use(function(req,res,next){
    //mengambil token
    var token  = req.headers['authorization'];

    //decode token
    if(token){
        jwt.verify(token,app.get('secretKey'),function(err,decoded){
            if(err){
                return res.json({success : false , message : 'token bermasalah'})
            }else{
                req.decoded = decoded;

                // cek expired token 
                if(decoded.exp <= Date.now()/1000){
                    res.status(400).send({
                        success : false,
                        message : 'token sudah expired',
                        'date' : Date.now()/1000,
                        exp : decoded.exp
                    })
                }
                next();
            }
        });
    }else{
        res.status(403).send({
            success : false,
            'message' : 'token tidak tersedia'
        })
    }

})

router.get('/users',function(req,res){
    User.find({}, function(err,users){
        res.json(users);
    });
});

router.get('/profile',function(req,res){
    res.json(req.decoded);
})

//prefix api
app.use('/api',router);


app.listen(port);