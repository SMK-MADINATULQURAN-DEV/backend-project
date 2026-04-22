import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create.dto';
import { AtGuard } from 'src/common/guards/at.guard';
import { ListQueryDto } from './dto/list.dto';
@UseGuards(AtGuard)
@Controller('posts')
export class PostController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * Endpoint untuk membuat postingan baru
   * Menggunakan JwtAuthGuard agar this.req.user di service tidak undefined
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPostDto: CreatePostDto) {
    return await this.postsService.createPost(createPostDto);
  }

  @Get('my-posts')
  async list(@Query() listQueryDto: ListQueryDto) {
    console.log('quer', listQueryDto);
    return await this.postsService.getMyPosts(listQueryDto);
  }
}
