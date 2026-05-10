import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ForumService } from './forum.service';
import { Roles, Role } from '../roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from '../roles.guard';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';

@Controller('forums')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Post()
  create(@Body() createForumDto: CreateForumDto) {
    return this.forumService.create(createForumDto);
  }

  @Get()
  findAll() {
    return this.forumService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.forumService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateForumDto: UpdateForumDto) {
    return this.forumService.update(+id, updateForumDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.forumService.remove(+id);
  }

  @Get(':id/classes')
  findAllClasses(@Param('id') id: string) {
    return this.forumService.findAllClass(id);
  }
}
