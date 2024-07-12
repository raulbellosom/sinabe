import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import AuthContext from '../../context/AuthContext';
import MyCADLogo from '../../assets/logo/mycad_icon.png';
import BgPattern from '../../assets/bg/pattern-randomized.png';
import { Button } from 'flowbite-react';
import { FaSignInAlt } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Ingrese un correo electrónico válido'),
      password: Yup.string().required('La contraseña es invalida'),
    }),
    onSubmit: async (values) => {
      await login(values);
      navigate('/dashboard');
    },
  });

  return (
    <div
      className="h-dvh max-h-dvh overflow-hidden w-full flex items-center justify-center bg-gray-100 bg"
      style={{ backgroundImage: `url(${BgPattern})` }}
    >
      <div className="bg-white/70 p-8 m-4 rounded shadow-lg w-full max-w-md">
        <div className="flex flex-col items-center justify-center">
          <img src={MyCADLogo} alt="MyCAD Logo" className="h-16 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">MyCAD</h1>
        </div>
        <h2 className="text-2xl mb-6">Iniciar Sesión</h2>
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-4">
            <label
              onClick={() => {
                formik.setFieldValue('email', 'raul.belloso.m@gmail.com');
                formik.setFieldValue('password', 'Nigga0599.');
              }}
              htmlFor="email"
              className="block text-gray-700"
            >
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              className="w-full p-2 border rounded mt-1"
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="text-red-500 text-sm">{formik.errors.email}</div>
            ) : null}
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              className="w-full p-2 border rounded mt-1"
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="text-red-500 text-sm">
                {formik.errors.password}
              </div>
            ) : null}
          </div>
          <Button type="submit" className="w-full mt-4" color="purple">
            Iniciar Sesión
            <FaSignInAlt size={20} className="ml-2" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
