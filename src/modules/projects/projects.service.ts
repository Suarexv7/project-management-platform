import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from '../../domain/entities/project.entity';
import { TaskItem } from '../../domain/entities/task.entity';
import { CreateProjectDto } from '../../domain/dto/create-project.dto';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepo: Repository<Project>,

        @InjectRepository(TaskItem)
        private readonly taskRepo: Repository<TaskItem>,
    ) { }

    async create(createProjectDto: CreateProjectDto): Promise<Project> {
        const project = this.projectRepo.create(createProjectDto);

        return await this.projectRepo.save(project);
    }

    async activate(id: number): Promise<Project> {
        const project = await this.projectRepo.findOne({
            where: { id },
            relations: ['tasks'],
        });

        //Verificar que exista
        if (!project) {
            throw new NotFoundException(`Project with ID ${id} not found`)
        }

        //Verificar que este en estado DRAFT
        if (project.status !== ProjectStatus.DRAFT) {
            throw new BadRequestException(`Only projects in "DRAFT" status can be activated`);
        }

        //Verficar que tenga tareas
        if (!project.tasks || project.tasks.length === 0) {
            throw new BadRequestException('Project must have at least one task to be activated');
        }

        //Cambiar estado
        project.status = ProjectStatus.ACTIVE;

        //Guardar y devolver
        return this.projectRepo.save(project);
    }
}

