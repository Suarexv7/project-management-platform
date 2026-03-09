import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    ParseIntPipe,
    Patch,
    Put
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiParam,
    ApiResponse,
} from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';


@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {

    constructor(private readonly projectsService: ProjectsService) { }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo proyecto' })
    @ApiResponse({ status: 201, description: 'Proyecto creado correctamente' })
    create(@Body() createProjectDto: CreateProjectDto) {
        return this.projectsService.create(createProjectDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los proyectos' })
    @ApiResponse({ status: 200, description: 'Lista de proyectos' })
    findAll() {
        return this.projectsService.findAll();
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar un proyecto' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del proyecto' })
    @ApiResponse({ status: 200, description: 'Proyecto actualizado correctamente' })
    @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProjectDto: UpdateProjectDto
    ) {
        return this.projectsService.updateProject(id, updateProjectDto);
    }

    @Patch(':id/activate')
    @ApiOperation({ summary: 'Activar un proyecto' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del proyecto' })
    @ApiResponse({ status: 200, description: 'Proyecto activado correctamente' })
    @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
    activate(@Param('id', ParseIntPipe) id: number) {
        return this.projectsService.activate(id);
    }

    @Patch(':id/complete')
    @ApiOperation({ summary: 'Completar un proyecto' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del proyecto' })
    @ApiResponse({ status: 200, description: 'Proyecto completado correctamente' })
    @ApiResponse({ status: 400, description: 'El proyecto tiene tareas pendientes' })
    complete(@Param('id', ParseIntPipe) id: number) {
        return this.projectsService.completeProject(id);
    }

    @Get(':id/summary')
    @ApiOperation({ summary: 'Obtener resumen de progreso de un proyecto' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del proyecto' })
    @ApiResponse({ status: 200, description: 'Resumen calculado correctamente' })
    getSummary(@Param('id', ParseIntPipe) id: number) {
        return this.projectsService.getSummary(id);
    }
}


