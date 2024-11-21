const CatalogReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_INVENTORY_TYPES':
      return {
        ...state,
        inventoryTypes: action.payload,
        loading: false,
      };
    case 'FETCH_INVENTORY_TYPE':
      return {
        ...state,
        inventoryType: action.payload,
        loading: false,
      };
    case 'CREATE_INVENTORY_TYPE':
      return {
        ...state,
        inventoryType: action.payload,
        inventoryTypes: [...state.inventoryTypes, action.payload],
        loading: false,
      };
    case 'UPDATE_INVENTORY_TYPE':
      return {
        ...state,
        inventoryType: action.payload,
        inventoryTypes: state.inventoryTypes.map((inventoryType) =>
          inventoryType.id === action.payload.id
            ? action.payload
            : inventoryType,
        ),
        loading: false,
      };
    case 'DELETE_INVENTORY_TYPE':
      return {
        ...state,
        inventoryTypes: action.payload,
        loading: false,
      };
    case 'FETCH_INVENTORY_BRANDS':
      return {
        ...state,
        inventoryBrands: action.payload,
        loading: false,
      };
    case 'FETCH_INVENTORY_BRAND':
      return {
        ...state,
        inventoryBrand: action.payload,
        loading: false,
      };
    case 'CREATE_INVENTORY_BRAND':
      return {
        ...state,
        inventoryBrand: action.payload,
        inventoryBrands: [...state.inventoryBrands, action.payload],
        loading: false,
      };
    case 'UPDATE_INVENTORY_BRAND':
      return {
        ...state,
        inventoryBrand: action.payload,
        inventoryBrands: state.inventoryBrands.map((inventoryBrand) =>
          inventoryBrand.id === action.payload.id
            ? action.payload
            : inventoryBrand,
        ),
        loading: false,
      };
    case 'DELETE_INVENTORY_BRAND':
      return {
        ...state,
        inventoryBrands: action.payload,
        loading: false,
      };
    case 'FETCH_INVENTORY_MODELS':
      return {
        ...state,
        inventoryModels: action.payload,
        loading: false,
      };
    case 'FETCH_INVENTORY_MODEL':
      return {
        ...state,
        inventoryModel: action.payload,
        loading: false,
      };
    case 'CREATE_INVENTORY_MODEL':
      return {
        ...state,
        inventoryModel: action.payload,
        inventoryModels: [...state.inventoryModels, action.payload],
        loading: false,
      };
    case 'UPDATE_INVENTORY_MODEL':
      return {
        ...state,
        inventoryModel: action.payload,
        inventoryModels: state?.inventoryModels?.map((inventoryModel) =>
          inventoryModel.id === action.payload.id
            ? action.payload
            : inventoryModel,
        ),
        loading: false,
      };
    case 'DELETE_INVENTORY_MODEL':
      return {
        ...state,
        inventoryModels: action.payload,
        loading: false,
      };
    case 'CREATE_MULTIPLE_MODELS':
      return {
        ...state,
        inventoryModels: [
          ...state.inventoryModels,
          ...action.payload?.createdModels,
        ],
        inventoryBrands: action.payload?.brands,
        inventoryTypes: action.payload?.types,
        loading: false,
      };
    case 'FETCH_INVENTORY_CONDITIONS':
      return {
        ...state,
        inventoryConditions: action.payload,
        loading: false,
      };
    case 'FETCH_INVENTORY_CONDITION':
      return {
        ...state,
        inventoryCondition: action.payload,
        loading: false,
      };
    case 'CREATE_INVENTORY_CONDITION':
      return {
        ...state,
        inventoryCondition: action.payload,
        inventoryConditions: [...state.inventoryConditions, action.payload],
        loading: false,
      };
    case 'UPDATE_INVENTORY_CONDITION':
      return {
        ...state,
        inventoryCondition: action.payload,
        inventoryConditions: state.inventoryConditions.map(
          (inventoryCondition) =>
            inventoryCondition.id === action.payload.id
              ? action.payload
              : inventoryCondition,
        ),
        loading: false,
      };
    case 'DELETE_INVENTORY_CONDITION':
      return {
        ...state,
        inventoryConditions: action.payload,
        loading: false,
      };
    default:
      return state;
  }
};

export default CatalogReducer;
