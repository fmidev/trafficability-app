import { ConfigService } from '@nestjs/config';
import { AppDto } from './app.dto';
import { Answer } from './app.interface';
export declare class AppService {
    private configService;
    private readonly s3Client;
    private readonly URL_EXPIRATION_SECONDS;
    constructor(configService: ConfigService);
    getAnswers(): Promise<Answer[]>;
    getPresignedUrl(fileName: string, contentType: string): Promise<{
        uploadURL: string;
        Key: string;
        uuid: string;
    }>;
    postAnswers(appDto: AppDto): Promise<{
        statusCode: number;
        message: string;
        data: AppDto;
    }>;
}
