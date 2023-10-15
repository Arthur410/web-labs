import CircularProgress from "@mui/material/CircularProgress";
import React, { useEffect, useState } from 'react';
import webSocketService from "../../services/WebSocketService";
import StockCard from './mixins/stockCard';

interface IStock {
  name: string,
  symbol:string,
  historicalData: {
    date: string,
    price: string
  }[]
}

function StocksPage() {
  const [stocks, setStocks] = useState<IStock[]>()

  useEffect(() => {
    webSocketService.emit('stocks');

    webSocketService.on('stocks', function(data) {
      setStocks(data);
    });

    return () => {
      webSocketService.off('stocks');
    };
  }, []); // Пустой массив зависимостей для выполнения только один раз

  return (
    <div className="container mx-auto p-1 flex flex-col gap-3">
      {!stocks &&
        <CircularProgress color="inherit" />
      }
      {stocks && stocks.map(stock => (
        <StockCard key={stock.name} name={stock.name} symbol={stock.symbol} />
      ))}
    </div>
  );
}

export default StocksPage;
