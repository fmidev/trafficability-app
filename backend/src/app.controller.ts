import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Answer } from './app.interface';
import { AppDto } from './app.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  async getAnswers(): Promise<Answer[]> {
    try {
      const res = await this.appService.getAnswers();
      return res;
    } catch (err) {
      console.error(err, 'In catch block');
      throw new HttpException('bad reqeust', HttpStatus.BAD_REQUEST, {
        cause: err.message,
      });
    }
  }

  @Get('/presigned-url/:fileName')
  async getSignedURL(
    @Param('fileName') fileName: string,
    @Query('contentType') contentType: string,
    @Res() res,
  ): Promise<any> {
    try {
      const { uploadURL, Key, uuid } = await this.appService.getPresignedUrl(
        fileName,
        contentType,
      );
      res.json({ uploadURL, Key, uuid });
    } catch (err) {
      res.status(500).json({
        message: 'Could not generate pre-signed URL',
        error: err.message,
      });
    }
  }

  @Post('/')
  async postAnswer(@Body() createDto: AppDto): Promise<{
    statusCode: number;
    message: string;
    data: any;
  }> {
    const res = await this.appService.postAnswers(createDto);
    return {
      statusCode: 200,
      message: 'Answer created successfully',
      data: res.data,
    };
  }
}
