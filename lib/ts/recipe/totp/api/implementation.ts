import { APIInterface } from "../";
import TotpRecipe from "../recipe";
import SessionError from "../../session/error";
import MultiFactorAuthRecipe from "../../multifactorauth/recipe";

export default function getAPIInterface(): APIInterface {
    return {
        createDevicePOST: async function ({ deviceName, options, session, userContext }) {
            const userId = session.getUserId();

            let userIdentifierInfo: string | undefined = undefined;
            const emailOrPhoneInfo = await TotpRecipe.getInstanceOrThrowError().getUserIdentifierInfoForUserId(
                session.getUserId(),
                userContext
            );
            if (emailOrPhoneInfo.status === "OK") {
                userIdentifierInfo = emailOrPhoneInfo.info;
            } else if (emailOrPhoneInfo.status === "UNKNOWN_USER_ID_ERROR") {
                throw new SessionError({
                    type: SessionError.UNAUTHORISED,
                    message: "Unknown User ID provided",
                });
            } else if (emailOrPhoneInfo.status === "USER_IDENTIFIER_INFO_DOES_NOT_EXIST_ERROR") {
                // Ignore since UserIdentifierInfo is optional
            }

            return await options.recipeImplementation.createDevice({
                userId,
                userIdentifierInfo,
                deviceName: deviceName,
                userContext: userContext,
            });
        },

        listDevicesGET: async function ({ options, session, userContext }) {
            const userId = session.getUserId();

            return await options.recipeImplementation.listDevices({
                userId,
                userContext,
            });
        },

        removeDevicePOST: async function ({ deviceName, options, session, userContext }) {
            const userId = session.getUserId();

            return await options.recipeImplementation.removeDevice({
                userId,
                deviceName,
                userContext,
            });
        },

        verifyDevicePOST: async function ({ deviceName, totp, options, session, userContext }) {
            const userId = session.getUserId();
            const tenantId = session.getTenantId();

            const mfaInstance = MultiFactorAuthRecipe.getInstance();

            if (mfaInstance === undefined) {
                throw new Error("should never come here"); // TOTP can't work without MFA
            }

            const validateMfaRes = await mfaInstance.validateForMultifactorAuthBeforeFactorCompletion({
                tenantId,
                factorIdInProgress: "totp",
                session,
                isAlreadySetup: false, // since this is verifying a device
                userContext,
            });

            if (validateMfaRes.status === "MFA_FLOW_ERROR") {
                return {
                    status: "FACTOR_SETUP_NOT_ALLOWED_ERROR",
                    reason: validateMfaRes.reason,
                };
            }

            const res = await options.recipeImplementation.verifyDevice({
                tenantId,
                userId,
                deviceName,
                totp,
                userContext,
            });

            if (res.status === "OK") {
                const sessionRes = await mfaInstance.updateSessionAndUserAfterFactorCompletion({
                    session,
                    isFirstFactor: false,
                    factorId: "totp",
                    userContext,
                });

                if (sessionRes.status === "MFA_FLOW_ERROR") {
                    return {
                        status: "FACTOR_SETUP_NOT_ALLOWED_ERROR",
                        reason: sessionRes.reason,
                    };
                }
            }

            return res;
        },

        verifyTOTPPOST: async function ({ totp, options, session, userContext }) {
            const userId = session.getUserId();
            const tenantId = session.getTenantId();

            const mfaInstance = MultiFactorAuthRecipe.getInstance();
            if (mfaInstance === undefined) {
                throw new Error("should never come here"); // TOTP can't work without MFA
            }

            const res = await options.recipeImplementation.verifyTOTP({
                tenantId,
                userId,
                totp,
                userContext,
            });

            if (res.status === "OK") {
                const sessionRes = await mfaInstance.updateSessionAndUserAfterFactorCompletion({
                    session,
                    isFirstFactor: false,
                    factorId: "totp",
                    userContext,
                });

                if (sessionRes.status === "MFA_FLOW_ERROR") {
                    throw new Error("should never come here");
                }
            }

            return res;
        },
    };
}
