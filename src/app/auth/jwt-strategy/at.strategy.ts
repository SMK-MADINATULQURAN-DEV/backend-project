import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'access_token') {
  constructor() {
    super({
      // Cara mengambil token: dari Header 'Authorization: Bearer <token>'
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'rahasia', // Harus sama dengan yang ada di Service
    });
  }

  // Jika token asli, data di dalamnya (id & email) akan dimasukkan ke req.user
  validate(payload: any) {
    return payload;
  }
}
