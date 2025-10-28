import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Author } from '../../authors/entities/author.entity';

@Entity()
export class Book {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ unique: true })
    isbn: string;

    @Column({ type: 'date', nullable: true })
    publishedDate: Date;

    @Column({ nullable: true })
    genre: string;

    @ManyToOne(() => Author, author => author.books)
    author: Author;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}