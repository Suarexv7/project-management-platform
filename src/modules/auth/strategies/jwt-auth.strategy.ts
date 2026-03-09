import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) { // Cosa 1: Extendemos la estrategia

    constructor(configService: ConfigService) {
        // Cosa 2: El constructor configura al "guardia"
        super({
            // Buscamos en el header 'Authorization' como 'Bearer <token>'
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            // El guardia no permite carnets vencidos
            ignoreExpiration: false,
            // La clave secreta para saber si el carnet es falso (desde .env)
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });
    }

    // Cosa 3: Metodo Validate 
    async validate(payload: any) {
        // El payload contiene 'sub' (ID) y 'email'
        // Lo que retornamos aquí se guarda en req.user
        return {
            userId: payload.sub,
            email: payload.email
        };
    }
}