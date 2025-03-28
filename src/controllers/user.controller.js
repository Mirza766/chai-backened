// import { asyncHandler } from "../utils/asyncHandler.js";
// import {ApiError} from "../utils/ApiError.js"
// import {User} from "../models/user.model.js"
// import {uploadCloudinary} from "../utils/cloudinary.js"
// import { ApiResponse } from "../utils/ApiResponse.js";


// const generateAccessAndRefreshTokens=async(userId)=>{
//     try{
//    const user=await User.findById(userId);
//     const accessToken=user.generateAccessToken()
//     const refreshToken=user.generateRefreshToken()
  
//    user.refreshToken=refreshToken;
//    await user.save({validateBeforeSave:false})

// return {accessToken,refreshToken};

//     }
//     catch(error){
// throw new ApiError(500,"Something went wrong while generating refresh ans access token")
//     }
// }


// const registerUser=asyncHandler(async(req,res)=>{
//     //get user details from frontened
//     //Validation   -  not empty
//     //check if user already exists: check through username and email
//     // check for images , check for avatar
//     //upload them to cloudinary,avatar
//     //create user object  -create entry in db
//     //remove password and refresh token field from response
//     //check for user creation
//     // return res if created else through error


//     const {fullname,email,username,password}=req.body
//   console.log("email: ",email);

// //   if(fullname==""){
// //     throw new ApiError(400,"fullname is required");
// //   }

// if([fullname,email,username,password].some((field)=>
//      field?.trim()==="")){
// throw new ApiError(400,"All fields are required");
// }

// const existedUser= await User.findOne({
//   $or:[{username},
//     {email}]

// })
// if(existedUser){
//     throw new ApiError(409,"User with username and email already exists");
// }

// console.log("Received files:", req.files);
// console.log("Received body:", req.body);

// const avatarLocalPath=req.files?.avatar[0]?.path;
// //const coverImagePath=req.files?.coverImage[0]?.path;

// let coverImageLocalPath;
// if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
//     coverImageLocalPath=req.files.coverImage[0].path;
//     }


// if(!avatarLocalPath){
//     throw new ApiError(400,"Avatar file is required")
// }

// const coverImage=await uploadCloudinary(coverImageLocalPath);
// const avatar=await uploadCloudinary(avatarLocalPath);





// if(!avatar){
//     throw new ApiError(400,"Avatar2 file is required");
// }

// const user=await User.create({
//     fullname,
//     avatar:avatar.url,
//     coverImage:coverImage?.url || "",
//     email,
//     password,
//     username:username.toLowerCase()
// })

// const createdUser=await User.findById(user._id).select(
//     "-password -refreshToken"
// );


// if(!createdUser){
//     throw new ApiError(500,"Something went wrong while registering the user");
// }

// return res.status(201).json(
//     new ApiResponse(200,createdUser,"User registered successfully")
// )

// }
// )

// const loginUser=asyncHandler(async(req,res)=>{
// //req body ->data
// //username or email
// //find the user
// //password check
// //generate access and refresh token
// //send cookie



// const {email,username,password}=req.body;
// console.log(email);

// if(!username && !email){
//     throw new ApiError(400,"username or password required: ");
// }

// const user=await User.findOne({
//     $or:[{username},{email}]
// })

// if(!user){
//     throw new ApiError(404,"User doesnot exist");
// }

// const isPasswordValid=await user.isPasswordCorrect(password)
// if(!isPasswordValid){
//     throw new ApiError(401,"Password Not Valid");
// }

// const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id);

// const loggedInUser=await User.findById(user._id).select
// ("-password -refreshToken");

// const options={
//     httpOnly:true,
//     secure:true
// }

// return res
// .status(200)
// .cookie("accessToken",accessToken,options)
// .cookie("refreshToken",refreshToken,options)
// .json(
//     new ApiResponse(200,{
//         user:loggedInUser,accessToken,refreshToken
//     },
// "User Logged In Successfuly")
// )

// })

// const logoutUser = asyncHandler(async (req, res) => {
//     await User.findByIdAndUpdate(req.user._id, {
//         $set: {
//             refreshToken: undefined
//         }
//     }, { new: true });

//     const options = {
//         httpOnly: true,
//         secure: true
//     };

//     res.clearCookie("accessToken", options);
//     res.clearCookie("refreshToken", options);

//     return res.status(200).json(new ApiResponse(200, {}, "User Logged Out Successfully"));
// });





// export {registerUser,loginUser,logoutUser}

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import {mongoose} from 'mongoose';

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body;
    console.log("email: ", email);

    if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username: username }, { email: email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with this username or email already exists");
    }

    console.log("Received files:", req.files);
    console.log("Received body:", req.body);

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path || null;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // ✅ Upload images only if they exist
    const avatar = await uploadCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadCloudinary(coverImageLocalPath) : null;

    if (!avatar) {
        throw new ApiError(400, "Avatar upload failed");
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;
    console.log(email);

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({
        $or: [{ username: username }, { email: email }]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User Logged In Successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.user._id, {$unset:
        {refrehToken:1}
    },{
        new:true
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    };

    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);

    return res.status(200).json(new ApiResponse(200, {}, "User Logged Out Successfully"));
});


const refreshAccessToken = asyncHandler(async (req, res) => {
    // Access the refresh token from cookies or request body
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken, 
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh Token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token Expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true
        };

        // Generate new tokens
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options) // ✅ Corrected
            .cookie("refreshToken", newRefreshToken, options) // ✅ Corrected
            .json(
                new ApiResponse(
                    200, 
                    {
                        accessToken, 
                        refreshToken: newRefreshToken  // ✅ Corrected key name
                    },
                    "Access Token refreshed successfully"
                )
            );

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh Token");
    }
});


const changeCurrentPassword=asyncHandler(async(req,res)=>{

const {oldPassword,newPassword,confPassword}=req.body;

if (newPassword !== confPassword) {
    throw new ApiError(400, "New and confirm password do not match");
}



const user=await User.findById(req.user?._id);
if(!user){
    throw new ApiError(404,"User not found");
}

const isPasswordCorrect=await user.isPasswordCorrect(oldPassword);

if(!isPasswordCorrect){
    throw new ApiError(400,"Invalid Old Password");
}

user.password=newPassword;
await user.save({validateBeforeSave:false});

return res.status(200)
.json(new ApiResponse(200,{},"Password changed Successfully"));





})


const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, req.user, "Current User fetched Successfully")
    );
});



const updateAccountDetails=asyncHandler(async(req,res)=>{
const {fullname,email}=req.body;


if(!fullname || !email){
    throw new ApiError(400,"All fields are required");
}

const user =await User.findByIdAndUpdate(req.user._id,
    {
     $set:{
        fullname,
        email:email
     }
    },{
      new:true
    }
).select("-password")

return res.status(200)
.json(new ApiResponse(200,user,"Account details updated successfully"))

})


const updateUserAvatar=asyncHandler(async(req,res)=>{
const avatarLocalPath=req.file?.path

if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is missing");
}

const avatar=await uploadCloudinary(avatarLocalPath);

if(!avatar.url){
    throw new ApiError(400,"Error while uploading on avatar");
}

const user =await User.findByIdAndUpdate(req.user?._id,{
$set:{
avatar:avatar.url
}
},{
    new:true
}).select("-password")

return res.status(200).json(
    new ApiResponse(200,user,"Cover Image Updated Successfully")
)


})

const updateUserCoverImage=asyncHandler(async(req,res)=>{
    const CoverLocalPath=req.file?.path
    
    if(!CoverLocalPath){
        throw new ApiError(400,"Cover Image file is missing");
    }
    
    const coverImage=await uploadCloudinary(CoverLocalPath);
    
    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading Cover Image");
    }
    
    const user =await User.findByIdAndUpdate(req.user?._id,{
    $set:{
    coverImage:coverImage.url
    }
    },{
        new:true
    }).select("-password")
    
    return res.status(200).json(
        new ApiResponse(200,user,"Cover Image Updated Successfully")
    )
    
    
    })


const getUserChannelProfile=asyncHandler(async(req,res)=>{
const {username}=req.params;

if(!username?.trim()){
    throw new ApiError(400,"username is Missing");
}

const channel=await User.aggregate([
    {
$match:{
    username:username?.toLowerCase()
}
},
{
    $lookup:{
      from: "Subscriptions",
      localField:"_id",
      foreignField:"channel",
      as:"subscribers_Data"
    }
},
{
    $lookup:{
        from: "Subscriptions",
        localField:"_id",
        foreignField:"subscriber",
        as:"subscribed_To_Data"
    }
},
    {
        $addFields:{
        subscribersCount:{
            $size:"$subscribers_Data"

        },
            channelsSubscribedToCount:{
               $size:"$subscribed_To_Data"
            },
            isSubscribed:{
                
                    $cond:{
                    if:
                        {$in:
                            [req.user?._id,"$subscribers_Data.subscriber"]
                        },
                        then:true,
                        else:false,
                    
                    }
            
            }
        }
        },
        {
            $project:{
                fullname:1,
                email:1,
                username:1,
                subscribersCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,

            }
        }
    

])
if(!channel?.length){
    throw new ApiError(400,"Channel Doesnot exists");
}

console.log(channel);

return res.status(200)
.json(
    new ApiResponse(200,channel[0],"User Channel Fetched Successfully")
)


})

const getWatchHistory=asyncHandler(async(req,res)=>{
    const user=await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }

        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watch_History",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                $project:{
                                    fullname:1,
                                    avatar:1,
                                    username:1

                                }
                            }
                            ]

                        }
                    },
                    {
                        $addFields:{
                           owner:{
                            $first:"$owner"
                           } 
                        }
                        
                    }
                ]
            }
        }

    ])

    return res.status(200).json(new ApiResponse(user[0].watchHistory,"Watch history fetched successfully"));
})





export { registerUser, loginUser, logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser
    ,updateAccountDetails,updateUserAvatar,updateUserCoverImage,getUserChannelProfile,getWatchHistory,
 };
