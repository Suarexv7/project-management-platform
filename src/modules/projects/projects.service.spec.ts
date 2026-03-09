import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { Project, ProjectStatus } from '../../domain/entities/project.entity';
import { TaskItem } from '../../domain/entities/task.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ProjectsService', () => {
  let service: ProjectsService;

  const mockProjectRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockTaskRepo = {
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: getRepositoryToken(Project), useValue: mockProjectRepo },
        { provide: getRepositoryToken(TaskItem), useValue: mockTaskRepo },
      ],
    }).compile();
    service = module.get<ProjectsService>(ProjectsService);
  });

  // --- GRUPO: ACTIVATE ---
  describe('activate', () => {
    it('ActivateProject_WithTasks_ShouldSucceed', async () => {
      const project = { id: 1, status: ProjectStatus.DRAFT, tasks: [{ id: 101 }] };
      mockProjectRepo.findOne.mockResolvedValue(project);
      mockProjectRepo.save.mockResolvedValue({ ...project, status: ProjectStatus.ACTIVE });

      const result = await service.activate(1);
      expect(result.status).toBe(ProjectStatus.ACTIVE);
    });

    it('ActivateProject_WithoutTasks_ShouldFail', async () => {
      mockProjectRepo.findOne.mockResolvedValue({ id: 1, tasks: [] });
      await expect(service.activate(1)).rejects.toThrow(BadRequestException);
    });
  });

  // --- GRUPO: COMPLETE ---
  describe('completeProject', () => {
    it('CompleteProject_WithPendingTasks_ShouldFail', async () => {
      const activeProject = {
        id: 1,
        status: ProjectStatus.ACTIVE,
        tasks: [{ id: 101, isCompleted: false }]
      };
      mockProjectRepo.findOne.mockResolvedValue(activeProject);

      await expect(service.completeProject(1)).rejects.toThrow(BadRequestException);
    });
  });

  // --- GRUPO: DELETE ---
  describe('deleteProject', () => {
    it('DeleteProject_ShouldBeDelete', async () => {
      mockProjectRepo.findOne.mockResolvedValue({ id: 1 });
      mockProjectRepo.delete.mockResolvedValue({ affected: 1 });

      await service.deleteProject(1);
      expect(mockProjectRepo.delete).toHaveBeenCalledWith(1);
    });
  });
});