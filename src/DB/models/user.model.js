import mongoose, { Schema } from "mongoose";
import { GenderEnum, RoleEnum, ProviderEnum } from "../../Utils/enums/user.enum.js";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "first name is mandatory"],
      minLength: 2,
      maxLength: 25,
      trim: true,
    },
    lastName: {
      type: String,
      minLength: 2,
      maxLength: 25,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider === ProviderEnum.SYSTEM;
      },
      select: false,
    },
    googleId: { type: String, unique: true, sparse: true },
    emailVerificationCodeHash: { type: String, select: false },
    emailVerificationExpiresAt: { type: Date, select: false },
    emailVerificationResendAt: { type: Date, select: false },
    refreshTokenHash: { type: String, select: false },
    DOB: Date,
    age: Number,
    phone: String,
    gender: {
      type: String,
      enum: Object.values(GenderEnum),
      default: GenderEnum.MALE,
    },
    role: {
      type: String,
      enum: Object.values(RoleEnum),
      default: RoleEnum.USER,
    },
    provider: {
      type: Number,
      enum: Object.values(ProviderEnum),
      default: ProviderEnum.SYSTEM,
    },
    confirmEmail: Date,
    profilePic: String,
    coverPic: String,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret.password;
        delete ret.emailVerificationCodeHash;
        delete ret.emailVerificationExpiresAt;
        delete ret.emailVerificationResendAt;
        delete ret.refreshTokenHash;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

userSchema
  .virtual("username")
  .set(function (value) {
    const [firstName = "", ...lastNameParts] = String(value ?? "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const lastName = lastNameParts.join(" ");
    this.set({ firstName, lastName });
  })
  .get(function () {
    return [this.firstName, this.lastName].filter(Boolean).join(" ");
  });

const UserModel = mongoose.model("User", userSchema);

export default UserModel;