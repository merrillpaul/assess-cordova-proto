export interface IOtpResult {
    success: boolean;
    message: string;
}

export interface IMfaState {
    currentMfaType?: string;
    currentCommunicatorAddress?: string;
    triggeringOtp: boolean;
    triggerOtpMessage?: string;
    triggerOtpSuccess?: boolean;
    loggingIn?: boolean;
    mfaSuccess?: boolean;
    errors: any[];
}