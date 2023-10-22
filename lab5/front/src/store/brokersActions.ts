import {IBroker} from "../interfaces/IBroker";

export const updateCapital = (broker: IBroker) => ({
  type: 'UPDATE_CAPITAL',
  payload: broker,
});