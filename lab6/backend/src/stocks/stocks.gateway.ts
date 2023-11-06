import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import * as jsonStocks from '../#data/stocks.json'
import * as XLSX from 'xlsx';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})

export class StocksGateway {
  @WebSocketServer()
  private server: Server;
  private stocks: IStock[];
  private tradingStocks: ITradingStock[] = [];
  private counterRowReading = 1;

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

  @SubscribeMessage('addTradeStock')
  addTradeStock(@MessageBody() newStock: ITradingStock): WsResponse<string> {
    if (newStock.stock.isTrading) {
      const existingTradingStock = this.tradingStocks.find(
        (tradingStock) => tradingStock.stock.symbol === newStock.stock.symbol
      );

      if (existingTradingStock) {
        existingTradingStock.amount += newStock.amount;
      } else {
        this.tradingStocks.push(newStock);
      }

      this.server.emit('getTradeStock', this.tradingStocks as any);

      return { event: 'addTradeStock', data: 'Success' };
    } else {
      return { event: 'addTradeStock', data: null };
    }
  }

  @SubscribeMessage('reduceTradeStock')
  reduceTradeStock(@MessageBody() newStock: ITradingStock): WsResponse<string> {
    if (newStock.stock.isTrading) {
      const existingTradingStock = this.tradingStocks.find(
        (tradingStock) => tradingStock.stock.symbol === newStock.stock.symbol
      );

      existingTradingStock.amount -= newStock.amount;

      this.server.emit('getTradeStock', this.tradingStocks as any);

      return { event: 'addTradeStock', data: 'Success'};
    } else {
      return { event: 'addTradeStock', data: null };
    }
  }

  @SubscribeMessage('getTradeStock')
  getTradeStock(): WsResponse<ITradingStock[]> {
    return { event: 'getTradeStock', data: this.tradingStocks };
  }

  @SubscribeMessage('removeTradeStock')
  removeTradeStock(@MessageBody() symbol: string): WsResponse<string> {
    const index = this.tradingStocks.findIndex(tradingStock => tradingStock.stock.symbol === symbol);

    if (index !== -1) {
      this.tradingStocks.splice(index, 1);

      this.server.emit('getTradeStock', this.tradingStocks as any);

      return { event: 'removeTradeStock', data: `Акция с символом ${symbol} успешно удалена из списка торгующих` };
    } else {
      return { event: 'error', data: `Акция с символом ${symbol} не найдена в списке торгующих` };
    }
  }



  // Метод для начала имитации торговли
  @SubscribeMessage('startTrading')
  startTrading(@MessageBody() [tickSeconds, totalSeconds, date]: [number, number, Date]): void {
    if (this.isTradingWorking || new Date(date).toLocaleDateString('ru') !== new Date().toLocaleDateString('ru')) {
      return;
    }
    this.tradingStartDate = new Date(date);
    this.server.emit('tradeStart');
    this.server.emit('getStartTradeDate', this.tradingStartDate as any);

    this.isTradingWorking = true;
    this.tradingIntervalId = setInterval(() => {
      for (const stock of this.stocks) {
        if (!stock.isTrading) continue;

        const lastDataPoint = stock.historicalData[stock.historicalData.length - 1];
        const lastDate = new Date(lastDataPoint.date);

        const nextMonth = lastDate.getMonth() + 1;
        const nextYear = lastDate.getFullYear();

        const workbook = XLSX.readFile(`C:\\Users\\arthu\\WebstormProjects\\web-labs\\lab5\\backend\\src\\stocks\\historyData\\${stock.symbol}.xls`);

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const columnB = XLSX.utils.sheet_to_json(sheet, { header: 1 })

        const price = columnB[this.counterRowReading][1];

        this.counterRowReading += 1;

        stock.historicalData.push({
          date: `01.${String(nextMonth + 1).padStart(2, '0')}.${nextYear}`,
          price: price as string,
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
      this.server.emit('tradeEnd');

      clearInterval(this.tradingIntervalId);
      this.tradingStartDate = null;
      this.isTradingWorking = false;
      this.tradingIntervalId = null;
    }
  }
}