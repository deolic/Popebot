import 'dotenv/config';
import FB from 'fb';
import jimp from 'jimp';
import got from 'got';
import fs from 'fs';
import sharp from 'sharp';

let baseUrl = 'https://www.shitpostbot.com';
let requestUri = '/api/randsource';
let fullUrl;

let popeImage = 'papajmaly.png';
let baseImage = 'received.jpg';

FB.setAccessToken(process.env.FB_API_KEY);

got(baseUrl + requestUri)
  .then(function (response) {
    let imageUri = JSON.parse(response.body).sub.img.full;
    fullUrl = baseUrl + JSON.parse(response.body).sub.link;
    sendRequest(baseUrl + '/' + imageUri, baseImage);
  })
  .catch(function (error) {
    console.log(error);
  });

function sendRequest(url, image) {
    try {
      let myStream = got.stream(url).pipe(fs.createWriteStream(image));
      console.log(`File downloaded to ${image}.`);
      myStream.on('close', () => {
        editImage(image);
      });
    } catch (error) {
      console.error(`Something went wrong. ${error.message}`);
    }
}

function editImage(baseImage) {
  jimp.read(baseImage, (err, image) => {
    if (err) throw err;
    let x = Math.floor((Math.random() * image.bitmap.width) + 1);
    let y = Math.floor((Math.random() * image.bitmap.height) + 1);
    let popeWidth, popeHeight;
    if (image.bitmap.width < image.bitmap.height) {
      popeWidth = Math.floor((Math.random() * (image.bitmap.width/2)) + 5);
      sharp(popeImage).resize({ width: popeWidth }).toBuffer().then((rescaledPope) => {
        sharp(rescaledPope).metadata().then((metadata) => {
          popeHeight = metadata.height;
          sharp(baseImage).composite([{ input: rescaledPope, left: x-Math.floor(popeWidth/2), top: y-Math.floor(popeHeight/2) }]).toFile('output.jpg').then(() => {
        postImage('output.jpg');
          })
      })
    });
    } else {
      popeHeight = Math.floor((Math.random() * (image.bitmap.height/2)) + 5);
      sharp(popeImage).resize({ height: popeHeight }).toBuffer().then((rescaledPope) => {
        sharp(rescaledPope).metadata().then((metadata) => {
          popeWidth = metadata.width;
          sharp(baseImage).composite([{ input: rescaledPope, left: x-Math.floor(popeWidth/2), top: y-Math.floor(popeHeight/2) }]).toFile('output.jpg').then(() => {
            postImage('output.jpg');
          })
      })
    });
    }
  });
}

function postImage(image) {
  FB.api('me/photos', 'post', { source: fs.createReadStream(image) }, res => {
    if (!res || res.error) {
        return console.error(!res ? 'error occurred' : res.error);
    }
    console.log(`Post ID: ${res.id}`);
    FB.api(res.id + '/comments', 'post', { message: 'Original image: ' + fullUrl }, resp => {
      if (!resp || resp.error) {
        return console.error(!resp ? 'error occurred' : resp.error);
      }
      console.log(`Comment ID: ${resp.id}`);
    })
  });
}