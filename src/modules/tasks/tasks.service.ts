import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../domain/entities/project.entity';
import { TaskItem } from '../../domain/entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {

    constructor(
        @InjectRepository(TaskItem)
        private readonly taskRepo: Repository<TaskItem>,

        @InjectRepository(Project)
        private readonly projectRepo: Repository<Project>,
    ) { }

    async create(projectId: number, createTaskDto: CreateTaskDto): Promise<TaskItem> {
        const { order } = createTaskDto;

        // 1. Validar que el proyecto existe
        const project = await this.projectRepo.findOneBy({ id: projectId });
        if (!project) {
            throw new NotFoundException(`Project with ID ${projectId} not found`);
        }

        // 2. REGLA CRÍTICA: Validar que el 'order' sea único dentro de ESTE proyecto
        const existingTask = await this.taskRepo.findOne({
            where: {
                project: { id: projectId },
                order: order
            }
        });

        if (existingTask) {
            throw new BadRequestException(`A task with order ${order} already exists in this project`);
        }

        // 3. Validación secundaria (opcional pero recomendada)
        if (order < 0) {
            throw new BadRequestException('Order must be a non-negative number');
        }

        // 4. Crear la instancia y asignar la relación
        const task = this.taskRepo.create(createTaskDto);
        task.project = project; // Aquí vinculamos el objeto proyecto que encontramos arriba

        // 5. Guardar y retornar
        return await this.taskRepo.save(task);
    }

    // 1. Obtener todas las tareas de un proyecto ordenadas
    async getTasksByProject(projectId: number): Promise<TaskItem[]> {
        return await this.taskRepo.find({
            where: { project: { id: projectId } },
            order: { order: 'ASC' } // Orden ascendente por el campo 'order'
        });
    }

    // 2. Actualizar una tarea
    async updateTask(id: number, updateTaskDto: UpdateTaskDto): Promise<TaskItem> {
        const task = await this.taskRepo.findOneBy({ id });

        if (!task) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }

        // Combinamos los cambios del DTO en la instancia encontrada
        Object.assign(task, updateTaskDto);

        return await this.taskRepo.save(task);
    }

    // 3. Eliminar una tarea
    async deleteTask(id: number): Promise<void> {
        const task = await this.taskRepo.findOneBy({ id });

        if (!task) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }

        await this.taskRepo.remove(task);
    }

    // 4. Marcar tarea como completada (Lógica de negocio específica)
    async completeTask(id: number): Promise<TaskItem> {
        const task = await this.taskRepo.findOneBy({ id });

        if (!task) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }

        task.isCompleted = true; // Cambiamos el estado

        return await this.taskRepo.save(task);
    }
}