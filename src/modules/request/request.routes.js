import express from "express";
import * as request from "./request.controller.js";
import { validate } from "../../middlewares/validate.js";

import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";

const requestRouter = express.Router();

requestRouter
    .route("/createRequest")
    .post(
        protectedRoutes,
        allowedTo("seller"),
        request.createRequest

    )

requestRouter
    .route("/respondToRequest/:id")
    .put(
        protectedRoutes,
        allowedTo("admin"),
        // validate(request.respondToRequestValidation),
        request.respondToRequest
    );

export default requestRouter