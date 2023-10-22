import {Box} from "@mui/material";
import React, {useEffect, useState} from "react";
import {IStock} from "../../interfaces/IStock";
import webSocketService from "../../services/WebSocketService";
import {LineChart} from "../chart/LineChart";

function TradePage() {
	const [stocks, setStocks] = useState<IStock[]>();
	const [tradeDate, setTradeDate] = useState<Date>();

	useEffect(() => {
		webSocketService.emit('stocks');
		webSocketService.emit('getStartTradeDate')


		webSocketService.on('stocks', function (data) {
			setStocks(data);
		});

		webSocketService.on(`updateStockData`, function (data) {
			webSocketService.emit('stocks');
		});

		webSocketService.on('getStartTradeDate', function (date: Date) {
			if (!date || new Date(date).toLocaleDateString('ru') !== new Date().toLocaleDateString('ru')) return;

			setTradeDate(new Date(date))
		})

		return () => {
			webSocketService.off('stocks');
		};
	}, []);

	let counter = 0;
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
				{stocks && stocks.map(stock => {
					if (!stock.isTrading) {
						counter += 1;
						return;
					}

					return (
						<div className='flex flex-col items-center'>
							<img style={{width: '30px', height:'30px'}} src={require(`../../images/${stock.symbol}.png`)} alt="Акция"/>
							<LineChart chartData={stock}/>
						</div>
					)
				})}
			</Box>
			{counter === stocks?.length && (
				<div className="flex flex-col justify-center items-center w-full">
					<h1 className="font-bold">Акций не найдено... Выберите для торговли нужные акции!</h1>
					<img src={require('../../images/Suffer.png')} alt="There is no stocks"/>
				</div>
			)}
		</div>
	)
}

export default TradePage;
