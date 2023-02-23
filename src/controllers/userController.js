const bcryptjs = require('bcryptjs');
const { validationResult } = require('express-validator');

const User = require('../models/User');

const controller = {
    register: (req, res) => {
        return res.render('users/register');
    },

    processRegister: (req, res) => {
        const resultValidation = validationResult(req);

        if (resultValidation.errors.length > 0) {
            return res.render('users/register', {
                errors: resultValidation.mapped(),
                oldData: req.body
            });
        }

        let userInDB = User.findByField('email', req.body.email);
            if (userInDB){
                return res.render('users/register', {
                    errors: {
                        email: {
                            msg: 'Este email ya esá registrado'
                        }
                    },
                    oldData: req.body
                });
            }

        let userToCreate = {
            ...req.body,
            password: bcryptjs.hashSync(req.body.password, 10),
            imagen: req.file.filename
        }

        let userCreated = User.create(userToCreate);

        return res.redirect('/users/login');
    },

    login: (req,res) => {
        return res.render('users/login');
    },

    loginProcess: (req,res) => {
        let userToLogin = User.findByField('email', req.body.email);
        
        if(userToLogin) {
            let isOkPassword = bcryptjs.compareSync(req.body.password, userToLogin.password);
            if (isOkPassword) {
                delete userToLogin.password;
                req.session.userLogged = userToLogin;
                return res.redirect('/user/userProfile');
            }
            return res.render('users/login', {
                errors: {
                    email: {
                        msg: 'Las credenciales son invalidas'
                    }
                }
            });
        }
        return res.render('users/login', {
            errors: {
                email: {
                    msg: 'No se encuentra este email en nuestra base de datos'
                }
            }
        });
    },
    
    profile: (req,res) => {
        return res.render('userProfile', {
            user: req.session.userLogged
        });
    },

    logout: (req, res) => {
        req.session.destroy();
        return res.redirect('/');
    }
}

module.exports = controller;