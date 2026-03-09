import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
    IsOptional,
} from 'class-validator';
import { Project } from '../entities/project.entity';

export class CreateProjectDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    description?: string;

}