import { useNavigate } from 'react-router-dom';
import { useCreateProject } from '../../hooks/useProjects';
import ProjectForm from '../../components/Projects/ProjectForm';
import Notifies from '../../components/Notifies/Notifies';

const initialValues = {
  name: '',
  provider: '',
  budgetTotal: 0,
  startDate: '',
  endDate: '',
  description: '',
};

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const { mutateAsync: createProject } = useCreateProject();

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await createProject(values);
      resetForm();
      Notifies('success', 'Proyecto creado correctamente');
      navigate('/projects');
    } catch (error) {
      console.error('Error al crear el proyecto', error);
      Notifies(
        'error',
        error?.response?.data?.message || 'Error al crear el proyecto',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="px-4 py-6 md:px-8 bg-white dark:bg-sinabe-blue-dark rounded-lg shadow-md w-full">
      <h2 className="text-xl font-bold text-sinabe-primary mb-6">
        Crear nuevo proyecto
      </h2>

      <ProjectForm initialValues={initialValues} onSubmit={handleSubmit} />
    </section>
  );
};

export default CreateProjectPage;
