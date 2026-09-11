"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const uuid_1 = require("uuid");
const mimeTypes = require("mime-types");
let AppService = class AppService {
    constructor(configService) {
        this.configService = configService;
        this.URL_EXPIRATION_SECONDS = 60 * 2;
        const awsRegion = this.configService.get('AWS_REGION');
        const s3Endpoint = this.configService.get('S3_ENDPOINT');
        this.s3Client = new client_s3_1.S3Client({
            region: awsRegion,
            endpoint: s3Endpoint,
            forcePathStyle: true,
        });
    }
    async getAnswers() {
        try {
            return [];
        }
        catch (err) {
            console.error(err, 'Error from server');
            throw new common_1.InternalServerErrorException('Could not fetch answers');
        }
    }
    async getPresignedUrl(fileName, contentType) {
        const uuid = (0, uuid_1.v4)();
        const imagePrefix = this.configService.get('RESPONSE_S3_IMAGE_PREFIX');
        if (!imagePrefix?.trim()) {
            throw new Error('Image prefix is not defined in the configuration');
        }
        const Key = `${imagePrefix.trim()}/${uuid}.${mimeTypes.extension(contentType)}`;
        try {
            const photoBucket = this.configService.get('RESPONSE_S3_BUCKET');
            if (!photoBucket) {
                throw new Error('Bucket name is not defined in the configuration');
            }
            const command = new client_s3_1.PutObjectCommand({
                Bucket: photoBucket,
                Key,
                ContentType: contentType,
            });
            const uploadURL = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, {
                expiresIn: this.URL_EXPIRATION_SECONDS,
            });
            return {
                uploadURL,
                Key,
                uuid,
            };
        }
        catch (error) {
            console.error('Error generating pre-signed URL:', error);
            throw new common_1.InternalServerErrorException('Could not generate pre-signed URL');
        }
    }
    async postAnswers(appDto) {
        try {
            const answerData = {
                ...appDto,
                createdAt: new Date().toISOString(),
            };
            const answerBucket = this.configService.get('RESPONSE_S3_BUCKET');
            const answerPrefix = this.configService.get('RESPONSE_S3_ANSWER_PREFIX');
            if (!answerBucket?.trim()) {
                throw new Error('Bucket name is not defined in the configuration');
            }
            if (!answerPrefix?.trim()) {
                throw new Error('Answer prefix is not defined in the configuration');
            }
            const currentDateTime = new Date().getTime();
            const objectKey = `${answerPrefix}/answer-${currentDateTime}.json`;
            const s3Params = {
                Bucket: answerBucket,
                Key: objectKey,
                Body: JSON.stringify(answerData),
                ContentType: 'application/json',
            };
            try {
                await this.s3Client.send(new client_s3_1.PutObjectCommand(s3Params));
            }
            catch (error) {
                console.error('Error saving data to S3:', error);
                throw new common_1.InternalServerErrorException('Could not save answers');
            }
            return {
                statusCode: 200,
                message: 'Answers saved successfully',
                data: answerData,
            };
        }
        catch (error) {
            console.error('Error saving data to DynamoDB:', error);
            throw new common_1.InternalServerErrorException('Could not save answers');
        }
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AppService);
//# sourceMappingURL=app.service.js.map