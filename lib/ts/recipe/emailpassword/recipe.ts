/* Copyright (c) 2021, VRAI Labs and/or its affiliates. All rights reserved.
 *
 * This software is licensed under the Apache License, Version 2.0 (the
 * "License") as published by the Apache Software Foundation.
 *
 * You may not use this file except in compliance with the License. You may
 * obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

import RecipeModule from "../../recipeModule";
import { TypeInput, TypeNormalisedInput, RecipeInterface, User, APIInterface } from "./types";
import { NormalisedAppinfo, APIHandled, RecipeListFunction, HTTPMethod } from "../../types";
import * as express from "express";
import STError from "./error";
import { validateAndNormaliseUserInput } from "./utils";
import NormalisedURLPath from "../../normalisedURLPath";
import {
    SIGN_UP_API,
    SIGN_IN_API,
    GENERATE_PASSWORD_RESET_TOKEN_API,
    PASSWORD_RESET_API,
    SIGN_OUT_API,
    SIGNUP_EMAIL_EXISTS_API,
} from "./constants";
import signUpAPI from "./api/signup";
import signInAPI from "./api/signin";
import generatePasswordResetTokenAPI from "./api/generatePasswordResetToken";
import passwordResetAPI from "./api/passwordReset";
import signOutAPI from "./api/signout";
import { send200Response } from "../../utils";
import emailExistsAPI from "./api/emailExists";
import EmailVerificationRecipe from "../emailverification/recipe";
import RecipeImplementation from "./recipeImplementation";
import APIImplementation from "./api/implementation";
import { Querier } from "../../querier";

export default class Recipe extends RecipeModule {
    private static instance: Recipe | undefined = undefined;
    static RECIPE_ID = "emailpassword";

    config: TypeNormalisedInput;

    emailVerificationRecipe: EmailVerificationRecipe;

    recipeInterfaceImpl: RecipeInterface;

    apiImpl: APIInterface;

    constructor(recipeId: string, appInfo: NormalisedAppinfo, isInServerlessEnv: boolean, config?: TypeInput) {
        super(recipeId, appInfo);
        this.config = validateAndNormaliseUserInput(this, appInfo, config);
        this.emailVerificationRecipe = new EmailVerificationRecipe(
            recipeId,
            appInfo,
            isInServerlessEnv,
            this.config.emailVerificationFeature
        );
        this.recipeInterfaceImpl = this.config.override.functions(
            new RecipeImplementation(Querier.getNewInstanceOrThrowError(isInServerlessEnv, recipeId))
        );
        this.apiImpl = this.config.override.apis(new APIImplementation());
    }

    static getInstanceOrThrowError(): Recipe {
        if (Recipe.instance !== undefined) {
            return Recipe.instance;
        }
        throw new STError({
            type: STError.GENERAL_ERROR,
            payload: new Error("Initialisation not done. Did you forget to call the SuperTokens.init function?"),
        });
    }

    static init(config?: TypeInput): RecipeListFunction {
        return (appInfo, isInServerlessEnv) => {
            if (Recipe.instance === undefined) {
                Recipe.instance = new Recipe(Recipe.RECIPE_ID, appInfo, isInServerlessEnv, config);
                return Recipe.instance;
            } else {
                throw new STError({
                    type: STError.GENERAL_ERROR,
                    payload: new Error(
                        "Emailpassword recipe has already been initialised. Please check your code for bugs."
                    ),
                });
            }
        };
    }

    static reset() {
        if (process.env.TEST_MODE !== "testing") {
            throw new STError({
                type: STError.GENERAL_ERROR,
                payload: new Error("calling testing function in non testing env"),
            });
        }
        Recipe.instance = undefined;
    }

    // abstract instance functions below...............

    getAPIsHandled = (): APIHandled[] => {
        return [
            {
                method: "post",
                pathWithoutApiBasePath: new NormalisedURLPath(SIGN_UP_API),
                id: SIGN_UP_API,
                disabled: this.apiImpl.signUpPOST === undefined,
            },
            {
                method: "post",
                pathWithoutApiBasePath: new NormalisedURLPath(SIGN_IN_API),
                id: SIGN_IN_API,
                disabled: this.apiImpl.signInPOST === undefined,
            },
            {
                method: "post",
                pathWithoutApiBasePath: new NormalisedURLPath(GENERATE_PASSWORD_RESET_TOKEN_API),
                id: GENERATE_PASSWORD_RESET_TOKEN_API,
                disabled: this.apiImpl.generatePasswordResetTokenPOST === undefined,
            },
            {
                method: "post",
                pathWithoutApiBasePath: new NormalisedURLPath(PASSWORD_RESET_API),
                id: PASSWORD_RESET_API,
                disabled: this.apiImpl.passwordResetPOST === undefined,
            },
            {
                method: "post",
                pathWithoutApiBasePath: new NormalisedURLPath(SIGN_OUT_API),
                id: SIGN_OUT_API,
                disabled: this.apiImpl.signOutPOST === undefined,
            },
            {
                method: "get",
                pathWithoutApiBasePath: new NormalisedURLPath(SIGNUP_EMAIL_EXISTS_API),
                id: SIGNUP_EMAIL_EXISTS_API,
                disabled: this.apiImpl.emailExistsGET === undefined,
            },
            ...this.emailVerificationRecipe.getAPIsHandled(),
        ];
    };

    handleAPIRequest = async (
        id: string,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
        path: NormalisedURLPath,
        method: HTTPMethod
    ) => {
        let options = {
            config: this.config,
            next,
            recipeId: this.getRecipeId(),
            recipeImplementation: this.recipeInterfaceImpl,
            req,
            res,
        };
        if (id === SIGN_UP_API) {
            return await signUpAPI(this.apiImpl, options);
        } else if (id === SIGN_IN_API) {
            return await signInAPI(this.apiImpl, options);
        } else if (id === GENERATE_PASSWORD_RESET_TOKEN_API) {
            return await generatePasswordResetTokenAPI(this.apiImpl, options);
        } else if (id === SIGN_OUT_API) {
            return await signOutAPI(this.apiImpl, options);
        } else if (id === PASSWORD_RESET_API) {
            return await passwordResetAPI(this.apiImpl, options);
        } else if (id === SIGNUP_EMAIL_EXISTS_API) {
            return await emailExistsAPI(this.apiImpl, options);
        } else {
            return await this.emailVerificationRecipe.handleAPIRequest(id, req, res, next, path, method);
        }
    };

    handleError = (
        err: STError,
        request: express.Request,
        response: express.Response,
        next: express.NextFunction
    ): void => {
        if (err.fromRecipe === Recipe.RECIPE_ID) {
            if (err.type === STError.EMAIL_ALREADY_EXISTS_ERROR) {
                // As per point number 3a in https://github.com/supertokens/supertokens-node/issues/21#issuecomment-710423536
                return this.handleError(
                    new STError({
                        type: STError.FIELD_ERROR,
                        payload: [
                            {
                                id: "email",
                                error: "This email already exists. Please sign in instead.",
                            },
                        ],
                        message: "Error in input formFields",
                    }),
                    request,
                    response,
                    next
                );
            } else if (err.type === STError.WRONG_CREDENTIALS_ERROR) {
                return send200Response(response, {
                    status: "WRONG_CREDENTIALS_ERROR",
                });
            } else if (err.type === STError.FIELD_ERROR) {
                return send200Response(response, {
                    status: "FIELD_ERROR",
                    formFields: err.payload,
                });
            } else if (err.type === STError.RESET_PASSWORD_INVALID_TOKEN_ERROR) {
                return send200Response(response, {
                    status: "RESET_PASSWORD_INVALID_TOKEN_ERROR",
                });
            } else {
                return next(err);
            }
        } else {
            return this.emailVerificationRecipe.handleError(err, request, response, next);
        }
    };

    getAllCORSHeaders = (): string[] => {
        return [...this.emailVerificationRecipe.getAllCORSHeaders()];
    };

    isErrorFromThisRecipe = (err: any): err is STError => {
        return (
            STError.isErrorFromSuperTokens(err) &&
            (err.fromRecipe === Recipe.RECIPE_ID || this.emailVerificationRecipe.isErrorFromThisRecipe(err))
        );
    };

    // extra instance functions below...............

    getEmailForUserId = async (userId: string) => {
        let userInfo = await this.recipeInterfaceImpl.getUserById(userId);
        if (userInfo === undefined) {
            throw new STError({
                type: STError.UNKNOWN_USER_ID_ERROR,
                message: "Unknown User ID provided",
            });
        }
        return userInfo.email;
    };

    createEmailVerificationToken = async (userId: string): Promise<string> => {
        return this.emailVerificationRecipe.recipeInterfaceImpl.createEmailVerificationToken(
            userId,
            await this.getEmailForUserId(userId)
        );
    };

    verifyEmailUsingToken = async (token: string): Promise<User> => {
        let user = await this.emailVerificationRecipe.recipeInterfaceImpl.verifyEmailUsingToken(token);
        let userInThisRecipe = await this.recipeInterfaceImpl.getUserById(user.id);
        if (userInThisRecipe === undefined) {
            throw new STError({
                type: STError.UNKNOWN_USER_ID_ERROR,
                message: "Unknown User ID provided",
            });
        }
        return userInThisRecipe;
    };

    isEmailVerified = async (userId: string) => {
        return this.emailVerificationRecipe.recipeInterfaceImpl.isEmailVerified(
            userId,
            await this.getEmailForUserId(userId)
        );
    };
}
