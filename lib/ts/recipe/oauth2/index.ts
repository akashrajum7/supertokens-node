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

import { UserContext } from "../../types";
import Recipe from "./recipe";
import {
    APIInterface,
    RecipeInterface,
    APIOptions,
    CreateOAuth2ClientInput,
    UpdateOAuth2ClientInput,
    DeleteOAuth2ClientInput,
    GetOAuth2ClientsInput,
} from "./types";

export default class Wrapper {
    static init = Recipe.init;

    static async getOAuth2Clients(input: GetOAuth2ClientsInput, userContext: UserContext) {
        return await Recipe.getInstanceOrThrowError().recipeInterfaceImpl.getOAuth2Clients(input, userContext);
    }
    static async createOAuth2Client(input: CreateOAuth2ClientInput, userContext: UserContext) {
        return await Recipe.getInstanceOrThrowError().recipeInterfaceImpl.createOAuth2Client(input, userContext);
    }
    static async updateOAuth2Client(input: UpdateOAuth2ClientInput, userContext: UserContext) {
        return await Recipe.getInstanceOrThrowError().recipeInterfaceImpl.updateOAuth2Client(input, userContext);
    }
    static async deleteOAuth2Client(input: DeleteOAuth2ClientInput, userContext: UserContext) {
        return await Recipe.getInstanceOrThrowError().recipeInterfaceImpl.deleteOAuth2Client(input, userContext);
    }
}

export let init = Wrapper.init;

export let getOAuth2Clients = Wrapper.getOAuth2Clients;

export let createOAuth2Client = Wrapper.createOAuth2Client;

export let updateOAuth2Client = Wrapper.updateOAuth2Client;

export let deleteOAuth2Client = Wrapper.deleteOAuth2Client;

export type { APIInterface, APIOptions, RecipeInterface };
