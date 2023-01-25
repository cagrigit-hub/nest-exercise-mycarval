import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Auth Sys. (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('handles a signup req', async () => {
    const email = 'cagrit@hotmail.com';
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: email,
        password: '123456',
      })
      .expect(201)
      .then((res) => {
        const { id, email } = res.body;
        expect(id).toBeDefined();
        expect(email).toEqual(email);
      });
  });
  it('Should signup a new user and return a cookie', async () => {
    const email = 'asdfgk@hotmail.com';
    const password = '123456';
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: email,
        password: password,
      })
      .expect(201);
    expect(response.get('Set-Cookie')).toBeDefined();
  });
  it('Should signin a user and return a cookie', async () => {
    const email = 'asdfgk@hotmail.com';
    const password = '123456';
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: email,
        password: password,
      })
      .expect(201);
    const response = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: email,
        password: password,
      })
      .expect(201);
    expect(response.get('Set-Cookie')).toBeDefined();
  });
  it('signup as a new user then get the current logged in user', async () => {
    const email = 'skdaksd@hotmail.com';
    const password = '123456';
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: email,
        password: password,
      })
      .expect(201);

    const cookie = res.get('Set-Cookie');
    const { body } = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie)
      .expect(200);
    expect(body.email).toEqual(email);
  });
});
