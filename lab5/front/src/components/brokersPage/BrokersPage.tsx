import AddIcon from "@mui/icons-material/Add";
import {Box, Typography} from "@mui/material";
import Button from "@mui/material/Button";
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from "@mui/material/MenuItem"; // Импортируйте CircularProgress
import Modal from '@mui/material/Modal';
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import React, {useEffect, useState} from 'react';
import webSocketService from "../../services/WebSocketService";
import BrokerCard from "./mixins/brokerCard";
import {IBroker} from "../../interfaces/IBroker";


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

const INITIAL_CAPITAL_VALUE = 1000000;

function BrokersPage() {
  const [brokers, setBrokers] = useState<IBroker[]>()
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [open, setOpen] = useState(false);

  const handleModalOpen = () => setOpen(true);
  const handleModalClose = () => {
    setOpen(false)
    setSuccessMessage("")
    setFormData({
      name: '',
      initialValue: INITIAL_CAPITAL_VALUE,
      password: '',
    })
  };

  const [formData, setFormData] = useState({
    name: '',
    initialValue: INITIAL_CAPITAL_VALUE,
    password: '',
  });

  useEffect(() => {
    webSocketService.emit('brokers');

    webSocketService.on('brokers', function (data) {
      setBrokers(data);
    });

    return () => {
      webSocketService.off('brokers');
    };
  }, []); // Пустой массив зависимостей для выполнения только один раз

  const handleChange = (updatedCapital: number, brokerName: string) => {
    if (!brokers) return;

    const updatedBrokers = brokers.map(broker => {
      if (broker.name === brokerName) {
        broker.initialValue = updatedCapital;
      }
      return broker;
    });

    setBrokers(updatedBrokers);
  }

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const {name, value} = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };


  const handleAddBroker = () => {
    // Здесь отправляем данные регистрации через WebSocket
    webSocketService.emit('register', formData);

    webSocketService.on('registerSuccess', (newBroker) => {
      setSuccessMessage('Брокер успешно добавлен!');
      console.log(successMessage);
      handleModalOpen();
      webSocketService.emit('brokers');
    });

    webSocketService.on('registerFailure', (err) => {
      alert(err)
    })
  }

  const handleDeleteBroker = (name: string) => {
    // Здесь отправляем данные удаления брокера через WebSocket
    webSocketService.emit('deleteBroker', name);

    // Обработка успешного удаления для обновления списка брокеров
    webSocketService.on('deleteBrokerSuccess', () => {
      webSocketService.emit('brokers');
    });

    // Обработка ошибки удаления, если брокер с указанным именем не найден
    webSocketService.on('deleteBrokerFailure', (err) => {
      alert(err);
    });
  };

  return (
    <div className="container mx-auto p-1 flex flex-col gap-3">
      {!brokers &&
      <CircularProgress color="inherit"/>
      }

      {brokers && brokers.map(broker => (
        <BrokerCard
          key={broker.name}
          broker={broker}
          onChange={(capital: number) => handleChange(capital, broker.name)}
          onDelete={(name: string) => handleDeleteBroker(name)}/>
      ))}

      <div className="add">
        <Button size="small"
                onClick={handleModalOpen}
                variant="contained"
                startIcon={<AddIcon/>}>Добавить</Button>
      </div>
      <Modal
        open={open}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {successMessage &&
          <Box id="modal-modal-title" className={'text-green-400 flex flex-col gap-3'}>
            <img src={require(`../../images/Happy.png`)} alt="success"/>
            <p>{successMessage}</p>
            <Button variant="outlined" onClick={handleModalClose}>Закрыть</Button>
          </Box>}

          {!successMessage && <div className="flex !flex-col max-w-2xl w-full gap-3">
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Новый брокер
            </Typography>
            <Box
              component="form"
              className="flex !flex-col max-w-2xl w-full gap-3"
            >
              <TextField
                required
                id="name"
                type={'text'}
                label="Имя"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
              <Select
                name="initialValue"
                value={formData.initialValue}
                onChange={handleInputChange}
              >
                <MenuItem value={500000}>500000</MenuItem>
                <MenuItem value={1000000}>1000000</MenuItem>
                <MenuItem value={1500000}>1500000</MenuItem>
              </Select>
              <TextField
                required
                id="password"
                label="Пароль"
                type="password"
                autoComplete="current-password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <Button variant="outlined" onClick={handleAddBroker}>
                Создать
              </Button>
            </Box>
          </div>}
        </Box>
      </Modal>
    </div>
  );
}

export default BrokersPage;
