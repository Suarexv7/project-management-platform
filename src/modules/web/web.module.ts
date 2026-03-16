import { Module } from '@nestjs/common';
import { WebController } from './web.controller';
import { ProjectsModule } from '../projects/projects.module';
import { TasksModule } from '../tasks/tasks.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [ProjectsModule, TasksModule, AuthModule,],
    controllers: [WebController],
})
export class WebModule { }