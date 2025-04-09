import {
  Document,
  Model,
  model,
  Schema,
  Types,
  ValidatorProps,
} from "mongoose";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface IUser extends Document {
  fullName: string;
  email: String;
  password: string;
  username: string;
  refreshToken: string;
  restaurants: Types.ObjectId[];
}

interface IUserMethods {
  checkPassword: (password: string) => Promise<boolean>;
  generateAccessToken: () => string;
  generateRefreshToken: () => string;
}

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    fullName: {
      type: String,
      required: [true, "FullName is required."],
      trim: true,
    },
    email: {
      type: String,
      required: true,
    },

    username: {
      type: String,
      lowercase: true,
      required: [true, "Username is required"],
      trim: true,
      unique: true,
      validate: {
        validator: function (v: string) {
          return v.includes("_");
        },
        message: (props: ValidatorProps) => `${props.value} must contain  '_'`,
      },
    },

    password: {
      type: String,
      required: true,
    },
  

    refreshToken: {
      type: String,
      default: "",
    },
    restaurants: [{ type: Schema.Types.ObjectId, ref: "Restaurant" }],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.checkPassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function (): string {
  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      email: this.email,
    } as JwtPayload,
    process.env.ACCESS_TOKEN_SECRET as jwt.Secret,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRE as string,
    } as jwt.SignOptions
  );
};

userSchema.methods.generateRefreshToken = function (): string {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET as jwt.Secret,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRE as string,
    } as jwt.SignOptions
  );
};

export const User = model<IUser, UserModel>("User", userSchema);
