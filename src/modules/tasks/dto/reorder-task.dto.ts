import { IsInt, Min } from 'class-validator';

export class ReorderTaskDto {
    @IsInt()
    @Min(1)
    newOrder: number;
}