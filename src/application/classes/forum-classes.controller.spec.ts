import { Test, TestingModule } from '@nestjs/testing';
import { ForumClassesController } from './forum-classes.controller';

describe('ForumClassesController', () => {
  let controller: ForumClassesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForumClassesController],
    }).compile();

    controller = module.get<ForumClassesController>(ForumClassesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
