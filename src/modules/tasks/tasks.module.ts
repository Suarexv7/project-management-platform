import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from 'src/domain/entities/project.entity';
import { TaskItem } from 'src/domain/entities/task.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, TaskItem]),
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService]
})
export class TasksModule { }
