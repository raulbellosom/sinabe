import AuthContext from '../context/AuthContext';
import NotFound from '../pages/notFound/NotFound';

const withPermission = (WrappedComponent, requiredPermission) => {
  const PermissionWrapper = (props) => (
    <AuthContext.Consumer>
      {({ user, loading }) => {
        const userPermissions = user?.authPermissions || [];
        const hasPermission =
          typeof requiredPermission === 'string'
            ? userPermissions.includes(requiredPermission)
            : Array.isArray(requiredPermission)
              ? requiredPermission.some((permission) =>
                  userPermissions.includes(permission),
                )
              : false;

        if (loading) {
          return null;
        }

        if (!hasPermission) {
          return <NotFound />;
        }

        return <WrappedComponent {...props} />;
      }}
    </AuthContext.Consumer>
  );

  PermissionWrapper.displayName = `WithPermission(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return PermissionWrapper;
};

export default withPermission;
