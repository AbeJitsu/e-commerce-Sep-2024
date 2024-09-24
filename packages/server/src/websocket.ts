import WebSocket from 'ws';
import { Server } from 'http';

let clients: WebSocket[] = [];

interface WebSocketData {
  // Define the structure of your WebSocket data here
  // For example:
  type: string;
  payload: any;
}

const setupWebSocket = (server: Server): void => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws: WebSocket) => {
    clients.push(ws);
    console.log('New client connected');

    ws.on('message', (message: WebSocket.Data) => {
      console.log('Received message:', message);
      try {
        const data: WebSocketData = JSON.parse(message.toString());
        broadcast(data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      clients = clients.filter((client) => client !== ws);
    });

    ws.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
    });
  });

  const broadcast = (data: WebSocketData): void => {
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  console.log('WebSocket server is running');
};

export default setupWebSocket;
