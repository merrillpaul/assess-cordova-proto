export interface IBatteryInfo {
    assessments: IAssessment[];
    deletedAssessmentIds: string[];
}

export interface IPatient {
    dob: string;
    gender: string;
    id: string;
    name: string;
}

export interface ISubtest {
    abbr: string;
    normType: string;
    subtestGUID: string;
    subtestName: string;
    testGUID: string;
    testName: string;
}

export interface IBattery {
    name: string;
    subtests: ISubtest[];
    practiceMode: boolean;
}

export interface IAssessment {
    administrationDate: string;
    id: string;
    testLocation: string;
    title: string;
    hasObservations: boolean;
    patient: IPatient;
    examiners: string[];
    grades: string[];
    battery?: IBattery;
}