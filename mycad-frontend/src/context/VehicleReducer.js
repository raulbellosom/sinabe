const VehicleReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_VEHICLES_SUCCESS':
      return {
        ...state,
        vehicles: action.payload,
        loading: false,
      };
    case 'CREATE_VEHICLE':
      return {
        ...state,
        vehicles: [...state.vehicles, action.payload],
      };
    case 'UPDATE_VEHICLE':
      return {
        ...state,
        vehicles: state.vehicles.map((vehicle) =>
          vehicle.id === action.payload.id ? action.payload : vehicle,
        ),
      };
    case 'DELETE_VEHICLE':
      return {
        ...state,
        vehicles: state.vehicles.filter(
          (vehicle) => vehicle.id !== action.payload.id,
        ),
      };
    case 'FETCH_VEHICLE_TYPES':
      return {
        ...state,
        vehicleTypes: action.payload,
      };
    case 'FETCH_VEHICLE_TYPE':
      return {
        ...state,
        vehicleType: action.payload,
      };
    default:
      return state;
  }
};

export default VehicleReducer;
