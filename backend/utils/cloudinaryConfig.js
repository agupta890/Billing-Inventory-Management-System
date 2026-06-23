const cloudinary = require("cloudinary").v2;

// Configure Cloudinary credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer to Cloudinary.
 * @param {Buffer} buffer - The file buffer to upload.
 * @param {string} folder - The folder name in Cloudinary.
 * @returns {Promise<{public_id: string, url: string}>}
 */
const uploadBuffer = (buffer, folder = "bookstore") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve({
          public_id: result.public_id,
          url: result.secure_url || result.url,
        });
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Deletes an image from Cloudinary by its public ID.
 * @param {string} public_id - The Cloudinary public ID of the image to delete.
 * @returns {Promise<any>}
 */
const deleteImage = (public_id) => {
  return new Promise((resolve, reject) => {
    if (!public_id) {
      return resolve(null);
    }
    cloudinary.uploader.destroy(public_id, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    });
  });
};

module.exports = {
  cloudinary,
  uploadBuffer,
  deleteImage,
};
