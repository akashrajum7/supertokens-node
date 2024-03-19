// @ts-nocheck
import { APIInterface, APIOptions } from "../../types";
import { TypeNormalisedInput } from "../../../passwordless/types";
import { UserContext } from "../../../../types";
declare type PasswordlessContactMethod = TypeNormalisedInput["contactMethod"];
declare type TenantLoginMethodType = {
    tenantId: string;
    emailPassword: {
        enabled: boolean;
    };
    passwordless: {
        enabled: boolean;
        contactMethod?: PasswordlessContactMethod;
    };
    thirdParty: {
        enabled: boolean;
    };
};
export declare type Response = {
    status: "OK";
    tenants: TenantLoginMethodType[];
};
export default function getTenantLoginMethodsInfo(
    _: APIInterface,
    __: string,
    ___: APIOptions,
    userContext: UserContext
): Promise<Response>;
export {};
