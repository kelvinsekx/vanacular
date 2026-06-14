import {
  Controller,
  Post,
  Get,
  Param,
  Delete,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { R2Service } from 'src/core/r2.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrismaService } from 'src/infra/database/prisma.service';
import { FileCreateDto } from './file.dto';

@Controller('file')
export class FileController {
  constructor(
    private readonly r2Service: R2Service,
    private readonly prisma: PrismaService,
  ) {}

  @Post('/image')
  @UseInterceptors(FileInterceptor('image'))
  async upLoadImage(
    @UploadedFile() image: Express.Multer.File,
    @Body() body: FileCreateDto,
  ) {
    const uploaded = await this.r2Service.upload(image);
    await this.prisma.asset.create({
      data: {
        key: uploaded.key,
        name: body.name,
        type: 'IMAGE',
        alt: body.alt,
      },
    });
    return {
      message: 'Image uploaded successfully',
    };
  }

  @Get('/get-assets')
  async getAssets() {
    return await this.prisma.asset.findMany();
  }

  @Delete('/:id')
  async delete(@Param('id') id: string) {
    const data = await this.prisma.asset.delete({
      where: { id },
    });

    if (data) {
      return {
        message: 'delete successful',
      };
    }

    return {};
  }
}
