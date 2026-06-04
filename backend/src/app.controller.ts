import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { AppDto } from './app.dto';
import { Answer } from './app.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

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
      let message = '';
      if (err instanceof Error) {
        message = (err as Error).message;
      }
      res.status(500).json({
        message: 'Could not generate pre-signed URL',
        error: message,
      });
    }
  }

  @Get('/')
  async getAnswers(): Promise<Answer[]> {
    try {
      const res = await this.appService.getAnswers();
      return res;
    } catch (err) {
      console.error(err, 'In catch block');
      let message = '';
      if (err instanceof Error) {
        message = (err as Error).message;
      }
      throw new HttpException('bad reqeust', HttpStatus.BAD_REQUEST, {
        cause: message,
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
