import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: 'dh3drirod',
  api_key:    '612422952835258',
  api_secret: 'M61VjZIsQVIYZWW6-idrLou8qk8',
});

console.log('Testing Cloudinary v1...');

cloudinary.v2.uploader.upload(
  'https://res.cloudinary.com/demo/image/upload/sample.jpg',
  { folder: 'mern-blog' },
  (error, result) => {
    if (error) {
      console.log('❌ Error:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Success:', result.secure_url);
    }
  }
);