import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Latihan } from 'src/latihan/latihan.entity';
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT), 
  username: process.env.DB_USERNAME, 
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_DATABASE,
  entities: [Latihan],
  synchronize: true,
  // logging: true,
};