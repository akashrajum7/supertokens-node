// @ts-nocheck
import { APIInterface, APIOptions } from "../../types";
export declare type Response =
    | {
          status: "OK";
          createdNew: boolean;
      }
    | {
          status: "MULTITENANCY_NOT_ENABLED_ERROR";
      };
export default function createOrUpdateTenant(
    _: APIInterface,
    __: string,
    options: APIOptions,
    userContext: any
): Promise<Response>;
