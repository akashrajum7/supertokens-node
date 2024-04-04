// @ts-nocheck
import { APIInterface, APIOptions } from "../../types";
export declare type Response = {
    status: "OK";
    didConfigExist: boolean;
};
export default function deleteThirdPartyConfig(
    _: APIInterface,
    tenantId: string,
    options: APIOptions,
    userContext: any
): Promise<Response>;
