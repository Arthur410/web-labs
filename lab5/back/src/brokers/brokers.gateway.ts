import {WebSocketGateway, SubscribeMessage, MessageBody, WsResponse} from '@nestjs/websockets';
import * as jsonData from '../#data/brokers.json';
import { IBroker } from './interfaces/IBroker';

@WebSocketGateway()
export class BrokersGateway {
  private readonly brokers: IBroker[];

  constructor() {
    this.brokers = jsonData.brokers as unknown as IBroker[];
  }

  @SubscribeMessage('brokers')
  findAll(): WsResponse<IBroker[]> {
    return { event: 'brokers', data: this.brokers };
  }

  @SubscribeMessage('login')
  handleLogin(@MessageBody() loginData: { name: string, password: string }): WsResponse<IBroker | string> {
    const { name, password } = loginData;
    const foundBroker = this.brokers.find(broker => broker.name === name && broker.password === password);

    if (foundBroker) {
      return { event: 'loginSuccess', data: foundBroker };
    } else {
      return { event: 'loginFailure', data: 'Invalid username or password' };
    }
  }

  @SubscribeMessage('register')
  handleRegister(@MessageBody() newBroker: IBroker): WsResponse<IBroker | string> {
    const existingBroker = this.brokers.find(broker => broker.name === newBroker.name);

    if (existingBroker) {
      return { event: 'registerFailure', data: 'Username already exists' };
    } else {
      this.brokers.push(newBroker);
      return { event: 'registerSuccess', data: newBroker };
    }
  }

  @SubscribeMessage('updateInitialValue')
  updateInitialValue(@MessageBody() updateData: { name: string, initialValue: number }): WsResponse<IBroker | string> {
    const { name, initialValue } = updateData;
    const brokerIndex = this.brokers.findIndex(broker => broker.name === name);

    if (brokerIndex !== -1) {
      this.brokers[brokerIndex].initialValue = updateData.initialValue;
      return { event: 'updateInitialValueSuccess', data: this.brokers[brokerIndex] };
    } else {
      return { event: 'updateInitialValueFailure', data: 'Broker not found' };
    }
  }

  @SubscribeMessage('deleteBroker')
  deleteBroker(@MessageBody() name: string): WsResponse<string> {
    const brokerIndex = this.brokers.findIndex(broker => broker.name === name);

    if (brokerIndex !== -1) {
      // Удалить брокера из массива
      this.brokers.splice(brokerIndex, 1);
      return { event: 'deleteBrokerSuccess', data: 'Broker deleted successfully' };
    } else {
      return { event: 'deleteBrokerFailure', data: 'Broker not found' };
    }
  }

}