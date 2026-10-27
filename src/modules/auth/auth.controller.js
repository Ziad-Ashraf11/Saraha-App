import {Router} from "express";
import successResponse from "../../Utils/Response/success.response.js";
import { googleLogin, login, logout, refreshTokens, register, resendVerificationEmail, verifyEmail } from "./auth.service.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
	validateEmailVerification,
	validateGoogleLogin,
	validateLogin,
	validateRefreshToken,
	validateRegister,
	validateResendVerification,
} from "./auth.validiation.js";

const router = Router();

router.post("/register", validateRegister, async (req, res) => {
	const result = await register(req.body);
	return successResponse(res, 201, "Account created", result);
});

router.post("/login", validateLogin, async (req, res) => {
	const result = await login(req.body);
	return successResponse(res, 200, "Login successful", result);
});

router.post("/verify-email", validateEmailVerification, async (req, res) => {
	return successResponse(res, 200, "Email verified", await verifyEmail(req.body));
});

router.post("/resend-verification", validateResendVerification, async (req, res) => {
	return successResponse(res, 200, "If the account needs verification, a code has been sent", await resendVerificationEmail(req.body.email));
});

router.post("/refresh", validateRefreshToken, async (req, res) => {
	return successResponse(res, 200, "Tokens refreshed", await refreshTokens(req.body.refreshToken));
});

router.post("/google", validateGoogleLogin, async (req, res) => {
	return successResponse(res, 200, "Google login successful", await googleLogin(req.body.idToken));
});

router.post("/logout", authenticate, async (req, res) => {
	return successResponse(res, 200, "Logged out", await logout(req.user._id));
});

export default router;
