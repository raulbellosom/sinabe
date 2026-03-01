export const queryKeys = {
  auth: {
    me: ['auth', 'me'],
  },
  inventories: {
    all: ['inventories'],
    list: (params = {}) => ['inventories', 'list', params],
    detail: (id) => ['inventories', 'detail', id],
  },
  catalogs: {
    all: ['catalogs'],
    types: ['catalogs', 'types'],
    brands: ['catalogs', 'brands'],
    models: ['catalogs', 'models'],
    conditions: ['catalogs', 'conditions'],
    locations: ['catalogs', 'locations'],
    customFields: ['catalogs', 'custom-fields'],
  },
  custody: {
    all: ['custody'],
    list: (params = {}) => ['custody', 'list', params],
    detail: (id) => ['custody', 'detail', id],
  },
  notifications: {
    all: ['notifications'],
    list: (params = {}) => ['notifications', 'list', params],
    rules: ['notifications', 'rules'],
  },
  users: {
    all: ['users'],
    list: (params = {}) => ['users', 'list', params],
  },
  preferences: {
    all: ['preferences'],
    me: ['preferences', 'me'],
  },
};

export default queryKeys;
