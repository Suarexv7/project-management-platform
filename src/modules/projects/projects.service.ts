import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Project, ProjectStatus } from '../../domain/entities/project.entity';
import { TaskItem } from '../../domain/entities/task.entity';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

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

    async findAll(): Promise<Project[]> {
        return await this.projectRepo.find({
            relations: ['tasks'],
        });
    }

    async updateProject(id: number, updateProjectDto: UpdateProjectDto): Promise<Project> {
        const project = await this.projectRepo.findOne({
            where: { id },
        });

        if (!project) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }

        Object.assign(project, updateProjectDto);

        return await this.projectRepo.save(project);
    }

    async completeProject(id: number): Promise<Project> {

        const project = await this.projectRepo.findOne({
            where: { id },
            relations: ['tasks'],
        });

        // Verificar que exista
        if (!project) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }

        // Solo proyectos ACTIVE pueden completarse
        if (project.status !== ProjectStatus.ACTIVE) {
            throw new BadRequestException(
                'Only ACTIVE projects can be completed'
            );
        }

        // Verificar que todas las tareas estén completadas
        const hasIncompleteTasks = project.tasks.some(
            task => task.isCompleted === false
        );

        if (hasIncompleteTasks) {
            throw new BadRequestException(
                'All tasks must be completed before completing the project'
            );
        }

        // Cambiar estado
        project.status = ProjectStatus.COMPLETED;

        // Guardar y devolver
        return await this.projectRepo.save(project);
    }

    async getSummary(id: number) {
        // 1. Buscamos el proyecto incluyendo sus tareas
        const project = await this.projectRepo.findOne({
            where: { id },
            relations: ['tasks'],
        });

        // 2. Validación de existencia (el patrón que ya dominas)
        if (!project) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }

        // 3. Cálculos basados en las tareas vinculadas
        const totalTasks = project.tasks.length;
        const completedTasks = project.tasks.filter(task => task.isCompleted).length;

        // 4. Retornamos el objeto plano con la estructura exacta pedida
        return {
            id: project.id,
            name: project.name,
            status: project.status,
            totalTasks,
            completedTasks
        };
    }

    async activate(id: number): Promise<Project> {

        const project = await this.projectRepo.findOne({
            where: { id },
            relations: ['tasks'],
        });


        // Verificar que exista
        if (!project) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }

        // Solo proyectos DRAFT pueden activarse
        if (project.status !== ProjectStatus.DRAFT) {
            throw new BadRequestException(
                'Only projects in DRAFT status can be activated'
            );
        }

        if (!project.tasks || project.tasks.length === 0) {
            throw new BadRequestException(
                'Project must have at least one task to be activated'
            );

        }



        project.status = ProjectStatus.ACTIVE;

        return await this.projectRepo.save(project);
    }
}