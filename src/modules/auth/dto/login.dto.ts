import { PickType } from '@nestjs/swagger';
import { RegisterDto } from '../dto/register.dto';

/**
 * DTO for user authentication
 * Inherits email and password from RegisterAuthDto with its Swagger documentation
 */
export class LoginDto extends PickType(RegisterDto, [
    'email',
    'password',
] as const) { }