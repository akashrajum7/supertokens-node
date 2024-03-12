// @ts-nocheck
import { TypeInput } from "../../../../../ingredients/smsdelivery/services/twilio";
import { SmsDeliveryInterface } from "../../../../../ingredients/smsdelivery/types";
import { TypeThirdPartyPasswordlessSmsDeliveryInput } from "../../../types";
import { UserContext } from "../../../../../types";
export default class TwilioService implements SmsDeliveryInterface<TypeThirdPartyPasswordlessSmsDeliveryInput> {
    private passwordlessTwilioService;
    constructor(config: TypeInput<TypeThirdPartyPasswordlessSmsDeliveryInput>);
    sendSms: (
        input: TypeThirdPartyPasswordlessSmsDeliveryInput & {
            userContext: UserContext;
        }
    ) => Promise<void>;
}
