/* Copyright (c) 2024, VRAI Labs and/or its affiliates. All rights reserved.
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

import { BaseRequest, BaseResponse } from "../../framework";
import OverrideableBuilder from "supertokens-js-override";
import { GeneralErrorResponse, UserContext } from "../../types";
import { SessionContainerInterface } from "../session/types";

export type TypeInput = {
    issuer?: string;
    defaultSkew?: number;
    defaultPeriod?: number;

    override?: {
        functions?: (
            originalImplementation: RecipeInterface,
            builder?: OverrideableBuilder<RecipeInterface>
        ) => RecipeInterface;
        apis?: (originalImplementation: APIInterface, builder?: OverrideableBuilder<APIInterface>) => APIInterface;
    };
};

export type TypeNormalisedInput = {
    issuer: string;
    defaultSkew: number;
    defaultPeriod: number;

    override: {
        functions: (
            originalImplementation: RecipeInterface,
            builder?: OverrideableBuilder<RecipeInterface>
        ) => RecipeInterface;
        apis: (originalImplementation: APIInterface, builder?: OverrideableBuilder<APIInterface>) => APIInterface;
    };
};

export type RecipeInterface = {
    getUserIdentifierInfoForUserId: (input: {
        userId: string;
        userContext: UserContext;
    }) => Promise<
        | { status: "OK"; info: string }
        | { status: "UNKNOWN_USER_ID_ERROR" | "USER_IDENTIFIER_INFO_DOES_NOT_EXIST_ERROR" }
    >;

    createDevice: (input: {
        userId: string;
        userIdentifierInfo?: string;
        deviceName?: string;
        skew?: number;
        period?: number;
        userContext: UserContext;
        securityOptions?: {
            enforceUserBan?: boolean;
            enforceIpBan?: boolean;
            ipAddress?: string;
        };
    }) => Promise<
        | {
              status: "OK";
              deviceName: string;
              secret: string;
              qrCodeString: string;
          }
        | {
              status: "DEVICE_ALREADY_EXISTS_ERROR";
          }
        | {
              status: "UNKNOWN_USER_ID_ERROR";
          }
        | {
              status: "IP_BANNED_ERROR" | "USER_BANNED_ERROR";
          }
    >;
    updateDevice: (input: {
        userId: string;
        existingDeviceName: string;
        newDeviceName: string;
        userContext: UserContext;
    }) => Promise<{
        status: "OK" | "UNKNOWN_DEVICE_ERROR" | "DEVICE_ALREADY_EXISTS_ERROR";
    }>;
    listDevices: (input: {
        userId: string;
        userContext: UserContext;
    }) => Promise<{
        status: "OK";
        devices: {
            name: string;
            period: number;
            skew: number;
            verified: boolean;
        }[];
    }>;
    removeDevice: (input: {
        userId: string;
        deviceName: string;
        userContext: UserContext;
    }) => Promise<{
        status: "OK";
        didDeviceExist: boolean;
    }>;
    verifyDevice: (input: {
        tenantId: string;
        userId: string;
        deviceName: string;
        totp: string;
        userContext: UserContext;
        securityOptions?: {
            enforceUserBan?: boolean;
            enforceIpBan?: boolean;
            ipAddress?: string;
        };
    }) => Promise<
        | {
              status: "OK";
              wasAlreadyVerified: boolean;
          }
        | {
              status: "UNKNOWN_DEVICE_ERROR";
          }
        | {
              status: "INVALID_TOTP_ERROR";
              currentNumberOfFailedAttempts: number;
              maxNumberOfFailedAttempts: number;
          }
        | {
              status: "LIMIT_REACHED_ERROR";
              retryAfterMs: number;
          }
        | {
              status: "IP_BANNED_ERROR" | "USER_BANNED_ERROR";
          }
    >;
    verifyTOTP: (input: {
        tenantId: string;
        userId: string;
        totp: string;
        userContext: UserContext;
        securityOptions?: {
            enforceUserBan?: boolean;
            enforceIpBan?: boolean;
            ipAddress?: string;
        };
    }) => Promise<
        | {
              status: "OK" | "UNKNOWN_USER_ID_ERROR";
          }
        | {
              status: "INVALID_TOTP_ERROR";
              currentNumberOfFailedAttempts: number;
              maxNumberOfFailedAttempts: number;
          }
        | {
              status: "LIMIT_REACHED_ERROR";
              retryAfterMs: number;
          }
        | {
              status: "IP_BANNED_ERROR" | "USER_BANNED_ERROR";
          }
    >;
};

export type APIOptions = {
    recipeImplementation: RecipeInterface;
    config: TypeNormalisedInput;
    recipeId: string;
    isInServerlessEnv: boolean;
    req: BaseRequest;
    res: BaseResponse;
};

export type APIInterface = {
    createDevicePOST:
        | undefined
        | ((input: {
              deviceName?: string;
              options: APIOptions;
              session: SessionContainerInterface;
              userContext: UserContext;
          }) => Promise<
              | {
                    status: "OK";
                    deviceName: string;
                    secret: string;
                    qrCodeString: string;
                }
              | {
                    status: "DEVICE_ALREADY_EXISTS_ERROR";
                }
              | GeneralErrorResponse
          >);

    listDevicesGET:
        | undefined
        | ((input: {
              options: APIOptions;
              session: SessionContainerInterface;
              userContext: UserContext;
          }) => Promise<
              | {
                    status: "OK";
                    devices: {
                        name: string;
                        period: number;
                        skew: number;
                        verified: boolean;
                    }[];
                }
              | GeneralErrorResponse
          >);

    removeDevicePOST:
        | undefined
        | ((input: {
              deviceName: string;
              options: APIOptions;
              session: SessionContainerInterface;
              userContext: UserContext;
          }) => Promise<
              | {
                    status: "OK";
                    didDeviceExist: boolean;
                }
              | GeneralErrorResponse
          >);

    verifyDevicePOST:
        | undefined
        | ((input: {
              googleRecaptchaToken?: string;
              securityServiceRequestId?: string;
              deviceName: string;
              totp: string;
              options: APIOptions;
              session: SessionContainerInterface;
              userContext: UserContext;
          }) => Promise<
              | {
                    status: "OK";
                    wasAlreadyVerified: boolean;
                }
              | {
                    status: "UNKNOWN_DEVICE_ERROR";
                }
              | {
                    status: "INVALID_TOTP_ERROR";
                    currentNumberOfFailedAttempts: number;
                    maxNumberOfFailedAttempts: number;
                }
              | {
                    status: "LIMIT_REACHED_ERROR";
                    retryAfterMs: number;
                }
              | GeneralErrorResponse
          >);

    verifyTOTPPOST:
        | undefined
        | ((input: {
              googleRecaptchaToken?: string;
              securityServiceRequestId?: string;
              totp: string;
              options: APIOptions;
              session: SessionContainerInterface;
              userContext: UserContext;
          }) => Promise<
              | {
                    status: "OK" | "UNKNOWN_USER_ID_ERROR";
                }
              | {
                    status: "INVALID_TOTP_ERROR";
                    currentNumberOfFailedAttempts: number;
                    maxNumberOfFailedAttempts: number;
                }
              | {
                    status: "LIMIT_REACHED_ERROR";
                    retryAfterMs: number;
                }
              | GeneralErrorResponse
          >);
};
