const InventoryReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_INVENTORIES_SUCCESS':
      const { data, pagination } = action.payload;
      return {
        ...state,
        inventories: data,
        pagination,
        loading: false,
      };
    case 'FETCH_INVENTORY':
      return {
        ...state,
        inventory: action.payload,
        loading: false,
      };
    case 'CREATE_INVENTORY':
      return {
        ...state,
        inventory: action.payload,
        inventories: [...state.inventories, action.payload],
        loading: false,
      };
    case 'CREATE_MULTIPLE_INVENTORIES':
      return {
        ...state,
        inventories: [
          ...state.inventories,
          ...action.payload?.createdInventories,
        ],
        loading: false,
      };
    case 'UPDATE_INVENTORY':
      return {
        ...state,
        inventory: action.payload,
        inventories: state.inventories.map((inventory) =>
          inventory.id === action.payload.id ? action.payload : inventory,
        ),
        loading: false,
      };
    case 'DELETE_INVENTORY':
      return {
        ...state,
        inventories: action.payload,
        loading: false,
      };
    default:
      return state;
  }
};

export default InventoryReducer;
