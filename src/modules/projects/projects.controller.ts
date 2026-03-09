import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    ParseIntPipe,
    Patch
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiParam,
    ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {

    constructor(private readonly projectsService: ProjectsService) { }

    @Patch(':id/activate')
    @ApiOperation({ summary: 'Activar un proyecto' })
    @ApiParam({ name: 'id', type: Number, description: 'ID del proyecto' })
    @ApiResponse({ status: 200, description: 'Proyecto activado correctamente' })
    @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
    activate(@Param('id', ParseIntPipe) id: number) {
        return this.projectsService.activate(id);
    }
}


