const customFieldReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CUSTOM_FIELDS':
      return { ...state, customFields: action.payload };
    case 'CREATE_CUSTOM_FIELD':
      return {
        ...state,
        customFields: [...state.customFields, action.payload],
      };
    case 'UPDATE_CUSTOM_FIELD':
      return {
        ...state,
        customFields: state.customFields.map((field) =>
          field.id === action.payload.id ? action.payload : field,
        ),
      };
    case 'DELETE_CUSTOM_FIELD':
      return {
        ...state,
        customFields: state.customFields.filter(
          (field) => field.id !== action.payload.id,
        ),
      };
    case 'ADD_CUSTOM_FIELD_VALUE':
      return {
        ...state,
        customFieldValues: [...state.customFieldValues, action.payload],
      };
    default:
      return state;
  }
};

export default customFieldReducer;
