const express = require('express');
const services = require('../services/routerservices')
const route = express.Router();

route.get ('/profile', services.profile)
route.post('/newbook' , services.newbook);
route.get('/books', services.getbooks);
route.post('/changepassword', services.changepassword)
// route.post('/newcustomer', services.login);
// route.post('/newentry' , services.activation);

module.exports= route;