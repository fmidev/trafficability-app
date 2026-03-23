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

export function isAnswer(obj: any): obj is Answer {
  return (
    typeof obj.id === 'string' &&
    typeof obj.answer === 'string' &&
    typeof obj.createdAt === 'string' &&
    typeof obj.contestantName === 'string' &&
    typeof obj.certainty === 'string' &&
    typeof obj.file === 'string' &&
    typeof obj.fileDateTime === 'string' &&
    Array.isArray(obj.geoLocation) &&
    typeof obj.geoLocationAccuracy === 'number' &&
    (Array.isArray(obj.userGeoLocation) || obj.userGeoLocation === undefined) &&
    (Array.isArray(obj.fileGeoLocation) || obj.fileGeoLocation === undefined)
  );
}
