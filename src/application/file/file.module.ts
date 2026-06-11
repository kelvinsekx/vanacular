import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { R2Service } from 'src/core/r2.service';

@Module({
  providers: [R2Service],
  controllers: [FileController],
})
export class FileModule {}
