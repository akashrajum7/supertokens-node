// @ts-nocheck
import { APIInterface, APIOptions } from "../../types";
export declare type Response = {
    status: "OK";
    didExist: boolean;
};
export default function deleteTenant(
    _: APIInterface,
    tenantId: string,
    __: APIOptions,
    userContext: any
): Promise<Response>;
