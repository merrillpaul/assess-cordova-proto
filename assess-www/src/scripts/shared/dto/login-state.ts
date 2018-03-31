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

export interface ILoginUserInfo {
    userName: string;
    userId: string;
    eligibleSubtestGUIDs: string[];
    timeZoneOffset: string;
    timeZoneLabel: string;
    mfaDetails?: IMfaDetails;
};

export interface ILoginState {
    isLoggingIn: boolean;
    startedRequest?: boolean;
	loggedIn: boolean;
	userInfo?: ILoginUserInfo;
	errors?: string[];
};

export interface ILoginFormState {
    usernameInError: boolean;
    passwordInError: boolean;
    fetching: boolean;
}
