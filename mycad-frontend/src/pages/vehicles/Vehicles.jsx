import React, { useContext, useState } from 'react';
import useVehicle from '../../hooks/useVehicle';
import VehicleContext, { useVehicleContext } from '../../context/VehicleContext';

const Vehicles = () => {
  
  const { vehicles } = useVehicleContext()
  const [formState, setFormState] = useState({ make: '', model: '', year: '' });
  const [editMode, setEditMode] = useState(false);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'error') {
    return <div>Error loading vehicles</div>;
  }

  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editMode) {
      updateVehicle(formState);
    } else {
      createVehicle(formState);
    }
    setFormState({ make: '', model: '', year: '' });
    setEditMode(false);
  };

  const handleEdit = (vehicle) => {
    setFormState(vehicle);
    setEditMode(true);
  };

  const handleDelete = (vehicleId) => {
    deleteVehicle(vehicleId);
  };

  return (
    <div>
      <h1>Vehicles</h1>
      <form onSubmit={handleSubmit}>
        <input
          name="make"
          value={formState.make}
          onChange={handleChange}
          placeholder="Make"
        />
        <input
          name="model"
          value={formState.model}
          onChange={handleChange}
          placeholder="Model"
        />
        <input
          name="year"
          value={formState.year}
          onChange={handleChange}
          placeholder="Year"
        />
        <button type="submit">{editMode ? 'Update' : 'Create'}</button>
      </form>
      <ul>
        {vehicles?.map((vehicle) => (
          <li key={vehicle.id}>
            {vehicle.make} {vehicle.model} - {vehicle.year}
            <button onClick={() => handleEdit(vehicle)}>Edit</button>
            <button onClick={() => handleDelete(vehicle.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Vehicles;
