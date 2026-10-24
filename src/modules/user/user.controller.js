import {Router} from "express";
import successResponse from "../../Utils/Response/success.response.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { getProfile, updateProfile } from "./user.service.js";
import { validateProfileUpdate } from "./user.validiation.js";

const router = Router();

router.get("/me", authenticate, async (req, res) => {
	return successResponse(res, 200, "Profile retrieved", await getProfile(req.user._id));
});

router.patch("/me", authenticate, validateProfileUpdate, async (req, res) => {
	return successResponse(res, 200, "Profile updated", await updateProfile(req.user._id, req.body));
});

export default router;
