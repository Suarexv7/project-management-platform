import { Controller, Get, Post, Body, Param, ParseIntPipe, Redirect, Render } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';
import { TasksService } from '../tasks/tasks.service';
import { Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from '../auth/auth.service';

@Controller('web')
export class WebController {

    constructor(
        private readonly projectsService: ProjectsService,
        private readonly tasksService: TasksService,
        private readonly authService: AuthService,
    ) { }

    // 1. Lista de proyectos
    @Get('projects')
    async getProjects(@Req() req: Request, @Res() res: Response) {
        if (!(req.session as any).user) return res.redirect('/web/auth/login');
        const projects = await this.projectsService.findAll();
        return res.render('projects/index', { projects, user: (req.session as any).user });
    }

    // 2. Formulario crear proyecto
    @Get('projects/new')
    async getNewProject(@Req() req: Request, @Res() res: Response) {
        if (!(req.session as any).user) return res.redirect('/web/auth/login');
        return res.render('projects/new', { user: (req.session as any).user });
    }

    // 3. Procesar formulario — crear proyecto y redirigir
    @Post('projects')
    async createProject(@Body() body: any, @Req() req: Request, @Res() res: Response) {
        if (!(req.session as any).user) return res.redirect('/web/auth/login');
        await this.projectsService.create(body);
        return res.redirect('/web/projects');
    }

    // 4. Detalle del proyecto
    @Get('projects/:id')
    async getProjectDetail(@Param('id', ParseIntPipe) id: number, @Req() req: Request, @Res() res: Response) {
        if (!(req.session as any).user) return res.redirect('/web/auth/login');
        const summary = await this.projectsService.getSummary(id);
        const tasks = await this.tasksService.getTasksByProject(id);
        return res.render('projects/detail', { summary, tasks, user: (req.session as any).user });
    }

    // Agregar tarea al proyecto
    @Post('projects/:id/tasks')
    async createTask(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Res() res: Response) {
        await this.tasksService.create(id, body);
        return res.redirect(`/web/projects/${id}`);
    }

    @Post('projects/:id/activate')
    async activateProject(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
        await this.projectsService.activate(id);
        return res.redirect(`/web/projects/${id}`);
    }

    @Post('projects/:id/complete')
    @Redirect()
    async completeProject(@Param('id', ParseIntPipe) id: number) {
        await this.projectsService.completeProject(id);
        return { url: `/web/projects/${id}` };
    }

    @Post('tasks/:id/complete')
    async completeTask(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Res() res: Response) {
        await this.tasksService.completeTask(id);
        return res.redirect(`/web/projects/${body.projectId}`);
    }

    @Post('tasks/:id/delete')
    async deleteTask(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Res() res: Response) {
        await this.tasksService.deleteTask(id);
        return res.redirect(`/web/projects/${body.projectId}`);
    }

    @Get('projects/:id/edit')
    async getEditProject(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: Request,
        @Res() res: Response
    ) {
        if (!(req.session as any).user) return res.redirect('/web/auth/login');
        const summary = await this.projectsService.getSummary(id);
        return res.render('projects/edit', {
            project: summary,
            user: (req.session as any).user
        });
    }

    @Post('projects/:id/edit')
    async editProject(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: any,
        @Res() res: Response
    ) {
        await this.projectsService.updateProject(id, body);
        return res.redirect(`/web/projects/${id}`);
    }

    @Post('projects/:id/delete')
    async deleteProject(
        @Param('id', ParseIntPipe) id: number,
        @Res() res: Response
    ) {
        await this.projectsService.deleteProject(id);
        return res.redirect('/web/projects');
    }

    @Get('tasks/:id/edit')
    async getEditTask(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: Request,
        @Res() res: Response
    ) {
        if (!(req.session as any).user) return res.redirect('/web/auth/login');
        const task = await this.tasksService.findOne(id);
        return res.render('tasks/edit', {
            task,
            user: (req.session as any).user
        });
    }

    @Post('tasks/:id/edit')
    async editTask(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: any,
        @Res() res: Response
    ) {
        await this.tasksService.updateTask(id, body);
        return res.redirect(`/web/projects/${body.projectId}`);
    }

    // Mostrar login
    @Get('auth/login')
    @Render('auth/login')
    getLogin() {
        return {};
    }

    // Procesar login
    @Post('auth/login')
    async login(@Body() body: any, @Req() req: Request, @Res() res: Response) {
        try {
            const result = await this.authService.login(body);
            (req.session as any).user = result.user;
            return res.redirect('/web/projects');
        } catch (e) {
            return res.render('auth/login', { error: 'Credenciales incorrectas' });
        }
    }

    // Mostrar register
    @Get('auth/register')
    @Render('auth/register')
    getRegister() {
        return {};
    }

    // Procesar register
    @Post('auth/register')
    async register(@Body() body: any, @Req() req: Request, @Res() res: Response) {
        try {
            const result = await this.authService.register(body);
            (req.session as any).user = result;
            return res.redirect('/web/projects');
        } catch (e) {
            return res.render('auth/register', { error: 'El email ya está en uso' });
        }
    }

    // Cerrar sesión
    @Get('auth/logout')
    logout(@Req() req: Request, @Res() res: Response) {
        req.session.destroy(() => { });
        return res.redirect('/web/auth/login');
    }
}
