import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BrokersPage from "./components/brokersPage/BrokersPage";
import SettingsPage from "./components/settingsPage/SettingsPage";
import StocksPage from "./components/stocksPage/StocksPage";
import TradePage from "./components/TradePage/TradePage";
import LoginPage from "./components/loginPage/loginPage";
import RegistrationPage from "./components/registrationPage/registrationPage";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Toolbar from "./components/toolbar/Toolbar";
import { Provider, useDispatch, useSelector } from 'react-redux'; // Импортируйте Provider из react-redux
import store from './store/store'; // Импортируйте ваш Redux-стор
import { logout } from './store/userActions';
import socket from './services/WebSocketService';
import type { RootState } from './store/store';


function RequireBroker({ children }: { children: React.ReactElement }) {
  const broker = useSelector((state: RootState) => state.user.currentUser);
  return broker ? children : <Navigate to="/login" replace />;
}

function SocketSession() {
  const dispatch = useDispatch();
  React.useEffect(() => {
    localStorage.removeItem('currentUser');
    const reset = () => { dispatch(logout()); };
    socket.on('disconnect', reset);
    return () => { socket.off('disconnect', reset); };
  }, [dispatch]);
  return null;
}

function App() {
  return (
    <Provider store={store}>
      <SocketSession />
      <BrowserRouter>
        <div className="container mx-auto p-2">
          <Toolbar />
          <Routes>
            <Route path="/brokers" element={<RequireBroker><BrokersPage /></RequireBroker>} />
            <Route path="/settings" element={<RequireBroker><SettingsPage /></RequireBroker>} />
            <Route path="/stocks" element={<RequireBroker><StocksPage /></RequireBroker>} />
            <Route path="/trade" element={<RequireBroker><TradePage /></RequireBroker>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
