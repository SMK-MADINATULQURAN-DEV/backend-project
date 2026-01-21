import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'refresh_token') {
  constructor() {
    super({
      // Cara mengambil token: dari Header 'Authorization: Bearer <token>'
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'testing', // Harus sama dengan yang ada di Service
    });
  }

  // Jika token asli, data di dalamnya (id & email) akan dimasukkan ke req.user
  validate(payload: any) {
    return payload;
  }
}
