import {
  Controller,
  Post,
  Get,
  Param,
  Delete,
  Body,
  UseInterceptors,
  UploadedFile,
  InternalServerErrorException,
} from '@nestjs/common';
import { R2Service } from 'src/core/r2.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrismaService } from 'src/infra/database/prisma.service';
import { FileCreateDto } from './file.dto';
import { AssetType } from 'src/generated/prisma/enums';

@Controller('file')
export class FileController {
  constructor(
    private readonly r2Service: R2Service,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upLoadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: FileCreateDto,
  ) {
    try {
      const uploaded = await this.r2Service.upload(file);

      await this.prisma.asset.create({
        data: {
          key: uploaded.key,
          name: body.name,
          mimeType: file.mimetype,
          alt: body.alt,
          type: this.getAssetType(file),
        },
      });
      return {
        message: 'Image uploaded successfully',
      };
    } catch (err) {
      throw new InternalServerErrorException(
        'An error occurred while uploading file',
      );
    }
  }

  @Get('/get-assets')
  async getAssets() {
    return await this.prisma.asset.findMany();
  }

  getAssetType(file: Express.Multer.File): AssetType {
    const [category] = file.mimetype.split('/');
    switch (category) {
      case 'image':
        return AssetType.IMAGE;
      case 'video':
        return AssetType.VIDEO;
      case 'audio':
        return AssetType.AUDIO;

      default:
        return AssetType.UNKNOWN;
    }
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
