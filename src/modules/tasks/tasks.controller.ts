import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    ParseIntPipe,
    Patch,
    Put,
    Delete
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiParam,
    ApiResponse,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';


@UseGuards(AuthGuard('jwt'))
@ApiTags('Tasks')
@ApiBearerAuth()
@Controller()
export class TasksController {

    constructor(private readonly tasksService: TasksService) { }

    @Post('projects/:projectId/tasks')
    @ApiOperation({ summary: 'Crear una nueva tarea en un proyecto' })
    @ApiParam({ name: 'projectId', type: Number, description: 'ID del proyecto' })
    @ApiResponse({ status: 201, description: 'Tarea creada correctamente' })
    @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
    create(
        @Param('projectId', ParseIntPipe) projectId: number,
        @Body() createTaskDto: CreateTaskDto
    ) {
        return this.tasksService.create(projectId, createTaskDto);
    }

    @Get('projects/:projectId/tasks')
    @ApiOperation({ summary: 'Obtener todas las tareas de un proyecto' })
    @ApiParam({ name: 'projectId', type: Number, description: 'ID del proyecto' })
    @ApiResponse({ status: 200, description: 'Lista de tareas ordenada por order ASC' })
    getTasksByProject(@Param('projectId', ParseIntPipe) projectId: number) {
        return this.tasksService.getTasksByProject(projectId);
    }

    @Put('tasks/:id')
    @ApiOperation({ summary: 'Actualizar una tarea' })
    @ApiParam({ name: 'id', type: Number, description: 'ID de la tarea' })
    @ApiResponse({ status: 200, description: 'Tarea actualizada correctamente' })
    @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTaskDto: UpdateTaskDto
    ) {
        return this.tasksService.updateTask(id, updateTaskDto);
    }

    @Delete('tasks/:id')
    @ApiOperation({ summary: 'Eliminar una tarea' })
    @ApiParam({ name: 'id', type: Number, description: 'ID de la tarea' })
    @ApiResponse({ status: 200, description: 'Tarea eliminada correctamente' })
    @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.tasksService.deleteTask(id);
    }

    @Patch('tasks/:id/complete')
    @ApiOperation({ summary: 'Marcar una tarea como completada' })
    @ApiParam({ name: 'id', type: Number, description: 'ID de la tarea' })
    @ApiResponse({ status: 200, description: 'Tarea completada correctamente' })
    @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
    complete(@Param('id', ParseIntPipe) id: number) {
        return this.tasksService.completeTask(id);
    }
}