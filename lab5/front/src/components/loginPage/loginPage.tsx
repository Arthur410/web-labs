import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Link, useNavigate } from 'react-router-dom';
import { request } from "../../services/WebSocketService";
import { useDispatch } from 'react-redux';
import { IBroker } from '../../interfaces/IBroker';
import { setUser } from '../../store/userActions';

function LoginPage() {
  const [formData, setFormData] = useState({
    name: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLogin = async () => {
    setError('');
    try {
      const broker = await request<IBroker>('login', formData);
      dispatch(setUser(broker));
      navigate('/brokers');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Не удалось войти');
    }
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
          error={Boolean(error)}
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
          error={Boolean(error)}
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
