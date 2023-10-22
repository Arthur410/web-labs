import {Box} from "@mui/material";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from 'react';
import webSocketService from "../../services/WebSocketService";
import StockCard from './mixins/stockCard';
import {IStock} from "../../interfaces/IStock";


const selectStockToTradeStyles = {
  position:'fixed',
  bottom: '15px',
  right: '15px',
  zIndex: 999,
  borderRadius: '5px',
  padding: '15px',
  cursor: 'pointer',
  transition: 'all .2s linear'
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  justifyContent: 'center',
  alignItems: 'center',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function StocksPage() {
  const [stocks, setStocks] = useState<IStock[]>()
  const [selectMode, setSelectMode] = useState(false);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    webSocketService.emit('stocks');

    webSocketService.on('stocks', function(data) {
      setStocks(data);
    });

    return () => {
      webSocketService.off('stocks');
    };
  }, []); // Пустой массив зависимостей для выполнения только один раз

  const toggleSelectMode = () => {
    setSelectMode(prevState => {
      if (prevState) {
        webSocketService.emit('updateStocks', stocks);

        webSocketService.on('updateStocks', res => {
          setSuccessMessage(res);
          handleOpen();
        })
      }

      return !prevState;
    });
  }

  const stockUpdateHandle = (updatedStock: IStock) => {
    stocks?.forEach(stock => {
      stock.isTrading = stock.name === updatedStock.name ? updatedStock.isTrading : stock.isTrading;
    })
  }

  return (
    <div className="container mx-auto p-1 grid grid-cols-3 gap-2 max-md:grid-cols-2 max-sm:grid-cols-1">
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className={'p-5'}>
          <img src={require(`../../images/Happy.png`)} alt="success"/>
          <Typography id="modal-modal-title" variant="h6" component="h6" className={'text-green-300'}>
            {successMessage}
          </Typography>
          <Button variant="outlined" onClick={() => {
            handleClose()
          }}>
            Закрыть
          </Button>
        </Box>
      </Modal>
      <Box onClick={toggleSelectMode} sx={selectStockToTradeStyles} className={'bg-sky-400 hover:bg-sky-600 font-bold hover:text-white shadow-lg'}>
        {selectMode ? "Отправить" : "Режим выбора"}
      </Box>
      {!stocks &&
        <CircularProgress color="inherit" />
      }
      {stocks && stocks.map(stock => (
        <StockCard key={stock.name} stock={stock} isInSelectMode={selectMode} onStockUpdate={(updatedStock: IStock) => stockUpdateHandle(updatedStock)}/>
      ))}
    </div>
  );
}

export default StocksPage;
