import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
    IsOptional,
    IsEnum,
    IsNumber,
} from 'class-validator';
import { Priority } from 'src/domain/entities/task.entity';

export class CreateTaskDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsOptional()
    @ApiProperty({ enum: Priority })
    @IsEnum(Priority)
    priority: Priority;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    order: number;

}