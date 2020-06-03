// Set up requirement
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const app = express();
const router = express.Router();
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

//set up local
const config = require('./app/config');
const User = require('./app/models/user');
const port = 4000;

app.use(cors())
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
mongoose.connect(config.database, { useNewUrlParser: true , useUnifiedTopology: true });
app.set('secretKey',config.secret);

// Routes
const users = require('./app/routes/users');

// set route
app.get('/', function(req,res){
    res.send('ini di route home');
});


// API GLOBAL
app.post('/login',function(req,res){
    var username = req.body.email;
    var pass = req.body.password;
    User.findOne({
        email : username
    }, function (err,user){
        if(err) throw err;

        if(!user){
            res.json({'success' : false , 'message' : 'User not found'})
        }else{
            if(bcrypt.compareSync(pass,user.password)){
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
            }else{
                res.json({'success' : false , 'message' : 'Wrong password '})                
            }
        }
    }
    )
})

//proteksi route dengan token
app.use(function(req,res,next){
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

app.get('/profile',function(req,res){
    res.json(req.decoded);
});

//prefix api
app.use('/api/users/',users);


app.listen(port);
