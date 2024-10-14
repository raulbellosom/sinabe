import React, { useEffect, useState, useMemo } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useRoleContext } from '../context/RoleContext';
import NotFound from '../pages/notFound/NotFound';

const withPermission = (WrappedComponent, requiredPermission) => {
  return (props) => {
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuthContext();
    const { rolePermissions, useGetRolePermissionByRoleId } = useRoleContext();

    useEffect(() => {
      const fetchPermissions = async () => {
        if (user && user.role) {
          try {
            await useGetRolePermissionByRoleId(user.role.id);
          } catch (error) {
            console.error('Error fetching permissions:', error);
          } finally {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      };

      fetchPermissions();
    }, []);

    const userPermissions = useMemo(() => {
      return (
        rolePermissions?.map(
          (rolePermission) => rolePermission?.permission?.name,
        ) || []
      );
    }, [rolePermissions]);

    const hasPermission = userPermissions?.includes(requiredPermission);

    if (isLoading) {
      return null;
    }

    if (!hasPermission) {
      return <NotFound />;
    }
    return <WrappedComponent {...props} />;
  };
};

export default withPermission;
