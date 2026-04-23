import { Injectable, NotFoundException, InternalServerErrorException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comments } from 'src/entity/comments.entity';
import { Posts } from 'src/entity/posts.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comments)
    private readonly commentRepository: Repository<Comments>,
    @InjectRepository(Posts)
    private readonly postRepository: Repository<Posts>,
    @Inject(REQUEST) private readonly req: any, // Untuk ambil user dari JWT
  ) {}

  async create(dto: CreateCommentDto) {
    try {
      // 1. Cek apakah post ada
      const post = await this.postRepository.findOne({ where: { id: dto.postId } });
      if (!post) {
        throw new NotFoundException('Postingan tidak ditemukan');
      }

      // 2. Buat instance comment
      const comment = this.commentRepository.create({
        content: dto.content,
        user: this.req.user, // Ambil user dari auth guard
        posts: post,        // Hubungkan ke post terkait
      });

      // 3. Simpan
      const savedComment = await this.commentRepository.save(comment);

      return {
        message: 'Komentar berhasil ditambahkan',
        data: savedComment,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error(error);
      throw new InternalServerErrorException('Gagal menambahkan komentar');
    }
  }
}