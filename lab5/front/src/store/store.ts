import { legacy_createStore as createStore, combineReducers } from 'redux';
import userReducer from './userReducer';
import brokersReducer from './brokersReducers';

const rootReducer = combineReducers({
  user: userReducer,
  brokers: brokersReducer,
});

const store = createStore(rootReducer);

export type RootState = ReturnType<typeof store.getState>;

export default store;
