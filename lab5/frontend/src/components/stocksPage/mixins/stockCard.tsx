export interface IStockCard {
  name: string,
  symbol: string,
}

function StockCard(props: IStockCard) {
  return (
    <div className="container flex justify-between p-5 border ">
      <h1>{props.name}({props.symbol})</h1>
    </div>
  );
}

export default StockCard;
