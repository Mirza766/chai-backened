import multer from "multer"


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
  export const  upload = multer({ storage, })

// import multer from "multer";
// import fs from "fs";
// import path from "path";

// // ✅ Ensure temp folder exists
// const tempDir = path.resolve("public/temp");
// if (!fs.existsSync(tempDir)) {
//     fs.mkdirSync(tempDir, { recursive: true });
// }

// // ✅ Multer Storage
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         console.log("📂 Saving file to:", tempDir);
//         cb(null, tempDir);
//     },
//     filename: function (req, file, cb) {
//         const uniqueFilename = Date.now() + "-" + file.originalname;
//         console.log("📄 File received:", uniqueFilename);
//         cb(null, uniqueFilename);
//     }
// });

// // ✅ Multer Upload Middleware
// export const upload = multer({ storage: storage });
