import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TaskItem } from '../../domain/entities/task.entity';
import { Project } from '../../domain/entities/project.entity';
import { BadRequestException } from '@nestjs/common';

describe('TasksService', () => {
    let service: TasksService;

    const mockTaskRepo = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    const mockProjectRepo = {
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TasksService,
                { provide: getRepositoryToken(TaskItem), useValue: mockTaskRepo },
                { provide: getRepositoryToken(Project), useValue: mockProjectRepo },
            ],
        }).compile();
        service = module.get<TasksService>(TasksService);
    });

    describe('create', () => {
        it('CreateTask_WithDuplicateOrder_ShouldFail', async () => {
            // Proyecto existe
            mockProjectRepo.findOne.mockResolvedValue({ id: 1, name: 'Test' });
            // Ya existe una tarea con ese order en ese proyecto
            mockTaskRepo.findOne.mockResolvedValue({ id: 99, order: 5 });

            const dto = { title: 'Nueva Tarea', order: 5 };

            await expect(service.create(1, dto as any))
                .rejects
                .toThrow(BadRequestException);
        });
    });
});