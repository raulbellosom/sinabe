const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_USER':
      return {
        ...state,
        user: action.payload,
        loading: false,
      };
    case 'PROFILE_UPDATED':
      return {
        ...state,
        user: action.payload,
        loading: false,
      };
    case 'PROFILE_IMAGE_UPDATED':
      return {
        ...state,
        user: action.payload,
        loading: false,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        loading: false,
      };
    case 'AUTH_ERROR':
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        loading: false,
      };
    default:
      return state;
  }
};

export default authReducer;
