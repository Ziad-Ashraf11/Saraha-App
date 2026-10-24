import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../../DB/models/user.model.js";
import { create, findOne } from "../../DB/database.repository.js";
import { JWT_SECRET } from "../../../config/config.service.js";
import { ConflictException, UnauthorizedException } from "../../Utils/Response/error.response.js";

const createToken = (userId) => {
	if (!JWT_SECRET) throw new Error("JWT_SECRET is missing from environment configuration");
	return jwt.sign({ sub: userId.toString() }, JWT_SECRET, { expiresIn: "7d" });
};

export const register = async ({ firstName, lastName, email, password }) => {
	const normalizedEmail = email.trim().toLowerCase();
	if (await findOne({ model: UserModel, filter: { email: normalizedEmail }, select: "_id", options: { lean: true } })) {
		throw ConflictException({ Message: "Email is already registered" });
	}
	const passwordHash = await bcrypt.hash(password, 12);
	const user = await create({
		model: UserModel,
		data: {
			firstName: firstName.trim(),
			lastName: lastName.trim(),
			email: normalizedEmail,
			password: passwordHash,
		},
	});
	return { user, token: createToken(user._id) };
};

export const login = async ({ email, password }) => {
	const user = await findOne({
		model: UserModel,
		filter: { email: email.trim().toLowerCase() },
		select: "+password",
	});
	if (!user || !(await bcrypt.compare(password, user.password))) {
		throw UnauthorizedException({ Message: "Invalid email or password" });
	}
	return { user, token: createToken(user._id) };
};
