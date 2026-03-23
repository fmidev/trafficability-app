import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppEntity } from './app.entity';
import { Repository } from 'typeorm';
import { AppDto } from './app.dto';
import { ConfigService } from '@nestjs/config';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        ConfigService,
        {
          provide: getRepositoryToken(AppEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  describe('getAnswers', () => {
    it('should return an array of answers', async () => {
      const result = [new AppEntity()];
      jest.spyOn(appService, 'getAnswers').mockResolvedValue(result);

      expect(await appController.getAnswers()).toBe(result);
    });
  });

  describe('postAnswer', () => {
    it('should return the created answer', async () => {
      const createDto: AppDto = {
        answer: 'sample answer',
        lat: 0,
        lon: 1,
        file: 'sample file',
        evaluateAnswer: 'correct',
      };

      const result = {
        statusCode: 200,
        message: 'Answer created successfully',
        data: {
          answer: 'sample answer',
          lat: 0,
          lon: 1,
          file: 'sample file',
          evaluateAnswer: 'correct',
        },
      };
      jest.spyOn(appService, 'postAnswers').mockResolvedValue(result);

      expect(await appController.postAnswer(createDto)).toStrictEqual(result);
    });
  });
});
