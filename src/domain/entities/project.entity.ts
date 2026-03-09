import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';

import { TaskItem } from './task.entity';

export enum ProjectStatus {
    DRAFT = 'draft',
    ACTIVE = 'active',
    COMPLETED = 'completed',
}

@Entity('projects')
export class Project {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: ProjectStatus,
        default: ProjectStatus.DRAFT
    })
    status: ProjectStatus

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // --- RELACIONES ---

    @OneToMany(() => TaskItem, (task) => task.project)
    tasks: TaskItem[];
}