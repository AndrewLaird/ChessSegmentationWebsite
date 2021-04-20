const express = require("express");
const compression = require("compression");
const cors = require('cors')

const _port = process.env.PORT || 4100;
const _app_folder = 'dist/ChessTutor';

const app = express();
app.use(compression());

var api = require('./api/api.js')

app.use(cors())
// middleware for cors
//app.all('*', function (req, res, next){
//    // Website you wish to allow to connect
//    res.setHeader('Access-Control-Allow-Origin', '*');
//
//    // Request methods you wish to allow
//    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//
//    // Request headers you wish to allow
//    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization');
//
//    // onto the next thing
//    next();
//
//})
// --- API
app.use('/api', api);

// ---- SERVE STATIC FILES ---- //
app.get('*.*', express.static(_app_folder, {maxAge: '1y'}));

// ---- SERVE APLICATION PATHS ---- //
app.all('*', function (req, res) {
    res.status(200).sendFile(`/`, {root: _app_folder});
});

// ---- START UP THE NODE SERVER  ----
app.listen(_port, function () {
    console.log("Node Express server for " + app.name + " listening on http://localhost:" + _port);
});
