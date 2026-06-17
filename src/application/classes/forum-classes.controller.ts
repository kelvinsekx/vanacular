import { Controller, Get, Param } from '@nestjs/common';
import { ClassRepository } from 'src/core/common/classes.repository';

@Controller('classes')
export class ForumClassesController {
  constructor(private classRepo: ClassRepository) {}

  @Get()
  async findAll() {
    return this.classRepo.getAllClasses();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return { data: await this.classRepo.findOneById(id)}
  }
}
