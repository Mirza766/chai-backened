import {Router} from "express";
import {registerUser,loginUser,logoutUser,refreshAccessToken
    ,changeCurrentPassword,getCurrentUser
    ,updateAccountDetails,updateUserAvatar,updateUserCoverImage,getUserChannelProfile,getWatchHistory}
     from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import {verifyJwt} from "../middlewares/auth.middleware.js";

const router=Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
             maxCount: 1
        }
    ]),
    registerUser)

router.route("/login").post(loginUser);


//secures.routes
router.route("/logout").post(verifyJwt,logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-pass").post(verifyJwt,changeCurrentPassword);
router.route("/current-user").get(verifyJwt,getCurrentUser);
router.route("/update-account").patch(verifyJwt,updateAccountDetails);
router.route("/c/:username").get(verifyJwt,getUserChannelProfile);
router.route("/coverImage").patch(verifyJwt,upload.single("coverImage"),updateUserCoverImage);
router.route("/avatar").patch(verifyJwt,upload.single("avatar"),updateUserAvatar);
router.route("/history").get(verifyJwt,getWatchHistory);
export default router