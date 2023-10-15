import React, { useEffect, useState } from 'react';
import BrokerCard from "./mixins/brokerCard";
import CircularProgress from '@mui/material/CircularProgress'; // Импортируйте CircularProgress
import webSocketService from "../../services/WebSocketService";
export interface IBroker {
  name: string,
  initialCapital: number
}

function BrokersPage() {
  const [brokers, setBrokers] = useState<IBroker[]>()

  useEffect(() => {
    webSocketService.emit('brokers');

    webSocketService.on('brokers', function(data) {
      setBrokers(data);
    });

    return () => {
      webSocketService.off('brokers');
    };
  }, []); // Пустой массив зависимостей для выполнения только один раз

  return (
    <div className="container mx-auto p-1 flex flex-col gap-3">
      {!brokers &&
        <CircularProgress color="inherit" />
      }
      {brokers && brokers.map(broker => (
        <BrokerCard key={broker.name} name={broker.name} startCapital={broker.initialCapital} />
      ))}
    </div>
  );
}

export default BrokersPage;
