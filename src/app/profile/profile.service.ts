import { Inject, Injectable } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entity/user.entity";
import { Repository } from "typeorm";
import { EditDto } from "./dto/edit.dto";
@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @Inject(REQUEST) private req: any,
  ) {}
 
  async updateProfile(dto: EditDto) {
    // 1. Cari user berdasarkan ID untuk memastikan user ada
    const user = await this.userRepo.findOne({
      where: { id: this.req.user.id },
    });
 
    if (!user) {
      throw new Error("User tidak ditemukan");
    }
 
    // 2. Gunakan Object.assign atau spread untuk menimpa data lama dengan data baru
    // Kita memetakan field dari DTO ke entity User
    const updatedUser = Object.assign(user, {
      name: dto.name,
      location: dto.location,
      avatar: dto.avatar,
      bio: dto.bio,
      sampul: dto.sampul,
      // Tambahkan field lain jika ada di DTO seperti location
    });
 
    // 3. Simpan perubahan
    const result = await this.userRepo.save(updatedUser);
 
    // 4. Return response yang rapi
    return {
      message: "Profil berhasil diperbarui",
      data: result,
    };
  }
}