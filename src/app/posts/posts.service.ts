import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { Repository, DataSource } from 'typeorm';
import { CreatePostDto } from './dto/create.dto';
import { Posts } from 'src/entity/posts.entity';
import { ListQueryDto } from './dto/list.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Posts)
    private readonly postRepository: Repository<Posts>,
    @Inject(REQUEST) private req: any,
    private readonly dataSource: DataSource,
  ) {}

  async createPost(dto: CreatePostDto) {
    // Menggunakan Transaction untuk menjamin integritas data Post & Media
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    // await queryRunner.startTransaction();

    try {
      // 1. Inisialisasi entitas Post
      const post = this.postRepository.create({
        content: dto.content,
        user: this.req.user, // Hubungkan dengan user yang sedang login
        medias: dto.medias, // Masukkan array media (TypeORM akan handle relasinya)
      });

      // 2. Simpan Post (otomatis menyimpan ke tabel medias karena OneToMany)
      const savedPost = await queryRunner.manager.save(post);

      //   await queryRunner.commitTransaction();

      return {
        message: 'OK',
        data: savedPost,
      };
    } catch (err) {
      console.log('err', err);
      // Jika salah satu gagal (misal: simpan media error), batalkan semua
      //   await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Gagal membuat postingan');
    } finally {
      await queryRunner.release();
    }
  }

  // list

  async getMyPosts(query: ListQueryDto) {
    const { page = 1, limit = 10 } = query;

    console.log(query);
    const skip = (page - 1) * limit;

    try {
      // Menggunakan findAndCount untuk mendapatkan data + total count
      const [data, total] = await this.postRepository.findAndCount({
        where: {
          user: { id: this.req.user.id }, // Filter berdasarkan user login
        },
        relations: {
          medias: true,
          likes: true,
          user: true,
          comments: {
            user: true, // Ambil data orang yang komentar
          },
        },

        select: {
          user: { id: true, name: true, avatar: true }, // Jangan ambil password/email
          comments: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              id: true,
              name: true,
              avatar: true, // Hanya ambil info dasar si komentator
            },
          },
        },

        order: {
          createdAt: 'DESC', // Urutkan dari terbaru
        },
        take: limit, // Limit data
        skip: skip, // Offset data
      });

      return {
        message: 'Success fetch posts',
        data,
        meta: {
          totalItems: total,
          itemCount: data.length,
          itemsPerPage: limit,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        },
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Gagal mengambil data postingan');
    }
  }

  async getRandomFeed(query: ListQueryDto) {
  const { page = 1, limit = 10, search } = query;
  const skip = (page - 1) * limit;

  const seed = this.req.user?.id
    ? parseInt(this.req.user.id.replace(/\D/g, '').substring(0, 5))
    : 123;

  try {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      // 1. Pilih hanya kolom post yang diperlukan
      .select(['post.id', 'post.content', 'post.createdAt'])
      // 2. Join User (hanya ambil info dasar pembuat post)
      .leftJoin('post.user', 'user')
      .addSelect(['user.id', 'user.name', 'user.avatar', 'user.username'])
      // 3. Join Medias (ambil semua kolom media biasanya perlu untuk render)
      .leftJoinAndSelect('post.medias', 'medias')
      // 4. Join Likes & Comments (Hanya untuk menghitung jumlah/data dasar)
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoin('post.comments', 'comments')
      .addSelect(['comments.id', 'comments.content', 'comments.createdAt'])
      // 5. Join User di dalam Comments (Hanya info dasar komentator)
      .leftJoin('comments.user', 'commentUser')
      .addSelect(['commentUser.id', 'commentUser.name', 'commentUser.avatar']);

    if (search) {
      queryBuilder.where('post.content LIKE :search', {
        search: `%${search}%`,
      });
      queryBuilder.orderBy('post.createdAt', 'DESC');
    } else {
      queryBuilder.orderBy(`RAND(${seed})`);
    }

    // Menggunakan setMaxResults dan setFirstResult lebih aman untuk relasi OneToMany
    queryBuilder.take(limit).skip(skip);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      message: search
        ? `Hasil pencarian untuk: ${search}`
        : 'Success fetch explore feed',
      data,
      meta: {
        totalItems: total,
        itemCount: data.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
      },
    };
  } catch (error) {
    console.error('Error Feed:', error);
    throw new InternalServerErrorException('Gagal mengambil data');
  }
}
  

  // list random

  // async getRandomFeed(query: PostQueryDto) {
  //   const { page = 1, limit = 10 } = query;
  //   const skip = (page - 1) * limit;

  //   // Gunakan ID user atau angka statis sebagai 'seed' agar pagination konsisten
  //   // Jika ingin benar-benar acak setiap refresh, biarkan kosong: RAND()
  //   const seed = this.req.user?.id ? parseInt(this.req.user.id.replace(/\D/g, '').substring(0, 5)) : 123;

  //   try {
  //     const queryBuilder = this.postRepository.createQueryBuilder('post')
  //       // Load relasi agar data lengkap (User pembuat, Media, Jumlah Like/Comment)
  //       .leftJoinAndSelect('post.user', 'user')
  //       .leftJoinAndSelect('post.medias', 'medias')
  //       .leftJoinAndSelect('post.likes', 'likes')
  //       .leftJoinAndSelect('post.comments', 'comments')

  //       // Fungsi Random MySQL: RAND(seed)
  //       .orderBy(`RAND(${seed})`)
  //       .take(limit)
  //       .skip(skip);

  //     const [data, total] = await queryBuilder.getManyAndCount();

  //     return {
  //       message: "Success fetch explore feed",
  //       data,
  //       meta: {
  //         totalItems: total,
  //         itemCount: data.length,
  //         itemsPerPage: limit,
  //         totalPages: Math.ceil(total / limit),
  //         currentPage: Number(page),
  //       },
  //     };
  //   } catch (error) {
  //     console.error('Error Random Feed:', error);
  //     throw new InternalServerErrorException('Gagal mengambil feed');
  //   }
  // }
}
