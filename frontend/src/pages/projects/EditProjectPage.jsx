import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProject, useUpdateProject } from '../../hooks/useProjects';
import ProjectForm from '../../components/Projects/ProjectForm';
import Skeleton from 'react-loading-skeleton';
import Notifies from '../../components/Notifies/Notifies';

const EditProjectPage = () => {
  const { id } = useParams();

  const { data: project, isLoading: isLoadingProject } = useProject(id);

  const { mutateAsync: updateProject } = useUpdateProject();

  const [formValues, setFormValues] = useState(null);

  // Define initialValues fuera del render condicional
  const initialValues = useMemo(() => {
    if (!project) return null;
    return {
      ...project,
      startDate: project.startDate.split('T')[0],
      endDate: project.endDate.split('T')[0],
    };
  }, [project]);

  const isChanged = useMemo(
    () =>
      formValues &&
      initialValues &&
      JSON.stringify(formValues) !== JSON.stringify(initialValues),
    [formValues, initialValues],
  );

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await updateProject({ id, data: values });
      Notifies('success', 'Proyecto actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar el proyecto', error);
      Notifies(
        'error',
        error?.response?.data?.message || 'Error al actualizar el proyecto',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoadingProject || !project || !initialValues) {
    return (
      <section className="px-4 py-6 md:px-8 max-w-3xl mx-auto">
        <Skeleton height={40} width={200} className="mb-6" />
        <Skeleton height={300} />
      </section>
    );
  }

  return (
    <section className="px-4 py-6 md:px-8 bg-white dark:bg-sinabe-blue-dark rounded-lg shadow-md w-full">
      <h2 className="text-xl font-bold text-sinabe-primary mb-6">
        Editar proyecto
      </h2>
      <ProjectForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        isEdit={true}
        isChanged={isChanged}
        setFormValues={setFormValues}
      />
    </section>
  );
};

export default EditProjectPage;
