import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Link, useNavigate } from 'react-router-dom';
import webSocketService from "../../services/WebSocketService";
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/userActions';

function LoginPage() {
  const [formData, setFormData] = useState({
    name: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLogin = () => {
    // Здесь отправляем данные аутентификации через WebSocket
    webSocketService.emit('login', formData);

    // Перед переходом на /brokers, вы можете обработать успешный логин и перенаправить пользователя
    webSocketService.on('loginSuccess', (user) => {
      dispatch(setUser(user));
      localStorage.setItem('currentUser', JSON.stringify(user));
      navigate('/brokers');
    });

    // Обработка неудачного логина для подсветки инпутов в красный цвет
    webSocketService.on('loginFailure', (errorMessage) => {
      setError(errorMessage);
    });
  };

  return (
    <div className={'container p-2 mx-auto flex justify-center flex-col items-center'}>
      <h1 className={'font-bold text-xl'}>Логин</h1>
      <Box
        component="form"
        className="flex p-5 !flex-col max-w-2xl w-1/4 gap-3"
      >
        <TextField
          required
          id="outlined-required"
          label="Имя"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          error={error !== null}
        />
        <TextField
          required
          id="outlined-password-input"
          label="Пароль"
          type="password"
          autoComplete="current-password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          error={error !== null}
        />
        <Button variant="outlined" onClick={handleLogin}>
          Отправить
        </Button>
        {error && <div className="text-red-500">{error}</div>}
        <Link to="/register" className={'text-blue-500 hover:text-blue-600'}>
          Не зарегистрированы?
        </Link>
      </Box>
    </div>
  );
}

export default LoginPage;
