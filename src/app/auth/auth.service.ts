import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entity/user.entity';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private jwtService: JwtService,
    @Inject(REQUEST) private req: any,
  ) {}

  async getTokens(userId: string, email: string) {
    const at = await this.jwtService.signAsync(
      {
        sub: userId,
        email: email,
      },
      {
        secret: process.env.ACCESS_TOKEN_SECRET, // Kunci rahasia (Simpan di .env nanti)
        expiresIn: '1d', // Masa berlaku 15 menit
      },
    );

    const rt = await this.jwtService.signAsync(
      {
        sub: userId,
        email: email,
      },
      {
        secret: process.env.REFRESH_TOKEN_SECRET, // Kunci rahasia (Simpan di .env nanti)
        expiresIn: '7d', // Masa berlaku 1 hari
      },
    );

    return { access_token: at, refresh_token: rt };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    if (!refreshToken) {
      await this.userRepo.update(userId, { refreshToken: '' });
      return;
    }

    const hash = await bcrypt.hash(refreshToken, 10);
    await this.userRepo.update(userId, {
      refreshToken: hash,
    });

    console.log('masuk sii');
  }

  async register(dto: RegisterDto) {
    // 1. Cek apakah email sudah terdaftar
    const userExists = await this.userRepo.findOne({
      where: [{ email: dto.email }, { username: dto.username }],
    });

    if (userExists) {
      const isEmailDuplicate = userExists.email === dto.email;
      throw new BadRequestException(
        isEmailDuplicate
          ? 'Email sudah digunakan, silakan gunakan email lain'
          : 'Username sudah digunakan',
      );
    }

    // 2. Hashing Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    // 3. Buat Object User Baru
    const newUser = this.userRepo.create({
      username: dto.username,
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });

    // 4. Simpan ke Database
    const savedUser = await this.userRepo.save(newUser);

    // 5. Hapus password dari response agar aman

    return {
      message: 'Registrasi berhasil',
      data: savedUser,
    };
  }

  async login(dto: LoginDto) {
    // 1. Cari user berdasarkan email
    // Kita gunakan .select karena di entity password diset { select: false }
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
      select: ['id', 'username', 'email', 'password'],
    });

    // 2. Jika user tidak ditemukan
    if (!user) {
      throw new BadRequestException('Kredensial salah (Email tidak terdaftar)');
    }

    // 3. Bandingkan password inputan dengan password di DB (Hashed)
    const isMatch = await bcrypt.compare(dto.password, user.password);

    // 4. Jika password tidak cocok
    if (!isMatch) {
      throw new BadRequestException('Kredensial salah (Password salah)');
    }
    // 3. Generate Tokens
    const tokens = await this.getTokens(user.id, user.email);
    // 4. SIMPAN REFRESH TOKEN KE DB (Encrypted)
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    // 5. Berhasil Login (Nantinya di sini kita akan me-return JWT Token)

    return {
      message: 'Login berhasil',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      ...tokens,
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    // 1. Cari user berdasarkan ID
    // Pastikan kita select hashedRefreshToken yang tadinya di-hide
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'email', 'refreshToken'],
    });

    // 2. Jika user tidak ditemukan atau tidak punya token di DB (sudah logout)
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Akses Ditolak (Silakan Login Ulang)');
    }

    // 3. Bandingkan refresh token dari user dengan yang ada di DB
    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    // 4. Jika tidak cocok, hapus token di DB (keamanan: indikasi token dicuri)
    if (!refreshTokenMatches) {
      await this.updateRefreshToken(user.id, ''); // Paksa logout di DB
      throw new ForbiddenException('Token tidak valid atau telah kadaluarsa');
    }

    // 5. Jika cocok, buatkan pasang token baru
    const tokens = await this.getTokens(user.id, user.email);

    // 6. Update kembali refresh token terbaru ke database (Token Rotation)
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }

  async getProfile() {
    const data = await this.userRepo.findOne({
      where: {
        id: this.req.user.sub,
      },
    });

    return {
      message: 'OK',
      data: data,
    };
  }
}
