// models/User.ts
import  { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, minlength: 3, maxlength: 30 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

// During Next.js development, Mongoose can retain a model compiled before a
// schema change. Add newly introduced fields to that cached model as well.
if (models.User && !models.User.schema.path("username")) {
  models.User.schema.add(UserSchema.obj);
}

export const User = models.User || model("User", UserSchema);
