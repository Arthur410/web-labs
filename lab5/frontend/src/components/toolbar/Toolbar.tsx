import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { logout } from '../../store/userActions';
import Button from '@mui/material/Button';

function Toolbar() {
  // @ts-ignore
  const currentUser = useSelector(state => state.user.currentUser);
  const dispatch = useDispatch();

  const handleLogout = () => {
    // Вызываем действие выхода пользователя и удаляем информацию о текущем пользователе из стора и Local Storage
    dispatch(logout());
    localStorage.removeItem('currentUser');
  };

  return (
    <nav>
      <ul className={'flex gap-2'}>
        {currentUser ? (
          <ul className={'flex items-center justify-between w-full'}>
            <ul className={'flex gap-2'}>
              <Link to="/brokers">
                <Button variant="outlined">Брокеры</Button>
              </Link>
              <Link to="/stocks">
                <Button variant="outlined">Акции</Button>
              </Link>
              <Link to="/trade">
                <Button variant="outlined">Торговля</Button>
              </Link>
              <Link to="/settings">
                <Button variant="outlined">Настройки</Button>
              </Link>
            </ul>
            <ul className={'flex justify-center items-center gap-2'}>
              <Button variant="outlined" onClick={handleLogout} style={{color: 'red'}}>Выйти</Button>
              <h1>{currentUser.name}</h1>
            </ul>
          </ul>
        ) : (
          <Link to="/login">
            <Button variant="outlined">Войти</Button>
          </Link>
        )}
      </ul>
    </nav>
  );
}

export default Toolbar;
