import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { Socket } from 'socket.io';
import * as jsonData from '../#data/brokers.json';
import { IBroker } from './interfaces/IBroker';

type Credentials = { salt: Buffer; hash: Buffer };

function validPassword(value: unknown): value is string {
  return typeof value === 'string' && value.length >= 3 && value.length <= 128;
}

function credentials(password: string): Credentials {
  const salt = randomBytes(16);
  return { salt, hash: scryptSync(password, salt, 32) };
}

@WebSocketGateway()
export class BrokersGateway {
  private readonly brokers = new Map<string, IBroker>(
    jsonData.brokers.map(({ name, initialValue, quote }) => [name, { name, initialValue, quote }]),
  );
  private readonly passwords = new Map<string, Credentials>();

  constructor() {
    const demoPassword = process.env.LAB5_DEMO_PASSWORD;
    if (demoPassword !== undefined) {
      if (!validPassword(demoPassword)) throw new Error('Некорректный LAB5_DEMO_PASSWORD');
      for (const name of this.brokers.keys()) this.passwords.set(name, credentials(demoPassword));
    }
  }

  @SubscribeMessage('brokers')
  findAll() {
    return { event: 'brokers', data: [...this.brokers.values()] };
  }

  @SubscribeMessage('login')
  handleLogin(@ConnectedSocket() client: Socket, @MessageBody() input: { name: string; password: string }) {
    if (typeof input?.name !== 'string' || !validPassword(input.password)) {
      return { error: 'Некорректные данные входа' };
    }
    const name = input.name.trim();
    const broker = this.brokers.get(name);
    const secret = this.passwords.get(name);
    if (!broker || !secret || !timingSafeEqual(secret.hash, scryptSync(input.password, secret.salt, 32))) {
      return { error: 'Неверное имя или пароль' };
    }
    client.data.broker = broker;
    return { data: broker };
  }

  @SubscribeMessage('logout')
  logout(@ConnectedSocket() client: Socket) {
    delete client.data.broker;
    return { data: true };
  }

  @SubscribeMessage('register')
  handleRegister(@MessageBody() input: IBroker & { password: string }) {
    if (typeof input?.name !== 'string' || !input.name.trim() || input.name.length > 80 || !validPassword(input.password)) {
      return { error: 'Некорректные данные регистрации' };
    }
    const name = input.name.trim();
    if (this.brokers.has(name)) return { error: 'Такое имя уже занято' };

    const initialValue = input.initialValue ?? 1_000_000;
    if (!Number.isSafeInteger(initialValue) || initialValue < 0) return { error: 'Некорректный капитал' };

    const broker = { name, initialValue };
    this.brokers.set(name, broker);
    this.passwords.set(name, credentials(input.password));
    return { data: broker };
  }

  @SubscribeMessage('updateInitialValue')
  updateInitialValue(@ConnectedSocket() client: Socket, @MessageBody() input: IBroker) {
    const broker = this.brokers.get(input?.name);
    if (!broker || client.data.broker !== broker) return { error: 'Можно изменить только свой профиль' };
    if (!Number.isSafeInteger(input.initialValue) || input.initialValue < 0) {
      return { error: 'Некорректный капитал' };
    }
    broker.initialValue = input.initialValue;
    return { data: broker };
  }

  @SubscribeMessage('deleteBroker')
  deleteBroker(@ConnectedSocket() client: Socket, @MessageBody() name: string) {
    const broker = this.brokers.get(name);
    if (!broker || client.data.broker !== broker) return { error: 'Можно удалить только свой профиль' };
    // Удалить брокера из списка.
    this.brokers.delete(name);
    this.passwords.delete(name);
    for (const peer of client.nsp.sockets.values()) {
      if (peer.data.broker === broker) delete peer.data.broker;
    }
    return { data: true };
  }
}
