import 'dotenv/config';
import FB from 'fb';
import jimp from 'jimp';
import got from 'got';
import images from 'images';
import {createWriteStream} from 'fs';

let baseUrl = 'https://www.shitpostbot.com/';
let requestUri = 'api/randsource';

let popeImage = 'papajmaly.png';
let baseImage = 'received.jpg';

FB.setAccessToken(process.env.FB_API_KEY);

got(baseUrl + requestUri)
  .then(function (response) {
    let imageUri = JSON.parse(response.body).sub.img.full;
    console.log(imageUri);
    sendRequest(baseUrl + imageUri, baseImage);
  })
  .catch(function (error) {
    console.log(error);
  });

function sendRequest(url, image) {
    try {
      let test = got.stream(url).pipe(createWriteStream(image));
      console.log(`File downloaded to ${image}.`);
      test.on('close', () => {
        editImage(image);
      });
    } catch (error) {
      console.error(`Something went wrong. ${error.message}`);
    }
}

function editImage(baseImage) {
  jimp.read(baseImage, (err, image) => {
    if (err) throw err;
    var size = Math.floor((Math.random() * (image.bitmap.width/2)) + 1);
    var x = Math.floor((Math.random() * (image.bitmap.width/2)) + 1);
    var y = Math.floor((Math.random() * (image.bitmap.height/2)) + 1);
    images(baseImage).draw(images(popeImage).resize(size), x, y).save('output.jpg');
  });
}

// FB.api('me/feed', 'post', { source: fs.createReadStream("output.jpg") }, res => {
//     if (!res || res.error) {
//         return console.error(!res ? 'error occurred' : res.error);
//     }
//     console.log(`Post ID: ${res.id}`);
// });