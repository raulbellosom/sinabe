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
    case 'FETCH_PURCHASE_ORDERS_SUCCESS':
      return {
        ...state,
        purchaseOrders: action.payload,
        loading: false,
      };
    case 'FETCH_INVOICES_SUCCESS':
      return {
        ...state,
        invoices: action.payload,
        loading: false,
      };
    case 'CREATE_PURCHASE_ORDER':
      const formattedPO = {
        id: action.payload.id,
        label: action.payload.code,
        value: action.payload.id,
        code: action.payload.code,
        supplier: action.payload.supplier,
        description: action.payload.description,
      };
      return {
        ...state,
        purchaseOrders: [...state.purchaseOrders, formattedPO],
        loading: false,
      };
    case 'CREATE_INVOICE':
      const formattedInvoice = {
        id: action.payload.id,
        label: action.payload.code,
        value: action.payload.id,
        code: action.payload.code,
        concept: action.payload.concept || '',
        supplier: action.payload.supplier,
      };
      return {
        ...state,
        invoices: [...state.invoices, formattedInvoice],
        loading: false,
      };
    case 'FETCH_LOCATIONS_SUCCESS':
      return {
        ...state,
        locations: action.payload,
        loading: false,
      };
    case 'CREATE_LOCATION':
      const formattedLocation = {
        id: action.payload.id,
        label: action.payload.name,
        value: action.payload.id,
        name: action.payload.name,
      };
      return {
        ...state,
        locations: [...state.locations, formattedLocation],
        loading: false,
      };
    default:
      return state;
  }
};

export default InventoryReducer;
