import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Book } from '../../books/entities/book.entity';

@Entity()
export class Author {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ nullable: true })
    bio: string;

    @Column({ type: 'date', nullable: true })
    birthDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Book, book => book.author)
    books: Book[];
}