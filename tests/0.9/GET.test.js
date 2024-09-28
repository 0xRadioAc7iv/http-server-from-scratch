const { createConnection } = require("net");
const { startServer, stopServer } = require("../../dist/index.js");

describe("Testing HTTP/0.9", () => {
  beforeAll((done) => {
    startServer();
    setTimeout(done, 500); // Giving the server time to start up
  });

  afterAll((done) => {
    stopServer();
    setTimeout(done, 500); // Giving the server time to stop
  });

  test("The requested webpage was found and returned", (done) => {
    const normalizeHTML = (html) => html.replace(/\s+/g, " ").trim();

    const client = createConnection({ port: 3000 }, () => {
      client.write("GET /index.html");
    });

    client.on("data", (data) => {
      const receivedHTML = normalizeHTML(data.toString());
      const expectedHTML = normalizeHTML(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Greetings</title>
      </head>
      <body>
        <h1>Hello!</h1>
      </body>
      </html>
    `);

      expect(receivedHTML).toEqual(expectedHTML);
      client.end();
      done();
    });
  });

  test("The requested webpage was not found, an error message was received and connection was closed automatically", (done) => {
    const client = createConnection({ port: 3000 }, () => {
      client.write("GET /nonexistent.html");
    });

    client.on("data", (data) => {
      expect(data.toString()).toBe("Error: Requested resource does not exist!");
      client.end();
      done();
    });
  });

  test("Invalid Request type was sent and an error was returned", (done) => {
    const client = createConnection({ port: 3000 }, () => {
      client.write("POST /index.html");
    });

    client.on("data", (data) => {
      expect(data.toString()).toBe("Error: Only GET Requests are supported!");
      client.end();
      done();
    });
  });

  test("Incomplete Request was sent and an error was returned", (done) => {
    const client = createConnection({ port: 3000 }, () => {
      client.write("GET");
    });

    client.on("data", (data) => {
      expect(data.toString()).toBe("Error: Incomplete Request");
      client.end();
      done();
    });
  });
});
