import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from 'src/domain/entities/project.entity';
import { TaskItem } from 'src/domain/entities/task.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, TaskItem]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule { }