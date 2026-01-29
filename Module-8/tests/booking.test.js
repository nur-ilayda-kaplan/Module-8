const request = require('supertest');

const BASE_URL = 'https://restful-booker.herokuapp.com';

describe('Restful Booker API - CRUD akışı', () => {
  let api;
  let token;
  let bookingId;

  beforeAll(async () => {
    api = request(BASE_URL);

    // Create Token
    const authResponse = await api
      .post('/auth')
      .set('Accept', 'application/json')
      .send({
        username: 'admin',
        password: 'password123',
      });

    expect(authResponse.status).toBe(200);
    expect(authResponse.headers['content-type']).toMatch(/application\/json/);
    expect(authResponse.body).toHaveProperty('token');
    expect(typeof authResponse.body.token).toBe('string');

    token = authResponse.body.token;
  });

  test('Create booking', async () => {
    const createResponse = await api
      .post('/booking')
      .set('Accept', 'application/json')
      .send({
        firstname: 'John',
        lastname: 'Doe',
        totalprice: 123,
        depositpaid: true,
        bookingdates: {
          checkin: '2025-01-01',
          checkout: '2025-01-10',
        },
        additionalneeds: 'Breakfast',
      });

    expect(createResponse.status).toBe(200);
    expect(createResponse.headers['content-type']).toMatch(/application\/json/);
    expect(createResponse.body).toHaveProperty('bookingid');
    expect(createResponse.body).toHaveProperty('booking');
    expect(createResponse.body.booking).toMatchObject({
      firstname: 'John',
      lastname: 'Doe',
      totalprice: 123,
      depositpaid: true,
      bookingdates: {
        checkin: '2025-01-01',
        checkout: '2025-01-10',
      },
      additionalneeds: 'Breakfast',
    });

    bookingId = createResponse.body.bookingid;
  });

  test('Get created booking by id', async () => {
    expect(bookingId).toBeDefined();

    const getResponse = await api
      .get(`/booking/${bookingId}`)
      .set('Accept', 'application/json');

    expect(getResponse.status).toBe(200);
    expect(getResponse.headers['content-type']).toMatch(/application\/json/);
    expect(getResponse.body).toMatchObject({
      firstname: 'John',
      lastname: 'Doe',
      totalprice: 123,
      depositpaid: true,
      bookingdates: {
        checkin: '2025-01-01',
        checkout: '2025-01-10',
      },
      additionalneeds: 'Breakfast',
    });
  });

  test('Update booking', async () => {
    expect(bookingId).toBeDefined();
    expect(token).toBeDefined();

    const updatedPayload = {
      firstname: 'Jane',
      lastname: 'Doe',
      totalprice: 150,
      depositpaid: false,
      bookingdates: {
        checkin: '2025-02-01',
        checkout: '2025-02-15',
      },
      additionalneeds: 'Dinner',
    };

    const updateResponse = await api
      .put(`/booking/${bookingId}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .set('Cookie', `token=${token}`)
      .send(updatedPayload);

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.headers['content-type']).toMatch(/application\/json/);
    expect(updateResponse.body).toMatchObject(updatedPayload);
  });

  test('Delete booking', async () => {
    expect(bookingId).toBeDefined();
    expect(token).toBeDefined();

    const deleteResponse = await api
      .delete(`/booking/${bookingId}`)
      .set('Cookie', `token=${token}`);

    // Restful Booker genellikle 201 Created döner
    expect([201, 200, 204]).toContain(deleteResponse.status);
    expect(deleteResponse.headers).toHaveProperty('server');

    // Eğer body dönmüşse içeriği de kontrol et
    if (deleteResponse.text) {
      expect(typeof deleteResponse.text).toBe('string');
    }
  });
});
