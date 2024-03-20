// @ts-nocheck
import { TypeInput, TypeNormalisedInput, TenantConfig } from "./types";
import { UserContext } from "../../types";
export declare function validateAndNormaliseUserInput(config?: TypeInput): TypeNormalisedInput;
export declare const isValidFirstFactor: (
    tenantId: string,
    factorId: string,
    userContext: UserContext,
    tenantInfoFromCore?: Omit<TenantConfig, "coreConfig"> | undefined
) => Promise<
    | {
          status: "OK";
      }
    | {
          status: "INVALID_FIRST_FACTOR_ERROR";
      }
    | {
          status: "TENANT_NOT_FOUND_ERROR";
      }
>;
export declare const getValidFirstFactors: ({
    firstFactorsFromCore,
    staticFirstFactors,
    allAvailableFirstFactors,
    tenantId,
    userContext,
}: {
    firstFactorsFromCore: string[] | undefined;
    staticFirstFactors: string[] | undefined;
    allAvailableFirstFactors: string[];
    tenantId: string;
    userContext: UserContext;
}) => Promise<string[]>;
