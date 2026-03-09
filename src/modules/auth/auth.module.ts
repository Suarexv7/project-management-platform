import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/domain/entities/user.entity';
// Asegúrate de que esta ruta sea exacta según tu estructura de carpetas
import { JwtStrategy } from './strategies/jwt-auth.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    // 1. Configuramos Passport para que use 'jwt' por defecto
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h',
        } as any,
      }),
    }),
  ],
  controllers: [AuthController],
  // 2. Registramos la estrategia y el servicio
  providers: [AuthService, JwtStrategy],
  // 3. Exportamos para que otros módulos (como Projects) puedan usar la seguridad
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule { }