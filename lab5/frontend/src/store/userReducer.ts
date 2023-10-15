const initialState = {
  currentUser: null,
};

const userReducer = (state = initialState, action: { type: any; payload: any; }) => {
  switch (action.type) {
    case 'SET_USER':
      return { currentUser: action.payload };
    case 'LOGOUT':
      return { currentUser: null };
    case 'UPDATE_INITIAL_VALUE':
      const { name, initialValue } = action.payload;
      // Найти брокера в списке и обновляем его initialValue
      const updatedBrokers = state.brokers.map(broker => {
        if (broker.name === name) {
          return { ...broker, initialCapital: initialValue };
        }
        return broker;
      });
      return {
        ...state,
        brokers: updatedBrokers,
      };
    default:
      return state;
  }
};

export default userReducer;