var jimp = require('jimp'),
    images = require("images"),
    url = require("url"),
    fs = require('fs'),
    request = require('request');

const FB = require('fb');

var popeImage = "papajmaly.png";
var baseImage = 'received.jpg';

var baseUrl = "https://www.shitpostbot.com/";
var requestUri = "api/randsource";
var imageUri;

const http = require('http');
const https = require('https');

const hostname = 'localhost';
const port = 8081;

//images(imagePathBase).draw(images(popeImage).resize(180), 245, 120).save("output.jpg");

https.get(baseUrl + requestUri, (resp) => {
  let data = '';

  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    imageUri = JSON.parse(data).sub.img.full;
    request(baseUrl + imageUri).pipe(fs.createWriteStream(baseImage));
    console.log("Response received. " + baseUrl + imageUri);
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  //res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Type', 'application/json');
  //res.write(data);
  res.end();
  jimp.read(baseImage, (err, image) => {
    if (err) throw err;
    var size = Math.floor((Math.random() * (image.bitmap.width/2)) + 1);
    var x = Math.floor((Math.random() * (image.bitmap.width/2)) + 1);
    var y = Math.floor((Math.random() * (image.bitmap.height/2)) + 1);
    console.log(size);
    console.log(x);
    console.log(y);
    images(baseImage).draw(images(popeImage).resize(size), x, y).save("output.jpg");
    // fs.unlink(baseImage, function (err) {
    //   if (err) throw err;
    //   console.log('File deleted!');
    // });
    res.end();
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

