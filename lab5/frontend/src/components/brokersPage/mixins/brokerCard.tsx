import {useState} from "react";
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import SendIcon from '@mui/icons-material/Send';
import webSocketService from "../../../services/WebSocketService";

export interface IBrokerCard {
  name: string,
  startCapital: number,
}

function BrokerCard(props: IBrokerCard) {
  const [capitalMode, setCapitalMode] = useState(false)

  const [capital, setCapital] = useState(props.startCapital);

  const handleChange = (event: SelectChangeEvent) => {
    setCapital(Number(event.target.value));
  };

  const handleUpdateCapital = () => {
    // Отправить запрос на WebSocket для обновления капитала
    webSocketService.emit('updateInitialValue', { name: props.name, initialValue: capital });

    // Обновить капитал локально
    setCapitalMode(false);

    // Если используете Redux, обновите капитал в хранилище
    dispatch(updateInitialValue(props.name, capital)); // Передайте имя и новое значение капитала
  };

  return (
    <div className="container flex justify-between p-5 border gap-2">
      <h1>{props.name}</h1>
      {!capitalMode && <>
        <p className={'pointer'} onClick={() => setCapitalMode(true)}>{props.startCapital}</p>
      </>}
      {capitalMode && <>
        <FormControl className={'max-w-lg flex flex-col gap-2'}>
          <Select
            value={capital.toString()}
            onChange={handleChange}
          >
            <MenuItem value={500000}>500000</MenuItem>
            <MenuItem value={1000000}>1000000</MenuItem>
            <MenuItem value={props.startCapital}>{props.startCapital}</MenuItem>
          </Select>
          <Button onClick={() => setCapitalMode(false)} variant="contained" endIcon={<SendIcon />}></Button>
        </FormControl>
      </>}
    </div>
  );
}

export default BrokerCard;
