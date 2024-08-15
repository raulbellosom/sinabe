const CatalogReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_VEHICLE_TYPES':
      return {
        ...state,
        vehicleTypes: action.payload,
        loading: false,
      };
    case 'FETCH_VEHICLE_TYPE':
      return {
        ...state,
        vehicleType: action.payload,
        loading: false,
      };
    case 'CREATE_VEHICLE_TYPE':
      return {
        ...state,
        vehicleType: action.payload,
        vehicleTypes: [...state.vehicleTypes, action.payload],
        loading: false,
      };
    case 'UPDATE_VEHICLE_TYPE':
      return {
        ...state,
        vehicleType: action.payload,
        vehicleTypes: state.vehicleTypes.map((vehicleType) =>
          vehicleType.id === action.payload.id ? action.payload : vehicleType,
        ),
        loading: false,
      };
    case 'DELETE_VEHICLE_TYPE':
      return {
        ...state,
        vehicleTypes: action.payload,
        loading: false,
      };
    case 'FETCH_VEHICLE_BRANDS':
      return {
        ...state,
        vehicleBrands: action.payload,
        loading: false,
      };
    case 'FETCH_VEHICLE_BRAND':
      return {
        ...state,
        vehicleBrand: action.payload,
        loading: false,
      };
    case 'CREATE_VEHICLE_BRAND':
      return {
        ...state,
        vehicleBrand: action.payload,
        vehicleBrands: [...state.vehicleBrands, action.payload],
        loading: false,
      };
    case 'UPDATE_VEHICLE_BRAND':
      return {
        ...state,
        vehicleBrand: action.payload,
        vehicleBrands: state.vehicleBrands.map((vehicleBrand) =>
          vehicleBrand.id === action.payload.id ? action.payload : vehicleBrand,
        ),
        loading: false,
      };
    case 'DELETE_VEHICLE_BRAND':
      return {
        ...state,
        vehicleBrands: action.payload,
        loading: false,
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
        loading: false,
      };
    case 'CREATE_VEHICLE_MODEL':
      return {
        ...state,
        vehicleModel: action.payload,
        vehicleModels: [...state.vehicleModels, action.payload],
        loading: false,
      };
    case 'UPDATE_VEHICLE_MODEL':
      return {
        ...state,
        vehicleModel: action.payload,
        vehicleModels: state.vehicleModels.map((vehicleModel) =>
          vehicleModel.id === action.payload.id ? action.payload : vehicleModel,
        ),
        loading: false,
      };
    case 'DELETE_VEHICLE_MODEL':
      return {
        ...state,
        vehicleModels: action.payload,
        loading: false,
      };
    case 'FETCH_VEHICLE_CONDITIONS':
      return {
        ...state,
        vehicleConditions: action.payload,
        loading: false,
      };
    case 'FETCH_VEHICLE_CONDITION':
      return {
        ...state,
        vehicleCondition: action.payload,
        loading: false,
      };
    case 'CREATE_VEHICLE_CONDITION':
      return {
        ...state,
        vehicleCondition: action.payload,
        vehicleConditions: [...state.vehicleConditions, action.payload],
        loading: false,
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
        loading: false,
      };
    case 'DELETE_VEHICLE_CONDITION':
      return {
        ...state,
        vehicleConditions: action.payload,
        loading: false,
      };
    default:
      return state;
  }
};

export default CatalogReducer;
