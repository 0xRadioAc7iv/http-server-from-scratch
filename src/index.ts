import * as net from "net";
import * as fs from "fs/promises";

const server = net.createServer();

function handleNewConnection(socket: net.Socket) {
  console.log("New Connection!");

  socket.on("end", () => {
    console.log("Connection closed!");
  });

  socket.on("data", async (data: Buffer) => {
    const request = new TextDecoder().decode(data);
    const splitRequest = request.split(" ");

    const requestType = splitRequest[0];
    const htmlFile = splitRequest[1].slice(1);

    if (requestType !== "GET") {
      socket.write("Error: Invalid Request Type!");
      socket.end();
      return;
    }

    try {
      const file = await fs.readFile(`./html/${htmlFile}`);
      const dataToSend = file.toString();
      console.log(dataToSend);
      socket.write(dataToSend);
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
