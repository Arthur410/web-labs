import { io } from 'socket.io-client';

const socket = io('http://127.0.0.1:5000', {
  transports: ['websocket'],
});

export async function request<T>(event: string, payload?: unknown): Promise<T> {
  if (!socket.connected) throw new Error('Нет соединения с сервером');
  const response: { data?: T; error?: string } = await socket.timeout(5000).emitWithAck(event, payload);
  if (response.error) throw new Error(response.error);
  if (response.data === undefined) throw new Error('Сервер не подтвердил операцию');
  return response.data;
}

export default socket;
