export const normalizeApiError = (error) => {
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  if (error?.response?.data?.message) {
    return {
      code: `HTTP_${error.response.status}`,
      message: error.response.data.message,
      details: error.response.data,
    };
  }

  if (error?.message) {
    return {
      code: 'CLIENT_ERROR',
      message: error.message,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'Ocurrió un error inesperado',
  };
};
