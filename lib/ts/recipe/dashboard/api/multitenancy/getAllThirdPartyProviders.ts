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
import { APIInterface, APIOptions } from "../../types";
import Multitenancy from "../../../multitenancy";
import SuperTokensError from "../../../../error";
import { ProviderConfig } from "../../../thirdparty/types";
import MultitenancyRecipe from "../../../multitenancy/recipe";
import { mergeProvidersFromCoreAndStatic } from "../../../thirdparty/providers/configUtils";

export type Response = {
    status: "OK";
    providers: ProviderConfig[];
};

export default async function getAllThirdPartyProviders(
    _: APIInterface,
    __: string,
    options: APIOptions,
    userContext: any
): Promise<Response> {
    const tenantId = options.req.getKeyValueFromQuery("tenantId");

    if (typeof tenantId !== "string" || tenantId === "") {
        throw new SuperTokensError({
            message: "Missing required parameter 'tenantId'",
            type: SuperTokensError.BAD_INPUT_ERROR,
        });
    }

    const tenantRes = await Multitenancy.getTenant(tenantId, userContext);

    const providersFromCore = tenantRes?.thirdParty?.providers ?? [];
    const mtRecipe = MultitenancyRecipe.getInstance();
    const staticProviders = mtRecipe?.staticThirdPartyProviders ?? [];

    const allProvidersConfig = mergeProvidersFromCoreAndStatic(providersFromCore, staticProviders).map(
        (provider) => provider.config
    );

    return {
        status: "OK",
        providers: allProvidersConfig,
    };
}
