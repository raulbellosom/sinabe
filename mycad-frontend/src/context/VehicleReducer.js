const VehicleReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_VEHICLES_SUCCESS':
      return {
        ...state,
        vehicles: action.payload,
        loading: false,
      };
    case 'FETCH_VEHICLES_ERROR':
      return {
        ...state,
        vehicles: [],
        loading: false,
      };
    default:
      return state;
  }
};

export default VehicleReducer;
