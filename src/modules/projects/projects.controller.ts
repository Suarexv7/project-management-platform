import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    ParseIntPipe,
    Patch,
    Put,
    Delete,
    Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiParam,
    ApiResponse,
    ApiQuery,
} from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Get('search')
    @ApiOperation({ summary: 'Buscar proyectos con filtro y paginación' })
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'pageSize', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Lista paginada de proyectos' })
    search(
        @Query('status') status?: string,
        @Query('page', new ParseIntPipe({ optional: true })) page?: number,
        @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number,
    ) {
        return this.projectsService.searchProjects(status, page, pageSize);
    }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo proyecto' })
    @ApiResponse({ status: 201, description: 'Proyecto creado correctamente' })
    create(@Body() createProjectDto: CreateProjectDto) {
        return this.projectsService.create(createProjectDto);
    }

    @Get(':id/summary')
    @ApiOperation({ summary: 'Obtener resumen de progreso de un proyecto' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Resumen calculado correctamente' })
    getSummary(@Param('id', ParseIntPipe) id: number) {
        return this.projectsService.getSummary(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar un proyecto' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Proyecto actualizado correctamente' })
    @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProjectDto: UpdateProjectDto
    ) {
        return this.projectsService.updateProject(id, updateProjectDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un proyecto' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Proyecto eliminado correctamente' })
    @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.projectsService.deleteProject(id);
    }

    @Patch(':id/activate')
    @ApiOperation({ summary: 'Activar un proyecto' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Proyecto activado correctamente' })
    activate(@Param('id', ParseIntPipe) id: number) {
        return this.projectsService.activate(id);
    }

    @Patch(':id/complete')
    @ApiOperation({ summary: 'Completar un proyecto' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Proyecto completado correctamente' })
    @ApiResponse({ status: 400, description: 'El proyecto tiene tareas pendientes' })
    complete(@Param('id', ParseIntPipe) id: number) {
        return this.projectsService.completeProject(id);
    }
}