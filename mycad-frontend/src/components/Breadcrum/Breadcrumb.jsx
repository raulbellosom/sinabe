import React from 'react';
import { Breadcrumb } from 'flowbite-react';
import { HiHome } from 'react-icons/hi';

const Breadcrumbs = ({ breadcrumbs = [] }) => {
  return (
    <Breadcrumb>
      <Breadcrumb.Item href="/" icon={HiHome}>
        Home
      </Breadcrumb.Item>
      {breadcrumbs?.map((route, index) => (
        <Breadcrumb.Item key={index} href={route?.href}>
          {route.icon && <route.icon className="mr-2" />}
          {route.label}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
};

export default Breadcrumbs;
