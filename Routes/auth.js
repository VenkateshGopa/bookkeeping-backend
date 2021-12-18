const express = require('express');
const services = require('../services/authservices')
const route = express.Router();

route.post('/Register' , services.register);
route.post('/login', services.login);
route.post('/activation' , services.activation);
route.post('/forgotpassword', services.forgotpassword);
route.post('/Newpassword', services.createnewpassword);
route.post('/linkvalid',services.linkvalid);

module.exports= route;