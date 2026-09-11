import { AppService } from './app.service';
import { AppDto } from './app.dto';
import { Answer } from './app.interface';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getSignedURL(fileName: string, contentType: string, res: any): Promise<any>;
    getAnswers(): Promise<Answer[]>;
    postAnswer(createDto: AppDto): Promise<{
        statusCode: number;
        message: string;
        data: any;
    }>;
}
