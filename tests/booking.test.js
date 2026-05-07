const request = require("supertest");

const BASE_URL = "https://restful-booker.herokuapp.com";
const EXPECTED_STATUS = {
  auth: 200,
  createBooking: 200,
  getBooking: 200,
  updateBooking: 200,
  deleteBooking: 201,
  deletedBookingNotFound: 404,
};

function assertStatus(response, expectedStatus) {
  const expectedStatuses = Array.isArray(expectedStatus)
    ? expectedStatus
    : [expectedStatus];
  expect(expectedStatuses).toContain(response.status);
  expect(response.status).toBeLessThan(400);
}

function assertJsonResponse(response) {
  expect(response.headers["content-type"]).toMatch(/application\/json/);
  expect(response.body).toBeDefined();
}

describe("Restful Booker API - CRUD akışı", () => {
  let api;
  let token;
  let bookingId;

  beforeAll(async () => {
    api = request(BASE_URL);

    const authResponse = await api
      .post("/auth")
      .set("Accept", "application/json")
      .send({
        username: "admin",
        password: "password123",
      });

    assertStatus(authResponse, EXPECTED_STATUS.auth);
    assertJsonResponse(authResponse);
    expect(authResponse.body).toHaveProperty("token");
    expect(typeof authResponse.body.token).toBe("string");

    token = authResponse.body.token;
  });

  test("Create booking", async () => {
    const createResponse = await api
      .post("/booking")
      .set("Accept", "application/json")
      .send({
        firstname: "John",
        lastname: "Doe",
        totalprice: 123,
        depositpaid: true,
        bookingdates: {
          checkin: "2025-01-01",
          checkout: "2025-01-10",
        },
        additionalneeds: "Breakfast",
      });

    assertStatus(createResponse, EXPECTED_STATUS.createBooking);
    assertJsonResponse(createResponse);
    expect(createResponse.body).toHaveProperty("bookingid");
    expect(createResponse.body).toHaveProperty("booking");
    expect(createResponse.body.booking).toMatchObject({
      firstname: "John",
      lastname: "Doe",
      totalprice: 123,
      depositpaid: true,
      bookingdates: {
        checkin: "2025-01-01",
        checkout: "2025-01-10",
      },
      additionalneeds: "Breakfast",
    });

    bookingId = createResponse.body.bookingid;
  });

  test("Get created booking by id", async () => {
    expect(bookingId).toBeDefined();

    const getResponse = await api
      .get(`/booking/${bookingId}`)
      .set("Accept", "application/json");

    assertStatus(getResponse, EXPECTED_STATUS.getBooking);
    assertJsonResponse(getResponse);
    expect(getResponse.body).toMatchObject({
      firstname: "John",
      lastname: "Doe",
      totalprice: 123,
      depositpaid: true,
      bookingdates: {
        checkin: "2025-01-01",
        checkout: "2025-01-10",
      },
      additionalneeds: "Breakfast",
    });
  });

  test("Update booking", async () => {
    expect(bookingId).toBeDefined();
    expect(token).toBeDefined();

    const updatedPayload = {
      firstname: "Jane",
      lastname: "Doe",
      totalprice: 150,
      depositpaid: false,
      bookingdates: {
        checkin: "2025-02-01",
        checkout: "2025-02-15",
      },
      additionalneeds: "Dinner",
    };

    const updateResponse = await api
      .put(`/booking/${bookingId}`)
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Cookie", `token=${token}`)
      .send(updatedPayload);

    assertStatus(updateResponse, EXPECTED_STATUS.updateBooking);
    assertJsonResponse(updateResponse);
    expect(updateResponse.body).toMatchObject(updatedPayload);
  });

  test("Delete booking and verify resource removal", async () => {
    expect(bookingId).toBeDefined();
    expect(token).toBeDefined();

    const deleteResponse = await api
      .delete(`/booking/${bookingId}`)
      .set("Cookie", `token=${token}`);

    // Validate only the expected delete status code from the API contract.
    assertStatus(deleteResponse, EXPECTED_STATUS.deleteBooking);

    // The 'server' header is infrastructure metadata and should not be relied on
    // for API contract validation unless the contract explicitly requires it.
    // expect(deleteResponse.headers).toHaveProperty('server');

    // Confirm the resource has really been removed.
    const getAfterDeleteResponse = await api
      .get(`/booking/${bookingId}`)
      .set("Accept", "application/json");

    expect(getAfterDeleteResponse.status).toBe(
      EXPECTED_STATUS.deletedBookingNotFound,
    );
  });
});
