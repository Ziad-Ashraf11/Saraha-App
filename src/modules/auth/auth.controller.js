import {Router} from "express";
import successResponse from "../../Utils/Response/success.response.js";
import { login, register } from "./auth.service.js";
import { validateLogin, validateRegister } from "./auth.validiation.js";

const router = Router();

router.post("/register", validateRegister, async (req, res) => {
	const result = await register(req.body);
	return successResponse(res, 201, "Account created", result);
});

router.post("/login", validateLogin, async (req, res) => {
	const result = await login(req.body);
	return successResponse(res, 200, "Login successful", result);
});

export default router;
