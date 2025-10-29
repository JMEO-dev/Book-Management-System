import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  test('should return "API is running!" on /health(GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect(res => {
        expect(res.text).toBe('API is running!');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});