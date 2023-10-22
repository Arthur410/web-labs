import {Box} from "@mui/material";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import React, {useState} from "react";
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import webSocketService from "../../../services/WebSocketService";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import {IBroker} from "../../../interfaces/IBroker";

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

function BrokerCard(props: { onChange: Function, broker:IBroker, onDelete:Function }) {
  const [capitalMode, setCapitalMode] = useState(false)

  const [formCapital, setFormCapital] = useState(props.broker.initialValue);
  const [realCapital, setRealCapital] = useState(props.broker.initialValue);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (event: SelectChangeEvent) => {
    setFormCapital(Number(event.target.value));
  };

  const handleUpdateCapital = () => {
    webSocketService.emit('updateInitialValue', { name: props.broker.name, initialValue: formCapital });
    props.onChange(formCapital);
    setCapitalMode(false);
  };

  const handleDeleteBroker = (isDelete: boolean) => {
    if (!isDelete) {
      handleClose();
      return;
    }

    props.onDelete(props.broker.name);
    handleClose();
  }

  return (
    <>
      <div className="container flex justify-between p-5 border gap-2 shadow-lg">
        <div>
          <h1 className="text-lg font-bold">{props.broker.name}</h1>
          <p className="text-xs text-slate-500">{props.broker.quote}</p>
        </div>

        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style} className={'p-5'}>
            <img style={{width: '50%'}} src={require(`../../../images/Suffer.png`)} alt="success"/>
            <Typography id="modal-modal-title" variant="h6" component="h6">
              Вы уверены?
            </Typography>
            <div className="buttons flex gap-2">
              <Button variant="outlined" color={'error'} onClick={() => handleDeleteBroker(true)}>
                УES
              </Button>
              <Button variant="outlined" color={'success'} onClick={() => handleDeleteBroker(false)}>
                NO
              </Button>
            </div>
          </Box>
        </Modal>

        <div className={'flex gap-5 items-center justify-center p-1 max-sm:flex-col'}>
          {!capitalMode && <>
            <p className={'cursor-pointer text-green-600'} onClick={() => setCapitalMode(true)}>
              <AttachMoneyIcon/>
              Капитал: {props.broker.initialValue}
            </p>
          </>}
          {capitalMode && <>
            <FormControl className={'max-w-lg flex flex-col gap-2'}>
              <Select
                value={formCapital.toString()}
                onChange={handleChange}
              >
                <MenuItem value={500000}>500000</MenuItem>
                <MenuItem value={1000000}>1000000</MenuItem>
                <MenuItem value={1500000}>1500000</MenuItem>
              </Select>
              <Button onClick={handleUpdateCapital} variant="contained" endIcon={<SendIcon/>}/>
            </FormControl>
          </>}
          <Button size="small" onClick={handleOpen} color="error" variant="contained"
                  startIcon={<DeleteIcon/>}>Удалить</Button>
        </div>
      </div>
    </>
);
}

export default BrokerCard;
