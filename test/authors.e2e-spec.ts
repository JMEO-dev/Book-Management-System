import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthorsController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('should create and retrieve an author', async () => {
        const createAuthor = {
            firstName: 'John',
            lastName: 'Doe',
            bio: 'Test author',
            birthDate: '1970-01-01',
        };

        // Create author
        const createResponse = await request(app.getHttpServer())
            .post('/authors')
            .send(createAuthor)
            .expect(201);

        const authorId = createResponse.body.data.id;

        // Retrieve author
        await request(app.getHttpServer())
            .get(`/authors/${authorId}`)
            .expect(200)
            .expect(res => {
                expect(res.body.data).toMatchObject({
                    id: authorId,
                    firstName: 'John',
                    lastName: 'Doe',
                    bio: 'Test author',
                });
            });
    });

    afterAll(async () => {
        await app.close();
    });
});