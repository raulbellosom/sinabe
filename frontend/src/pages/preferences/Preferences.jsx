import { useState } from 'react';
import { useUserPreference } from '../../context/UserPreferenceContext';
import BgPattern1 from '../../assets/bg/bg_sidebar_1.png';
import BgPattern2 from '../../assets/bg/bg_sidebar_2.png';
import BgPattern3 from '../../assets/bg/bg_sidebar_3.png';
import BgPattern4 from '../../assets/bg/bg_sidebar_4.png';
import { FileInput, Label, Card } from 'flowbite-react';
import { toast } from 'react-hot-toast';
import ThemeToggle from '../../components/settings/ThemeToggle';
import { API_URL } from '../../config/env';

const Preferences = () => {
  const { preferences, updateSidebarBg, uploadSidebarBg, loading } =
    useUserPreference();
  const [uploading, setUploading] = useState(false);

  const presets = [
    { id: 1, src: BgPattern1 },
    { id: 2, src: BgPattern2 },
    { id: 3, src: BgPattern3 },
    { id: 4, src: BgPattern4 },
  ];

  const handlePresetSelect = async (id) => {
    if (preferences?.sidebarBgId === id && !preferences?.sidebarBgUrl) return;

    try {
      await updateSidebarBg(id);
      toast.success('Fondo actualizado');
    } catch (error) {
      console.error('Error updating preference:', error);
      toast.error('Error al actualizar el fondo');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadSidebarBg(file);
      toast.success('Imagen subida y actualizada');
    } catch (error) {
      toast.error('Error al subir la imagen');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const getImageUrl = (path) => {
    if (!path) return '';
    // Remove 'uploads/' from start if present
    const relativePath = path.replace(/^uploads\//, '');
    return `${API_URL}/uploads/${relativePath}`;
  };

  return (
    <div className="p-4 bg-[color:var(--background)] text-[color:var(--foreground)]">
      <h1 className="text-2xl font-bold mb-4 border-b-2 border-neutral-100 pb-2">
        Preferencias de Usuario
      </h1>

      <Card className="border-none shadow-none">
        <h2 className="text-xl font-semibold mb-2">Tema de la aplicación</h2>
        <p className="text-sm text-[color:var(--foreground-muted)] mb-3">
          Elige entre modo claro, oscuro o automático según tu sistema.
        </p>
        <ThemeToggle className="mb-8 max-w-md" />

        <h2 className="text-xl font-semibold mb-2">Fondo del Sidebar</h2>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">
            Seleccionar Predeterminado
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`cursor-pointer border-4 rounded-lg overflow-hidden ${preferences?.sidebarBgId === preset.id && !preferences?.sidebarBgUrl ? 'border-blue-500' : 'border-transparent'}`}
                onClick={() => handlePresetSelect(preset.id)}
              >
                <img
                  src={preset.src}
                  alt={`Preset ${preset.id}`}
                  className="w-full h-32 object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">
            Subir Imagen Personalizada
          </h3>
          <div className="flex flex-col gap-4">
            <Label htmlFor="file-upload" value="Subir archivo (JPG, PNG)" />
            <FileInput
              id="file-upload"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading || loading}
            />
            {preferences?.sidebarBgUrl && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-2">Imagen actual:</p>
                <img
                  src={getImageUrl(preferences.sidebarBgUrl)}
                  alt="Custom Background"
                  className="h-32 object-cover rounded-lg border border-gray-300"
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Preferences;
