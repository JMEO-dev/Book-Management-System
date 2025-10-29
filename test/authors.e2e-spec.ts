// test/authors.e2e-spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from '../src/authors/entities/author.entity';
import { Book } from '../src/books/entities/book.entity';
import { AuthorsModule } from '../src/authors/authors.module';

describe('AuthorsController (e2e)', () => {
    let app: INestApplication;
    let dataSource: DataSource;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot({
                    type: 'sqlite',
                    database: ':memory:',
                    entities: [Author, Book],
                    synchronize: true,
                    logging: false,
                }),
                AuthorsModule,
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        dataSource = app.get(DataSource);
    });

    beforeEach(async () => {
        await dataSource.getRepository(Author).clear();

        await dataSource.getRepository(Book).clear();
    });

    test('should create and retrieve an author', async () => {
        const createAuthor = {
            firstName: 'John',
            lastName: 'Doe',
            bio: 'Test author',
            birthDate: '1970-01-01',
        };

        const createResponse = await request(app.getHttpServer())
            .post('/authors')
            .send(createAuthor)
            .expect(201);

        expect(createResponse.body).toMatchObject({
            firstName: 'John',
            lastName: 'Doe',
            bio: 'Test author',
        });
        const authorId = createResponse.body.id;
        expect(authorId).toBeDefined();

        const getResponse = await request(app.getHttpServer())
            .get(`/authors/${authorId}`)
            .expect(200);

        expect(getResponse.body).toMatchObject({
            id: authorId,
            firstName: 'John',
            lastName: 'Doe',
            bio: 'Test author',
        });
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });
});