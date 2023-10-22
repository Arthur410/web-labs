import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Link, useNavigate } from 'react-router-dom';
import webSocketService from "../../services/WebSocketService";
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function RegistrationPage() {
  const [formData, setFormData] = useState({
    name: '',
    initialValue: '',
    password: '',
  });
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const navigate = useNavigate();

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRegistration = () => {
    // Здесь отправляем данные регистрации через WebSocket
    webSocketService.emit('register', formData);

    // Обработка успешной регистрации для вывода сообщения и перенаправления пользователя
    webSocketService.on('registerSuccess', (newBroker) => {
      setSuccessMessage(`Регистрация успешна. Добро пожаловать, ${newBroker.name}!`);
      handleOpen();
    });
  };

  return (
    <div className={'container p-2 mx-auto flex justify-center flex-col items-center'}>
      <h1 className={'font-bold text-xl'}>Регистрация</h1>
      <Box
        component="form"
        className="flex p-5 !flex-col max-w-2xl w-1/4 gap-3"
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
        <TextField
          required
          id="initialValue"
          label="Капитал"
          type={'number'}
          placeholder={'Начальный капитал'}
          name="initialValue"
          value={formData.initialValue}
          onChange={handleInputChange}
        />
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
        <Button variant="outlined" onClick={handleRegistration}>
          Отправить
        </Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style} className={'p-5'}>
            <Typography id="modal-modal-title" variant="h6" component="h2" className={'text-green-400'}>
              {successMessage}
            </Typography>
            <Button variant="outlined" onClick={() => {
              handleClose()
              navigate('/login')
            }}>
              Продолжить
            </Button>
          </Box>
        </Modal>
        <Link to="/login" className={'text-blue-500 hover:text-blue-600'}>
          Уже зарегистрированы? Войти
        </Link>
      </Box>
    </div>
  );
}

export default RegistrationPage;
