import { Body, Controller, Put, UseGuards } from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { AtGuard } from "src/common/guards/at.guard";
import { EditDto } from "./dto/edit.dto";
 
@UseGuards(AtGuard)
@Controller("profile")
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
 
  
  @Put("update")
  async getProfile(@Body() dto: EditDto) {
    return this.profileService.updateProfile(dto);
  }
}