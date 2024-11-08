// models/QueryModel.js
import { Schema, model } from "mongoose";

const responseSchema = new Schema({
  message: {
    type: String,
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
  sender: {
    type: String,
    enum: ["admin", "user"],
    required: true,
  },
});

const querySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["open", "resolved"],
    default: "open",
  },
  responses: [responseSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Query = model("Query", querySchema);

export default Query;
