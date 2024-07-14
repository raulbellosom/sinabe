import React, { useContext, useState } from 'react';
import useVehicle from '../../hooks/useVehicle';
import VehicleContext, {
  useVehicleContext,
} from '../../context/VehicleContext';
import { Link } from 'react-router-dom';

const Vehicles = () => {
  const { vehicles } = useVehicleContext();
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
      <div className="flex justify-between items-center">
        <h1>Vehicles</h1>
        <Link
          to={'/vehicles/create'}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        >
          Crear vehiculo
        </Link>
      </div>
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
          <li className="flex gap-4" key={vehicle.id}>
            {vehicle?.model?.type?.name +
              ' ' +
              vehicle?.model?.brand?.name +
              ' ' +
              ' ' +
              vehicle.model?.name}
            <Link to={`/vehicles/view/${vehicle.id}`}>View</Link>
            <Link to={`/vehicles/edit/${vehicle.id}`}>Edit</Link>
            <button onClick={() => handleDelete(vehicle.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Vehicles;
