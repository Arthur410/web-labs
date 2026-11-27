import { OnModuleDestroy } from '@nestjs/common';
import {
  ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as jsonStocks from '../#data/stocks.json';

export function nextTradingMonth(date: string) {
  const match = /^\d{1,2}\.(\d{1,2})\.(\d{4})$/.exec(date);
  if (!match) return null;
  const month = Number(match[1]);
  const year = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return `01.${String(month === 12 ? 1 : month + 1).padStart(2, '0')}.${year + Number(month === 12)}`;
}

@WebSocketGateway()
export class StocksGateway implements OnModuleDestroy {
  @WebSocketServer()
  private server: Server;
  private readonly stocks: IStock[] = JSON.parse(JSON.stringify(jsonStocks.stocks));
  private tradingStartDate: Date | null = null;
  private tradingInterval: ReturnType<typeof setInterval> | null = null;

  @SubscribeMessage('stocks')
  findAll() {
    return { event: 'stocks', data: this.stocks };
  }

  @SubscribeMessage('updateStocks')
  changeTradeStatus(@ConnectedSocket() client: Socket, @MessageBody() changes: Pick<IStock, 'symbol' | 'isTrading'>[]) {
    if (!client.data.broker) return { error: 'Войдите, чтобы изменить настройки' };
    if (!Array.isArray(changes) || changes.length > this.stocks.length || changes.some(change =>
      !change || typeof change.isTrading !== 'boolean' || !this.stocks.some(stock => stock.symbol === change.symbol))) {
      return { error: 'Некорректный список акций' };
    }

    for (const { symbol, isTrading } of changes) {
      this.stocks.find(stock => stock.symbol === symbol).isTrading = isTrading;
    }
    this.server.emit('updateStockData', this.stocks);
    return { data: true };
  }

  @SubscribeMessage('getStartTradeDate')
  getStartTradeDate() {
    return { event: 'getStartTradeDate', data: this.tradingStartDate };
  }

  // Метод для начала имитации торговли
  @SubscribeMessage('startTrading')
  startTrading(@ConnectedSocket() client: Socket, @MessageBody() input: { tickSeconds: number; date: string }) {
    if (!client.data.broker) return { error: 'Войдите, чтобы начать торги' };
    if (this.tradingInterval) return { error: 'Торги уже идут' };

    const tickSeconds = input?.tickSeconds;
    const date = typeof input?.date === 'string' ? new Date(input.date) : null;
    if (!Number.isInteger(tickSeconds) || tickSeconds < 1 || tickSeconds > 60 || !date ||
        date.toLocaleDateString('ru') !== new Date().toLocaleDateString('ru')) {
      return { error: 'Укажите сегодняшнюю дату и интервал от 1 до 60 секунд' };
    }

    this.tradingStartDate = date;
    this.server.emit('getStartTradeDate', date);
    let remaining = 4;
    this.tradingInterval = setInterval(() => {
      for (const stock of this.stocks) {
        if (!stock.isTrading) continue;
        const last = stock.historicalData[stock.historicalData.length - 1];
        const next = last && nextTradingMonth(last.date);
        if (next) stock.historicalData.push({ date: next, price: `${Math.floor(Math.random() * 1000)}$` });
      }
      this.server.emit('updateStockData', this.stocks);
      if (--remaining === 0) {
        this.stopTrading();
        this.server.emit('getStartTradeDate', null);
      }
    }, tickSeconds * 1000);
    return { data: true };
  }

  onModuleDestroy() {
    this.stopTrading();
  }

  private stopTrading() {
    if (this.tradingInterval) clearInterval(this.tradingInterval);
    this.tradingInterval = null;
    this.tradingStartDate = null;
  }
}
