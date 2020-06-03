const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const config = require('../config');
const User = require('../models/user');
mongoose.connect(config.database, { useNewUrlParser: true , useUnifiedTopology: true });

const salt = bcrypt.genSaltSync(10);


class UsersController {


    static create (req,res){
        var email = req.body.email;
        var password = req.body.password;
        if(email && password){
            const Newdata = {
                email :email,
                password : bcrypt.hashSync(password,salt)
            }

            // email checking
            User.find({email : email },function(err,data){
                if(err || data.length === 0){
                    // input to db
                    User.create(Newdata, function(err,users){
                        if(err){
                            res.status(500).json({
                                status : 'failed',
                                message : 'Failed create account'
                            })
                        }else{
                            res.status(201).json({
                                status : 'success',
                                message : 'User has been created'
                            })
                        }
                    })
                }else{
                    res.status(500).json({
                        status : 'failed',
                        message : 'Email account already exist'
                    })
                }
            })

        }else{
            res.status(400).json({
                status : 'failed',
                message : 'Param not found'
            })
        }
    }

    static getAllUser(req,res){
        User.find({}, function(err,users){
            if(err || users.length === 0){
                res.status(404).json({
                    status : 'failed',
                    message : 'Data not found'
                })
            }else{
                res.status(200).json({
                    status : 'success',
                    message : users
                })
            }
        });
    }

    static getUserById(req,res){
        const userId = req.query.id;
        if(userId){
            User.find({_id : userId },function(err,users){
                if(err || users.length === 0){
                    res.status(404).json({
                        status : 'failed',
                        message : 'Data with id : '+userId+' not found'
                    })
                }else{
                    res.status(200).json({
                        status : 'success',
                        message : users
                    })
                }
            })
        }else{
            res.status(400).json({
                status : 'failed',
                message : 'Param not found'
            })
        }
    }

    static updateUsers(req,res){
        const userId = req.params.id;
        if(userId){
            User.find({_id : userId },function(err,users){
                if(err || users.length === 0){
                    res.status(500).json({
                        status : 'failed',
                        message : 'Update failed, data with id : '+userId+' not found'
                    })
                }else{
                    var email = req.body.email;
                    var password = req.body.password;
                    if(email && password){
                        const UpdateData = {
                            email :email,
                            password : bcrypt.hashSync(password,salt)
                        }
                        User.updateOne({_id : userId},UpdateData,function(err,users){
                            if(err){
                                res.status(500).json({
                                    status : 'failed',
                                    message : 'Failed create account'
                                })
                            }else{
                                res.status(200).json({
                                    status : 'success',
                                    message : 'User has been updated'
                                })
                            }
                        })
                    }else{
                        res.status(400).json({
                            status : 'failed',
                            message : 'Param not found'
                        })
                    }
                }
            })
        }else{
            res.status(400).json({
                status : 'failed',
                message : 'Param not found'
            })
        }
    }

    static deleteUsers(req,res){
        const userId = req.params.id;
        if(userId){
            User.findByIdAndDelete({_id:userId},function(err,response){
                if(err){
                    res.status(500).json({
                        status : 'failed',
                        message : 'Delete failed'
                    })
                }else{
                    res.status(200).json({
                        status : 'success',
                        message : 'Data with id : '+userId+' has been deleted'
                    })
                }
            })
        }else{
            res.status(400).json({
                status : 'failed',
                message : 'Param not found'
            })
        }
    }

}

module.exports = UsersController;