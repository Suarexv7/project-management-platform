import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User } from '../../domain/entities/user.entity'; // Ajusta la ruta según tu proyecto
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto): Promise<any> {
        const { email, password, name } = registerDto;

        // 1. Verificar si el email ya existe
        const existingUser = await this.userRepo.findOne({ where: { email } });
        if (existingUser) {
            throw new ConflictException('Email already in use');
        }

        // 2. Encriptar el password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Crear y guardar el usuario
        const newUser = this.userRepo.create({
            name,
            email,
            password: hashedPassword,
        });

        await this.userRepo.save(newUser);

        // 4. RETORNAR SIN PASSWORD (USANDO DESESTRUCTURACIÓN)
        // Sacamos 'password' del objeto y el resto se guarda en 'userWithoutPassword'
        const { password: _, ...userWithoutPassword } = newUser;

        return userWithoutPassword;
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        // 1. Buscar usuario por email
        const user = await this.userRepo.findOne({ where: { email } });

        // Si no existe, lanzamos UnauthorizedException (Error 401)
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // 2. Comparar password con bcrypt.compare()
        const isPasswordValid = await bcrypt.compare(password, user.password);

        // Si la contraseña no coincide, lanzamos la misma excepción por seguridad
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // 3. Generar el token con jwtService.sign()
        // El 'sub' es el estándar de JWT para referirse al ID del sujeto
        const payload = { sub: user.id, email: user.email };

        // 4. Retornar el token (y opcionalmente datos básicos del usuario)
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        };
    }
}