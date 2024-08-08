const VehicleReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_VEHICLES_SUCCESS':
      const { data, pagination } = action.payload
      return {
        ...state,
        vehicles: data,
        pagination,
        loading: false,
      };
    case 'FETCH_VEHICLE':
      return {
        ...state,
        vehicle: action.payload,
        loading: false,
      };
    case 'CREATE_VEHICLE':
      return {
        ...state,
        vehicle: action.payload,
        vehicles: [...state.vehicles, action.payload],
      };
    case 'UPDATE_VEHICLE':
      return {
        ...state,
        vehicle: action.payload,
        vehicles: state.vehicles.map((vehicle) =>
          vehicle.id === action.payload.id ? action.payload : vehicle,
        ),
      };
    case 'DELETE_VEHICLE':
      return {
        ...state,
        vehicles: action.payload,
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
    case 'CREATE_VEHICLE_TYPE':
      return {
        ...state,
        vehicleType: action.payload,
        vehicleTypes: [...state.vehicleTypes, action.payload],
      };
    case 'UPDATE_VEHICLE_TYPE':
      return {
        ...state,
        vehicleType: action.payload,
        vehicleTypes: state.vehicleTypes.map((vehicleType) =>
          vehicleType.id === action.payload.id ? action.payload : vehicleType,
        ),
      };
    case 'DELETE_VEHICLE_TYPE':
      return {
        ...state,
        vehicleTypes: action.payload,
      };
    case 'FETCH_VEHICLE_BRANDS':
      return {
        ...state,
        vehicleBrands: action.payload,
      };
    case 'FETCH_VEHICLE_BRAND':
      return {
        ...state,
        vehicleBrand: action.payload,
      };
    case 'CREATE_VEHICLE_BRAND':
      return {
        ...state,
        vehicleBrand: action.payload,
        vehicleBrands: [...state.vehicleBrands, action.payload],
      };
    case 'UPDATE_VEHICLE_BRAND':
      return {
        ...state,
        vehicleBrand: action.payload,
        vehicleBrands: state.vehicleBrands.map((vehicleBrand) =>
          vehicleBrand.id === action.payload.id ? action.payload : vehicleBrand,
        ),
      };
    case 'DELETE_VEHICLE_BRAND':
      return {
        ...state,
        vehicleBrands: action.payload,
      };
    case 'FETCH_VEHICLE_MODELS':
      return {
        ...state,
        vehicleModels: action.payload,
        loading: false,
      };
    case 'FETCH_VEHICLE_MODEL':
      return {
        ...state,
        vehicleModel: action.payload,
      };
    case 'CREATE_VEHICLE_MODEL':
      return {
        ...state,
        vehicleModel: action.payload,
        vehicleModels: [...state.vehicleModels, action.payload],
      };
    case 'UPDATE_VEHICLE_MODEL':
      return {
        ...state,
        vehicleModel: action.payload,
        vehicleModels: state.vehicleModels.map((vehicleModel) =>
          vehicleModel.id === action.payload.id ? action.payload : vehicleModel,
        ),
      };
    case 'DELETE_VEHICLE_MODEL':
      return {
        ...state,
        vehicleModels: action.payload,
      };
    case 'FETCH_VEHICLE_CONDITIONS':
      return {
        ...state,
        vehicleConditions: action.payload,
      };
    case 'FETCH_VEHICLE_CONDITION':
      return {
        ...state,
        vehicleCondition: action.payload,
      };
    case 'CREATE_VEHICLE_CONDITION':
      return {
        ...state,
        vehicleCondition: action.payload,
        vehicleConditions: [...state.vehicleConditions, action.payload],
      };
    case 'UPDATE_VEHICLE_CONDITION':
      return {
        ...state,
        vehicleCondition: action.payload,
        vehicleConditions: state.vehicleConditions.map((vehicleCondition) =>
          vehicleCondition.id === action.payload.id
            ? action.payload
            : vehicleCondition,
        ),
      };
    case 'DELETE_VEHICLE_CONDITION':
      return {
        ...state,
        vehicleConditions: action.payload,
      };
    default:
      return state;
  }
};

export default VehicleReducer;
