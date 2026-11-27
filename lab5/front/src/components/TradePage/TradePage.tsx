import {Box} from "@mui/material";
import React, {useEffect, useState} from "react";
import {IStock} from "../../interfaces/IStock";
import webSocketService from "../../services/WebSocketService";
import {LineChart} from "../chart/LineChart";

function TradePage() {
	const [stocks, setStocks] = useState<IStock[]>();
	const [tradeDate, setTradeDate] = useState<Date>();

  useEffect(() => {
    const receive = (data: IStock[]) => setStocks(data);
    const receiveDate = (date: string | null) => setTradeDate(date ? new Date(date) : undefined);
    webSocketService.on('stocks', receive);
    webSocketService.on('updateStockData', receive);
    webSocketService.on('getStartTradeDate', receiveDate);
    webSocketService.emit('stocks');
    webSocketService.emit('getStartTradeDate');
    return () => {
      webSocketService.off('stocks', receive);
      webSocketService.off('updateStockData', receive);
      webSocketService.off('getStartTradeDate', receiveDate);
    };
  }, []);

	const tradingStocks = stocks?.filter(stock => stock.isTrading);
	return (
		<div className={'container'}>
			{tradeDate && (
				<>
					<h1 className={'font-bold text-2xl py-2 text-center'}>Дата начала торгов: {tradeDate.toLocaleDateString('ru')}</h1>
				</>
			)}
			{!tradeDate && (
				<>
					<h1 className={'font-bold text-2xl py-2 text-center'}>Ждите запуска торгов</h1>
				</>
			)}
			<Box className="grid grid-cols-1 xl:grid-cols-3 gap-6">
				{tradingStocks?.map(stock => {
					return (
						<div key={stock.symbol} className='flex flex-col items-center'>
							<img style={{width: '30px', height:'30px'}} src={require(`../../images/${stock.symbol}.png`)} alt="Акция"/>
							<LineChart chartData={stock}/>
						</div>
					)
				})}
			</Box>
			{tradingStocks?.length === 0 && (
				<div className="flex flex-col justify-center items-center w-full">
					<h1 className="font-bold">Акций не найдено... Выберите для торговли нужные акции!</h1>
					<img src={require('../../images/Suffer.png')} alt="There is no stocks"/>
				</div>
			)}
		</div>
	)
}

export default TradePage;
