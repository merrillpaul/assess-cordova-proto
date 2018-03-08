export interface IMfaType {
    communicatorAddress?: string;
    expirationTimeInMillis?: number;
    mfaTypeKey: string;
    orderOfPreference: number;
}

export interface IMfaDetails {
    mfaVerified: boolean;
    codeEntryFldName?: string;
    mfaTypes?: IMfaType[];    
    postUrl?: string;
    rememberMeFldName?: string;
    typeFldName?: string;
    reAuthTimeout?: number;
}

export interface LoginUserInfo {
    userName: string;
    userId: string;
    eligibleSubtestGUIDs: string[];
    timeZoneOffset: string;
    timeZoneLabel: string;
    mfaDetails?: IMfaDetails;
};

export interface LoginState {
    isLoggingIn: boolean;
    startedRequest?: boolean;
	loggedIn: boolean;
	userInfo?: LoginUserInfo;
	errors?: string[];
};

export interface LoginFormState {
    usernameInError: boolean;
    passwordInError: boolean;
    fetching: boolean;
}
