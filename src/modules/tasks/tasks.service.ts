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
        const project = await this.projectRepo.findOne({ where: { id: projectId } }); if (!project) {
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

    async reorderTask(id: number, newOrder: number): Promise<TaskItem[]> {
        // 1. Buscar la tarea que queremos mover (con su proyecto)
        const taskToMove = await this.taskRepo.findOne({
            where: { id },
            relations: ['project'],
        });

        if (!taskToMove) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }

        // 2. Traer TODAS las tareas del mismo proyecto ordenadas
        let allTasks = await this.taskRepo.find({
            where: { project: { id: taskToMove.project.id } },
            order: { order: 'ASC' },
        });

        // 3. Validar que el newOrder no se salga del rango
        if (newOrder < 1 || newOrder > allTasks.length) {
            throw new BadRequestException(
                `Order must be between 1 and ${allTasks.length}`
            );
        }

        // 4. Quitar la tarea de su posición actual
        allTasks = allTasks.filter(t => t.id !== id);

        // 5. Insertarla en la nueva posición
        // splice(posición, cuántos borrar, qué insertar)
        allTasks.splice(newOrder - 1, 0, taskToMove);

        // 6. Reasignar el order a todas según su nueva posición
        allTasks.forEach((task, index) => {
            task.order = index + 1;
        });

        // 7. Guardar todas y retornar
        return await this.taskRepo.save(allTasks);
    }
}