export declare class AppDto {
    id: string;
    answer: string;
    contestantName: string;
    certainty: string;
    file: string;
    fileDateTime: string;
    geoLocation: [number, number];
    geoLocationAccuracy: number | null;
    userGeoLocation?: [number | null, number | null];
    fileGeoLocation?: [number | null, number | null];
}
