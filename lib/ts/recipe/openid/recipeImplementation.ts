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
import { RecipeInterface, TypeNormalisedInput } from "./types";
import { RecipeInterface as JWTRecipeInterface, JsonWebKey } from "../jwt/types";
import NormalisedURLPath from "../../normalisedURLPath";
import { GET_JWKS_API } from "../jwt/constants";
import { BaseRequest } from "../../framework";

export default function getRecipeInterface(
    config: TypeNormalisedInput,
    jwtRecipeImplementation: JWTRecipeInterface
): RecipeInterface {
    return {
        getOpenIdDiscoveryConfiguration: async function ({
            req,
            userContext,
        }: {
            req: BaseRequest;
            userContext: any;
        }): Promise<{
            status: "OK";
            issuer: string;
            jwks_uri: string;
        }> {
            let issuerDomain = await config.issuerDomain(req, userContext);
            let issuer = issuerDomain.getAsStringDangerous() + config.issuerPath.getAsStringDangerous();
            let jwks_uri =
                issuerDomain.getAsStringDangerous() +
                config.issuerPath.appendPath(new NormalisedURLPath(GET_JWKS_API)).getAsStringDangerous();
            return {
                status: "OK",
                issuer,
                jwks_uri,
            };
        },
        createJWT: async function ({
            req,
            payload,
            validitySeconds,
            useStaticSigningKey,
            userContext,
        }: {
            req: BaseRequest;
            payload?: any;
            validitySeconds?: number;
            useStaticSigningKey?: boolean;
            userContext: any;
        }): Promise<
            | {
                  status: "OK";
                  jwt: string;
              }
            | {
                  status: "UNSUPPORTED_ALGORITHM_ERROR";
              }
        > {
            payload = payload === undefined || payload === null ? {} : payload;
            let issuerDomain = await config.issuerDomain(req, userContext);
            let issuer = issuerDomain.getAsStringDangerous() + config.issuerPath.getAsStringDangerous();
            return await jwtRecipeImplementation.createJWT({
                req,
                payload: {
                    iss: issuer,
                    ...payload,
                },
                useStaticSigningKey,
                validitySeconds,
                userContext,
            });
        },
        getJWKS: async function (input): Promise<{ keys: JsonWebKey[] }> {
            return await jwtRecipeImplementation.getJWKS(input);
        },
    };
}
