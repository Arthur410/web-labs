import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import {Observable} from "rxjs";
import { Server } from 'socket.io';
import * as jsonStocks from '../#data/stocks.json'

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class StocksGateway {
  @WebSocketServer()
  private server: Server;
  private stocks: IStock[];

  private isTradingWorking = false;
  private tradingStartDate: Date;
  private tradingIntervalId = null;

  constructor() {
    this.stocks = jsonStocks.stocks as unknown as IStock[]
  }

  @SubscribeMessage('stocks')
  findAll(): WsResponse<IStock[]> {
    return { event: 'stocks', data: this.stocks };
  }

  @SubscribeMessage('updateStocks')
  changeTradeStatus(@MessageBody() newStocks: IStock[]): WsResponse<string> {
    if (newStocks &&  JSON.stringify(newStocks) !== JSON.stringify(this.stocks)) {
      this.stocks = newStocks;
      return { event: 'updateStocks', data: 'Статусы акций успешно обновились' };
    } else {
      return { event: 'error', data: 'Stock not found' };
    }
  }

  @SubscribeMessage('getStartTradeDate')
  getStartTradeDate(): WsResponse<Date> {
    if (this.tradingStartDate) {
      return { event: 'getStartTradeDate', data: this.tradingStartDate };
    } else {
      return {event: 'getStartTradeDate', data: null}
    }
  }

  // Метод для начала имитации торговли
  @SubscribeMessage('startTrading')
  startTrading(@MessageBody() [tickSeconds, totalSeconds, date]: [number, number, Date]): void {
    if (this.isTradingWorking || new Date(date).toLocaleDateString('ru') !== new Date().toLocaleDateString('ru')) {
      return;
    }

    this.tradingStartDate = new Date(date);
    this.server.emit('getStartTradeDate');

    this.isTradingWorking = true;
    this.tradingIntervalId = setInterval(() => {
      for (const stock of this.stocks) {
        if (!stock.isTrading) continue;

        const lastDataPoint = stock.historicalData[stock.historicalData.length - 1];
        const lastDate = new Date(lastDataPoint.date);

        const nextMonth = lastDate.getMonth() + 1;
        const nextYear = lastDate.getFullYear();

        stock.historicalData.push({
          date: `01.${String(nextMonth + 1).padStart(2, '0')}.${nextYear}`,
          price: `${Math.floor(Math.random() * 1000)}$`,
        });
      }

      this.server.emit('updateStockData', this.stocks as any);

      totalSeconds -= tickSeconds;

      if (totalSeconds <= 0) {
        this.stopTrading();
      }
    }, tickSeconds * 1000);
  }

  private stopTrading() {
    if (this.tradingIntervalId) {
      console.log('Завершили раунд торговли')
      clearInterval(this.tradingIntervalId);
      this.tradingStartDate = null;
      this.isTradingWorking = false;
      this.tradingIntervalId = null;
    }
  }
}