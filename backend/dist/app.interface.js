"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAnswer = isAnswer;
function isAnswer(obj) {
    return (typeof obj.id === 'string' &&
        typeof obj.answer === 'string' &&
        typeof obj.createdAt === 'string' &&
        typeof obj.contestantName === 'string' &&
        typeof obj.certainty === 'string' &&
        typeof obj.file === 'string' &&
        typeof obj.fileDateTime === 'string' &&
        Array.isArray(obj.geoLocation) &&
        typeof obj.geoLocationAccuracy === 'number' &&
        (Array.isArray(obj.userGeoLocation) || obj.userGeoLocation === undefined) &&
        (Array.isArray(obj.fileGeoLocation) || obj.fileGeoLocation === undefined));
}
//# sourceMappingURL=app.interface.js.map