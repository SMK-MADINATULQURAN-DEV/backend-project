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
import { ResendDto } from './dto/resend.dto';
import { randomBytes, randomInt } from 'crypto';
import { MailService } from '../mail/mail.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginGoogleDto } from './dto/login-google.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private jwtService: JwtService,
    private mailService: MailService,
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
      throw new UnauthorizedException('Akses Ditolak (Silakan Login Ulang)');
    }

    // 3. Bandingkan refresh token dari user dengan yang ada di DB
    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    // 4. Jika tidak cocok, hapus token di DB (keamanan: indikasi token dicuri)
    if (!refreshTokenMatches) {
      await this.updateRefreshToken(user.id, ''); // Paksa logout di DB
      throw new UnauthorizedException('Token tidak valid atau telah kadaluarsa');
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

  async resendVerifikasiEmail(dto: ResendDto) {
    // 1. cek email ada atau enggk
    const userExists = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    //2. Handle Jika tidak ada

    if (!userExists) {
      throw new BadRequestException('Email tidk ditemukan');
    }

    //3. jika ada
    const token = randomBytes(32).toString('hex'); // membuat token
    const link = `${process.env.URL_FRONTEND}/verifikasi-email?userId=${userExists.id}&token=${token}`;
    await this.mailService.resendEmailVerifikasi({
      link: link,
      email: userExists.email,
      name: userExists.name,
    });

    // jika succes, upate emailVerifikasiToken di tabel
    await this.userRepo.update(userExists.id, {
      emailVerificationToken: token,
    });

    return {
      message: 'Silahkan cek email',
    };
  }

  async verifikasiEmail(userId: string, token: string) {
    // 1,. cek di tabel user ada enggk data dengna kombinasi userId dan token

    const user = await this.userRepo.findOne({
      where: {
        id: userId,
        emailVerificationToken: token,
      },
    });

    // 2. jika tidak ada makaa berikan reponse erro
    if (!user) {
      throw new BadRequestException('Token tidak valid');
    }

    // 3. kita ubah email isEmailVerified jdi true dan emailVerificationToken

    await this.userRepo.update(
      {
        id: userId,
      },
      {
        isEmailVerified: true,
      },
    );

    return {
      message: 'email terverifikasi',
    };
  }

  async lupaPassword(dto: ResendDto) {
    const userExists = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (!userExists) {
      throw new BadRequestException('Email tidk ditemukan');
    }
    const otp = randomInt(100000, 999999).toString();

    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 10);

    const expiredTimeDisplay = expires.toLocaleTimeString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    await this.userRepo.update(userExists.id, {
      resetPasswordToken: otp,
      resetPasswordExpires: expires,
    });

    await this.mailService.lupaPassword({
      email: userExists.email,
      otp: otp,
      expiredTime: expiredTimeDisplay,
    });

    return {
      otp: otp,
      message: 'OTP Berhasil Terkirim',
    };

    return otp;
  }

  async resetPassword(dto: ResetPasswordDto) {
    // 1. Cari user berdasarkan email
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException('User tidak ditemukan');
    }

    // 2. Cek apakah kode OTP cocok
    if (user.resetPasswordToken !== dto.otp) {
      throw new BadRequestException(
        `Kode OTP salah ${user.resetPasswordToken} ${dto.otp}`,
      );
    }

    // 3. Cek apakah OTP sudah kedaluwarsa
    const now = new Date();
    if (now > user.resetPasswordExpires) {
      throw new BadRequestException(
        'Kode OTP sudah kedaluwarsa, silakan minta kode baru',
      );
    }

    // 4. Hash password baru sebelum disimpan
    // Asumsi menggunakan bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    // 5. Update password dan bersihkan token OTP (security best practice)
    await this.userRepo.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: '', // Hapus token agar tidak bisa dipakai lagi
      resetPasswordExpires: '', // Hapus waktu expired
    });

    return {
      message: 'Password berhasil diperbarui, silakan login kembali',
    };
  }

  async loginGoogle(dto: LoginGoogleDto) {
    // 1. Cari user berdasarkan email
    // Kita gunakan .select karena di entity password diset { select: false }
    let user = await this.userRepo.findOne({
      where: { email: dto.email },
      select: ['id', 'username', 'email', 'password'],
    });

    console.log("dto", dto)

    // 2. Jika user tidak ditemukan
    if (!user) {
      const newUser = this.userRepo.create({
        name: dto.name,
        email: dto.email,
        username: dto.email,
        avatar : dto.avatar,
        isEmailVerified: true,
      });

      // 4. Simpan ke Database
      user = await this.userRepo.save(newUser);
    }

    const tokens = await this.getTokens(user.id, user.email);
    // 4. SIMPAN REFRESH TOKEN KE DB (Encrypted)
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    // 5. Berhasil Login (Nantinya di sini kita akan me-return JWT Token)

    return {
      message: 'Login Google berhasil',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      ...tokens,
    };
  }
}
