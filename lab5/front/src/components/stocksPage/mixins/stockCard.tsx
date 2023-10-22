import Button from "@mui/material/Button";
import React, {useEffect, useState} from "react";
import { Box, Modal, Typography } from "@mui/material";
import { IStock } from "../../../interfaces/IStock";
import { LineChart } from "../../chart/LineChart";
import CloseIcon from "@mui/icons-material/Close";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  padding: '30px'
};

const buttonContainerStyle = {
  position: 'absolute' as 'absolute',
  top: '-30px', // Adjust the top value as needed
  right: '-30px', // Adjust the right value as needed
};

const imageContainerStyle = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
}

function StockCard({ stock, isInSelectMode, onStockUpdate }: { stock: IStock, isInSelectMode: boolean, onStockUpdate: Function}) {
  const [open, setOpen] = useState(false);
  const [isSelected, setIsSelected] = useState(stock.isTrading);

  const handleToggleSelect = () => {
    setIsSelected(!isSelected);
    stock.isTrading = !isSelected
    onStockUpdate(stock)
  };

  const handleStockClick = () => {
    if (isInSelectMode) {
      handleToggleSelect()
      return;
    }

    setOpen(true);
  };

  const handleModalClose = () => setOpen(false);

  return (
    <div className={'container'}>
      <div onClick={handleStockClick}
           style={{
             transition: 'all .2s linear'
           }}
           className="container p-5 flex flex-col items-centerp-5 gap-2 border shadow-lg hover:bg-gray-100 cursor-pointer opacity-80 grayscale hover:grayscale-0 hover:opacity-100">
        <Box sx={imageContainerStyle}>
          <img style={{
            height: '200px',
          }} src={require(`../../../images/${stock.symbol}.png`)} alt="logo"/>
        </Box>
        <h1 className={'text-center font-semibold my-2'}>{stock.name}({stock.symbol})</h1>

        {isInSelectMode && (
          isSelected ? <CheckBoxIcon/> : <CheckBoxOutlineBlankIcon/>
        )}
      </div>
      <Modal
        open={open}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div style={{ position: 'relative' }}>
            <LineChart chartData={stock} />
            <div style={buttonContainerStyle}>
              <Button
                onClick={handleModalClose}
                size="small"
                color="error"
                variant="contained"
                startIcon={<CloseIcon />}>
                Закрыть
              </Button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
}

export default StockCard;
