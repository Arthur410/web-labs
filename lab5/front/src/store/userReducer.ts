import { IBroker } from '../interfaces/IBroker';

const initialState: { currentUser: IBroker | null } = {
  currentUser: null,
};

const userReducer = (state = initialState, action: { type: string; payload?: IBroker; }) => {
  switch (action.type) {
    case 'SET_USER':
      return { currentUser: action.payload ?? null };
    case 'LOGOUT':
      return { currentUser: null };
    default:
      return state;
  }
};

export default userReducer;
