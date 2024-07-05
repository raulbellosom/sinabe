import React from 'react';

const AccountSidebar = ({ name, email, photo }) => {
  return (
    <div className="flex flex-col items-center">
      <img
        src={photo || 'https://via.placeholder.com/150'}
        alt="User Photo"
        className="w-20 h-20 rounded-full mb-4"
      />
      <h2 className="text-xl font-bold mb-1">{name}</h2>
      <p className="text-gray-500">{email}</p>
    </div>
  );
};

export default AccountSidebar;
