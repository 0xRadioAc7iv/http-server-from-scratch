import * as net from "net";
import * as fs from "fs/promises";

const server = net.createServer();
const htmlFilePath = "./html/"; // Explicitly set Path to find HTML files

function handleNewConnection(socket: net.Socket) {
  console.log("New Connection!");

  socket.on("end", () => {
    console.log("Connection closed!");
  });

  socket.on("data", async (data: Buffer) => {
    const request = new TextDecoder().decode(data);
    console.log("New Request: ", request);
    const splitRequest = request.split(" ");

    if (splitRequest.length !== 2) {
      socket.write("Error: Incomplete Request");
      socket.end();
      return;
    }

    const requestType = splitRequest[0];
    let htmlFile;

    if (splitRequest[1] === "/") {
      htmlFile = "index.html";
    } else {
      htmlFile = splitRequest[1].slice(1);
    }

    if (requestType !== "GET") {
      socket.write("Error: Only GET Requests are supported!");
      socket.end();
      return;
    }

    try {
      const filePath = htmlFilePath + htmlFile;
      const fileData = await fs.readFile(filePath);
      socket.write(fileData); // Modified to send response with binary data
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    } catch (err) {
      socket.write("Error: Requested resource does not exist!");
    }

    socket.end();
  });
}

server.on("connection", handleNewConnection);
server.on("error", (err: Error) => {
  throw err;
});

export function startServer() {
  server.listen({ host: "127.0.0.1", port: process.argv[2] || 3000 }, () => {
    console.log("Server started...");
  });
}

export function stopServer() {
  server.close();
}

startServer();
