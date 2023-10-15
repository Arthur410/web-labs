import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import { Provider } from 'react-redux'; // Импортируйте Provider из react-redux
import store from './store/store'; // Импортируйте ваш Redux-стор
import { setUser } from './store/userActions';


function App() {
  let currentUser;
  const initializeApp = () => {
    // @ts-ignore
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
      store.dispatch(setUser(currentUser)); // setUser - действие для установки текущего пользователя
    }
  };

  // Вызов функции инициализации приложения при загрузке
  initializeApp();

  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="container mx-auto p-2">
          <Toolbar />
          <Routes>
            <Route path="/brokers" element={<BrokersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/stocks" element={<StocksPage />} />
            <Route path="/trade" element={<TradePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
