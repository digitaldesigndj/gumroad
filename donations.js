/**
 * Module dependencies.
 * Responds to donation webhook, gumroad.js in starbound-today created purchase records.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var crypto = require('crypto');
var fs = require('fs');

var secrets = require('./config/secrets');
var mongoose = require('mongoose');
mongoose.connect(secrets.db);
var nodemailer = require("nodemailer");
var smtpTransport = nodemailer.createTransport('SMTP', {
  service: 'Mailgun',
  auth: {
    user: secrets.mailgun.login,
    pass: secrets.mailgun.password
  }
});

var Player = require('./models/Player');

var app = express();

// all environments
app.set('port', process.env.PORT || 3003);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

app.get('/', function( req, res ) { res.send('The application is listening'); });

// Webhook responder
app.post('/secret', function( req, res ) {
  console.log( 'Webhook!', req.body );
  res.set('Content-Type', 'text/plain');
  //" + req.header('host') + "
  Player.findOne({ email: req.body.email }, function(err, user) {
    if (err) {
      console.log( err );
      res.end("http://boundstar.com/register?email=" + req.body.email );
    }
    else {
      res.end("http://boundstar.com/thanks");
    }
  });
});
