export interface IBroker {
  name: string,
  initialValue: number,
  quote: string,
  password: string,
  ownedStocks: {
    symbol: string,
    amount: number,
    spendMoney: number
  }[]
}