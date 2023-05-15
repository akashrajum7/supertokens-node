// @ts-nocheck
import Recipe from "./recipe";
import { TypeInput, TypeNormalisedInput } from "./types";
import { NormalisedAppinfo } from "../../types";
import { BaseRequest } from "../../framework";
export declare function validateAndNormaliseUserInput(
    _: Recipe,
    appInfo: NormalisedAppinfo,
    config: TypeInput
): TypeNormalisedInput;
export declare function getEmailVerifyLink(input: {
    appInfo: NormalisedAppinfo;
    req: BaseRequest;
    token: string;
    recipeId: string;
    userContext: any;
}): Promise<string>;
