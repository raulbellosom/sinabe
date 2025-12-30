import React, { useState } from 'react';
import { useUserPreference } from '../../context/UserPreferenceContext';
import BgPattern1 from '../../assets/bg/bg_sidebar_1.png';
import BgPattern2 from '../../assets/bg/bg_sidebar_2.png';
import BgPattern3 from '../../assets/bg/bg_sidebar_3.png';
import BgPattern4 from '../../assets/bg/bg_sidebar_4.png';
import { FileInput, Label, Card } from 'flowbite-react';
import { toast } from 'react-hot-toast';

const Preferences = () => {
  const { preferences, updateSidebarBg, uploadSidebarBg, loading } =
    useUserPreference();
  const [uploading, setUploading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(0);
  const COOLDOWN_MS = 5000;

  const presets = [
    { id: 1, src: BgPattern1 },
    { id: 2, src: BgPattern2 },
    { id: 3, src: BgPattern3 },
    { id: 4, src: BgPattern4 },
  ];

  const checkCooldown = () => {
    const now = Date.now();
    if (now - lastUpdate < COOLDOWN_MS) {
      const remaining = Math.ceil((COOLDOWN_MS - (now - lastUpdate)) / 1000);
      toast.error(
        `Por favor espera ${remaining} segundos antes de cambiar el fondo nuevamente.`,
      );
      return false;
    }
    return true;
  };

  const handlePresetSelect = async (id) => {
    if (preferences?.sidebarBgId === id && !preferences?.sidebarBgUrl) return;
    if (!checkCooldown()) return;

    try {
      setLastUpdate(Date.now());
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

    if (!checkCooldown()) {
      e.target.value = '';
      return;
    }

    setUploading(true);
    try {
      setLastUpdate(Date.now());
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
    const raw = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const apiUrl = raw.endsWith('/api') ? raw : `${raw}/api`;
    // Remove 'uploads/' from start if present
    const relativePath = path.replace(/^uploads\//, '');
    return `${apiUrl}/uploads/${relativePath}`;
  };

  return (
    <div className="p-4 bg-white">
      <h1 className="text-2xl font-bold mb-4 border-b-2 border-neutral-100 pb-2">
        Preferencias de Usuario
      </h1>

      <Card className="border-none shadow-none">
        <h2 className="text-xl font-semibold mb-2">Fondo del Sidebar</h2>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">
            Seleccionar Predeterminado
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className={`cursor-pointer border-4 rounded-lg overflow-hidden ${preferences?.sidebarBgId === preset.id && !preferences?.sidebarBgUrl ? 'border-blue-500' : 'border-transparent'}`}
                onClick={() => handlePresetSelect(preset.id)}
              >
                <img
                  src={preset.src}
                  alt={`Preset ${preset.id}`}
                  className="w-full h-32 object-cover"
                />
              </div>
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
