/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var purchases = require('./routes/purchases');
var http = require('http');
var path = require('path');

var sys = require('sys');
var exec = require('child_process').exec;

function puts(error, stdout, stderr) { sys.puts(stdout) }

var fs = require('fs');

var app = express();

// all environments
app.set('port', 3030); // process.env.PORT || 3030);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/purchases', purchases.list);

app.post('/secret', function(req,res){
  console.log( req.body );
  // console.log( req.body['subdomain/username'] );
  // var sites = fs.readdirSync('/etc/nginx/sites-available');
  // console.log(sites);
  // console.log( sites.length );
  console.log( req.header('host') );
  // res.send("http://sticko.tdy721.com/?user="+req.body['subdomain/username']);
  console.log( 'bash blog.sh '+req.body['subdomain/username']+'.tdy721 com 3015');
  // exec("bash blog.sh" , puts);
  res.set('Content-Type', 'text/plain');
  return res.send("http://gum.hyprtxt.com/webhook-success/");
  // res.send("http://" + (req.header('host')) + "/?slug=THATROCKS" );
});

app.get('/webhook-success/', function(req, res) {
  return res.send("Hi ! DOOD!");
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
