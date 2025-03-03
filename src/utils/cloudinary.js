// import { v2 as cloudinary } from "cloudinary";
// import fs from "fs"





//     // Configuration
//     cloudinary.config({ 
//         cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//         api_key: process.env.CLOUDINARY_API_KEY, 
//         api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
//     });




//     const uploadCloudinary=async(localFilePath)=>{
// try{
// if(!localFilePath){
// return null
// }
// //upload File
// const response=await cloudinary.uploader.upload(localFilePath,{
//     resource_type:"auto"
// })

// //file has been uploaded successfully
// console.log("File has been uploaded on cloudinary",response.url);
// return response;
// }
// catch(error){
// fs.unlinkSync(localFilePath);   //remove the locally saved temporary file as the 
// //upload operation got failed
// return null;
// }
//     }


//      export {uploadCloudinary}

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

console.log("Cloudinary API Keys:", process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);

// ✅ Ensure API Keys Are Loaded
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error("❌ Cloudinary API keys are missing! Check your .env file.");
    process.exit(1);
}

// ✅ Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Upload File to Cloudinary
const uploadCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.error("❌ No file path provided.");
            return null;
        }

        console.log("📤 Uploading file to Cloudinary:", localFilePath);

        // ✅ Ensure file exists before upload
        if (!fs.existsSync(localFilePath)) {
            console.error("❌ File does not exist:", localFilePath);
            return null;
        }

        // ✅ Upload File
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "image",
            use_filename: true,
            unique_filename: false,
            overwrite: true,
        });

        console.log("✅ Upload Successful! Cloudinary URL:", response.secure_url);

        // ✅ Delete local file after upload
        fs.unlinkSync(localFilePath);
        console.log("🗑️ Deleted local file:", localFilePath);

        return response;
    } catch (error) {
        console.error("❌ Cloudinary Upload Failed:", error.message);
        return null;
    }
};

export { uploadCloudinary };
