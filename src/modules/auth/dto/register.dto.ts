import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class RegisterDto {
    @ApiProperty({
        example: 'John Doe',
        description: 'Full name of the user',
        minLength: 1,
        maxLength: 100,
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        example: 'john.doe@example.com',
        description: 'Unique email address of the user',
        format: 'email',
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 'contraseña123',
        description: 'User password (6-15 characters)',
        minLength: 6,
        maxLength: 15,
    })
    @IsNotEmpty()
    @IsString()
    @Length(6, 15)
    password: string;
}