'use strict'

//Modulos
var express = require('express');
var bodyParse = require('body-parser');


// Ejecutar Express
var app = express();

//Ficheros y rutas
var article_routes = require('./routes/article');

//Middlewares
app.use(bodyParse.urlencoded({extended: false}));
app.use(bodyParse.json());

//CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


//Prefix routes
app.use('/api', article_routes);

//Export module
module.exports = app;
