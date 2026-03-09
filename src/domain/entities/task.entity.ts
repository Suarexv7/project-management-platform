import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    ManyToOne,
} from 'typeorm';
import { Project } from './project.entity';

export enum Priority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
}

@Entity('taskitem')
export class TaskItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 150 })
    title: string;

    @Column({
        type: 'enum',
        enum: Priority,
        default: Priority.LOW
    })
    priority: Priority

    @Column()
    order: number;

    @Column({ type: 'boolean', default: false })
    isCompleted: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // --- Relaciones ---

    @ManyToOne(() => Project, (project) => project.tasks)
    @JoinColumn({ name: 'project_id' })
    project: Project;

    @Column({ name: 'project_id' })
    projectId: number;
}