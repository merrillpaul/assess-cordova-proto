export interface BatteryInfo {
    assessments: Assessment[];
    deletedAssessmentIds: string[];
}

export interface Patient {
    dob: string;
    gender: string;
    id: string;
    name: string;
}

export interface Subtest {
    abbr: string;
    normType: string;
    subtestGUID: string;
    subtestName: string;
    testGUID: string;
    testName: string;
}

export interface Battery {
    name: string;
    subtests: Subtest[];
    practiceMode: boolean;
}

export interface Assessment {
    administrationDate: string;
    id: string;
    testLocation: string;
    title: string;
    hasObservations: boolean;
    patient: Patient;
    examiners: string[];
    grades: string[];
    battery?: Battery;
}