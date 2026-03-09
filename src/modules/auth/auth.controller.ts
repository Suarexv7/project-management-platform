import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
} from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Registrar un nuevo usuario' })
    @ApiResponse({ status: 201, description: 'Usuario registrado correctamente' })
    @ApiResponse({ status: 409, description: 'El email ya está en uso' })
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK) // Cambiamos el default de POST (201) a 200 para login
    @ApiOperation({ summary: 'Iniciar sesión y obtener token JWT' })
    @ApiResponse({ status: 200, description: 'Login exitoso, retorna el access_token' })
    @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }
}