const fs = require('fs');
const https = require('https');

// A suitable baroque certificate border (transparent PNG if possible, or JPG)
const url = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Old_page_border_01.jpg/800px-Old_page_border_01.jpg";

https.get(url, (res) => {
  let chunks = [];
  res.on('data', (c) => chunks.push(c));
  res.on('end', () => {
    let buffer = Buffer.concat(chunks);
    let b64 = "data:image/jpeg;base64," + buffer.toString('base64');
    fs.writeFileSync('border_base64.txt', b64);
    console.log("Downloaded. Length:", b64.length);
  });
}).on('error', (e) => {
  console.error("Error: ", e);
});
