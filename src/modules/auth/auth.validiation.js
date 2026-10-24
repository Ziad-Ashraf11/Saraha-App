import { BadRequestException } from "../../Utils/Response/error.response.js";

export const validateRegister = (req, res, next) => {
	const { firstName, lastName, email, password } = req.body ?? {};
	if (![firstName, lastName, email, password].every((value) => typeof value === "string" && value.trim())) {
		throw BadRequestException({ Message: "firstName, lastName, email, and password are required" });
	}
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
		throw BadRequestException({ Message: "A valid email is required" });
	}
	if (password.length < 8) {
		throw BadRequestException({ Message: "Password must be at least 8 characters" });
	}
	next();
};

export const validateLogin = (req, res, next) => {
	const { email, password } = req.body ?? {};
	if (![email, password].every((value) => typeof value === "string" && value.trim())) {
		throw BadRequestException({ Message: "Email and password are required" });
	}
	next();
};
