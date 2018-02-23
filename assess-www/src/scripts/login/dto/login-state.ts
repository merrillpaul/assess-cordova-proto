export interface LoginUserInfo {
    userName: string;
    userId: string;
    eligibleSubtestGUIDs: string[];
    timeZoneOffset: string;
    timeZoneLabel: string;
    mfaDetails?: any;
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
