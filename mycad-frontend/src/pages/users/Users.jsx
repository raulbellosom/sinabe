import React, { useState } from 'react';
import useUser from '../../hooks/useUser';

const Users = () => {
  const { users, status, createUser, updateUser, deleteUser } = useUser();
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    roleId: '',
  });
  const [editMode, setEditMode] = useState(false);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'error') {
    return <div>Error loading users</div>;
  }

  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editMode) {
      updateUser(formState);
    } else {
      createUser(formState);
    }
    setFormState({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      roleId: '',
    });
    setEditMode(false);
  };

  const handleEdit = (user) => {
    setFormState(user);
    setEditMode(true);
  };

  const handleDelete = (userId) => {
    deleteUser(userId);
  };

  return (
    <div>
      <h1>Users</h1>
      <form onSubmit={handleSubmit}>
        <input
          name="firstName"
          value={formState.firstName}
          onChange={handleChange}
          placeholder="First Name"
        />
        <input
          name="lastName"
          value={formState.lastName}
          onChange={handleChange}
          placeholder="Last Name"
        />
        <input
          name="email"
          value={formState.email}
          onChange={handleChange}
          placeholder="Email"
        />
        <input
          name="password"
          value={formState.password}
          onChange={handleChange}
          placeholder="Password"
        />
        <input
          name="roleId"
          value={formState.roleId}
          onChange={handleChange}
          placeholder="Role ID"
        />
        <button type="submit">{editMode ? 'Update' : 'Create'}</button>
      </form>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.firstName} {user.lastName} - {user.email}
            <button onClick={() => handleEdit(user)}>Edit</button>
            <button onClick={() => handleDelete(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Users;
