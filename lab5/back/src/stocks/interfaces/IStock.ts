interface IStock {
  name: string,
  symbol:string,
  isTrading: boolean,
  historicalData: {
    date: string,
    price: string
  }[]
}