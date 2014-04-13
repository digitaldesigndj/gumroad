/**
 * Module dependencies.
 * Responds to donation webhook and creates products on notification
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

var Donation = require('./models/Donation');
var User = require('./models/User');

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
  User.findOne({ email: req.body.email }, function(err, user) {
    if (err) {
      console.log( err );
      return res.send("http://boundstar.com/register?email=" + req.body.email );
    }
    else {
      return res.send("http://boundstar.com/thanks" + req.body.email );
    }
  });
});

app.post('/gumroad', function( req, res ) {
  console.log( req.body );  
  if ( req.body.test ) {
    console.log( 'this was a test' );
  }
  if ( req.body.seller_id === secrets.gumroad.seller_id ) {
    // && req.body.test != 'true' ) { ??
    var hash = crypto.createHash('md5').update(JSON.stringify(req.body)+Math.random()).digest("hex");
    var mailOptions = {
      to: req.body.email,
      from: 'tdy721@gmail.com',
      subject: 'Thanks for your donation',
      text: 'It looks like you have not yet registered, your member code is this url: http://starbound.today/donation/' + hash
      // , html: fs.readFileSync('./public/email/donation_thanks.html').toString().replace(/\{\{code\}\}/g, hash)
    };
    // This is a donation 
    console.log( req.body );
    var donation = new Donation({
      url_hash: hash,
      seller_id: req.body.seller_id,
      product_id: req.body.product_id,
      product_name: req.body.product_name,
      permalink: req.body.permalink,
      product_permalink: req.body.product_permalink,
      email: req.body.email,
      price: req.body.price,
      currency: req.body.currency,
      order_number: req.body.order_number,
      full_name: req.body.full_name || '',
      test: req.body.test || false,
      offer_code: req.body.offer_code || false
    });

    Player.findOne({ email: req.body.email }, function(err, player) {
      if (err) return next(err);
      console.log(player);
      if( player != null ) {
        console.log(req.body.full_name);
        // player.name = req.body.full_name;
        var total = req.body.price;

        donation.claimed = true;
        donation.save(function(err) {
          if (err) { return err; }
            console.log( 'donation saved' );
            player.save(function(err) {
              console.log( 'User donated, '+req.body.email+' has been creditied' );
              mailOptions.text = "Thank's for your support!";
              smtpTransport.sendMail(mailOptions, function(err) {
                if (err) { return err; }
                res.redirect('/');
              });
            });
        });
      }else{
        console.log( 'eMailed member code to '+req.body.email+', Waiting to be claimed' );
        donation.save(function(err) {
          if (err) { return err; }
            console.log( 'donation saved' );
            smtpTransport.sendMail(mailOptions, function(err, response) {
              if (err) { return err; }
              console.log( response );
              res.redirect('/');
            });
        });
      }
    });
  }
  else {
    return res.send("go away, seller_id did not match.");
  }
});
