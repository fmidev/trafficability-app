export interface Answer {
    id: string;
    answer: string;
    contestantName: string;
    createdAt: string;
    certainty: string;
    file: string;
    fileDateTime: string;
    geoLocation: [number, number];
    geoLocationAccuracy: number;
    userGeoLocation?: [number | null, number | null];
    fileGeoLocation?: [number | null, number | null];
}
export declare function isAnswer(obj: any): obj is Answer;
