// @ts-nocheck
import { APIInterface, APIOptions } from "../../types";
export declare type Response = {
    status: "OK";
};
export default function deleteTenant(
    _: APIInterface,
    __: string,
    options: APIOptions,
    userContext: any
): Promise<Response>;
