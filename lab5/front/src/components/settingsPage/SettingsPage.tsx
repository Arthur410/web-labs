import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import webSocketService from "../../services/WebSocketService";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import FormLabel from '@mui/material/FormLabel';
import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  display:'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  textAlign: 'center',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function SettingsPage() {
  const [formData, setFormData] = useState({
    tradeStartDate: dayjs().add(0, 'day'),
    tradeSimulationSpeed: 5,
  });

  const [successMessage, setSuccessMessage] = useState<string>('');
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (date: any) => {
    // Функция для обновления даты начала торгов
    setFormData({
      ...formData,
      tradeStartDate: date,
    });
  };

  const handleStartTrading = () => {
    if (!formData.tradeStartDate || !formData.tradeSimulationSpeed) {
      alert('Введите все нужные поля!');
      return;
    }

    webSocketService.emit('startTrading', formData.tradeSimulationSpeed, formData.tradeSimulationSpeed * 4, formData.tradeStartDate)
    setSuccessMessage('Настройки были успешно заданы!')
    handleOpen()
  };

  return (
    <div className={'container flex justify-center'}>
      <img style={{ zIndex: '-1' }} className={'absolute b-0 l-0 opacity-10'} src={require('../../images/tradePicture.png')} alt="trade" />
      <Box
        component="form"
        className="flex p-5 !flex-col max-w-2xl w-1/2 gap-3 border rounded bg-white shadow-lg	"
      >
        <h1 className={'font-bold text-2xl'}>Настройки торговли</h1>
        <FormLabel>Прогнозируемая дата торгов:</FormLabel>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'en-gb'}>
          <DatePicker
            disablePast
            value={formData.tradeStartDate}
            onChange={handleDateChange}
            slotProps={{
              textField: {
                required: true,
              },
            }}
          />
        </LocalizationProvider>
        <FormLabel>Скорость смены даты в сек:</FormLabel>
        <TextField
          required
          id="initialValue"
          type={'number'}
          name="tradeSimulationSpeed"
          value={formData.tradeSimulationSpeed}
          onChange={handleInputChange}
        />
        <Button variant="outlined" onClick={handleStartTrading}>
          Начать торги
        </Button>
        {error && <div className="text-red-500">{error}</div>}
      </Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className={'p-5 text-center'}>
          <img style={{width: '30%'}} src={require('../../images/Happy.png')} alt="Trace the prices!!"/>
          <Typography id="modal-modal-title" variant="h6" component="h2" className={'text-green-400'}>
            {successMessage}
          </Typography>
          <Button variant="outlined" onClick={() => {
            handleClose()
            navigate('/trade')
          }}>
            Бежать следить за ценами!
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

export default SettingsPage;
