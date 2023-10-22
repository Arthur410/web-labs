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
    dispatch(logout());
    localStorage.removeItem('currentUser');
  };

  return (
    <nav className={'py-5'}>
      <img src={require('../../images/stocksLogo.png')} alt="Логотип" style={{position: 'absolute', top: '15px', left: '50%', width: '100px', height:'40px'}}/>
      <ul className={'flex gap-2 pt-10 xl:pt-1'}>
        {currentUser ? (
          <ul className={'flex items-center justify-between w-full max-lg:flex-row max-md:flex-col gap-2'}>
            <ul className={'flex gap-2 max-sm:flex-col'}>
              <Link to="/brokers">
                <Button className={'max-sm:w-32'} variant="outlined">Брокеры</Button>
              </Link>
              <Link to="/stocks">
                <Button className={'max-sm:w-32'} variant="outlined">Акции</Button>
              </Link>
              <Link to="/trade">
                <Button className={'max-sm:w-32'} variant="outlined">Торговля</Button>
              </Link>
              <Link to="/settings">
                <Button className={'max-sm:w-32'} variant="outlined">Настройки</Button>
              </Link>
            </ul>
            <ul className={'flex justify-center items-center gap-2'}>
              <Button className={'max-sm:w-32'} variant="outlined" onClick={handleLogout} style={{color: 'red'}}>Выйти</Button>
              <h1 className={'text-cyan-800 font-bold'}>{currentUser.name.toUpperCase()}</h1>
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
