const actions = {
  CREATE: "CREATE",
  READ: "READ",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  ALL: "ALL",
};

const rolesSchema = {
  Admin: {
    users: [
      actions.CREATE,
      actions.READ,
      actions.UPDATE,
      actions.DELETE,
      actions.ALL,
    ],
    roles: [
      actions.CREATE,
      actions.READ,
      actions.UPDATE,
      actions.DELETE,
      actions.ALL,
    ],
    vehicles: [
      actions.CREATE,
      actions.READ,
      actions.UPDATE,
      actions.DELETE,
      actions.ALL,
    ],
    brands: [
      actions.CREATE,
      actions.READ,
      actions.UPDATE,
      actions.DELETE,
      actions.ALL,
    ],
    models: [
      actions.CREATE,
      actions.READ,
      actions.UPDATE,
      actions.DELETE,
      actions.ALL,
    ],
  },
  User: {
    users: [actions.READ, actions.UPDATE],
    roles: [actions.READ],
    vehicles: [actions.CREATE, actions.READ, actions.UPDATE, actions.DELETE],
    brands: [actions.CREATE, actions.READ, actions.UPDATE, actions.DELETE],
    models: [actions.CREATE, actions.READ, actions.UPDATE, actions.DELETE],
  },
  Guest: {
    users: [actions.READ],
    roles: [actions.READ],
    vehicles: [actions.READ],
    brands: [actions.READ],
    models: [actions.READ],
  },
};

export { rolesSchema };
