import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const formatInventoriesToCSVString = (inventoriesObj) => {
  const inventories = Object.values(inventoriesObj);

  if (!inventories || inventories.length === 0) return '';

  const allCustomFieldNames = Array.from(
    new Set(
      inventories.flatMap((inv) =>
        (inv.customField || []).map((cf) => cf.customField?.name || ''),
      ),
    ),
  ).filter(Boolean);

  const headers = [
    'ID',
    'Estado',
    'Modelo',
    'Marca',
    'Tipo de inventario',
    'Numero de serie',
    'Numero de activo',
    'Comentarios',
    'Fecha de recepcion',
    'Fecha de alta',
    'Fecha de baja',
    'Fecha de creacion',
    'Ultima modificacion',
    'Condiciones',
    // 'Imagenes',
    ...allCustomFieldNames,
  ];

  let csv = headers.join(',') + '\n';

  for (const inv of inventories) {
    const customFieldMap = Object.fromEntries(
      allCustomFieldNames.map((name) => [name, 'NA']),
    );

    for (const field of inv.customField || []) {
      const name = field.customField?.name;
      if (name) {
        customFieldMap[name] = `"${(field.value || '-').replace(/"/g, '""')}"`;
      }
    }

    const conditionNames =
      (inv.conditions || [])
        .map((c) => c.condition?.name)
        .filter(Boolean)
        .join(' / ') || '-';

    // const imageNames =
    //   (inv.images || [])
    //     .map((img) => img.metadata?.originalname || img.url || '-')
    //     .join(' / ') || '-';

    const row = [
      inv.id,
      inv.status || 'NA',
      inv.model?.name || 'NA',
      inv.model?.brand?.name || 'NA',
      inv.model?.type?.name || 'NA',
      inv.serialNumber || '-',
      inv.activeNumber || '-',
      (inv.comments || '-').replace(/\n/g, ' ').replace(/"/g, '""'),
      inv.receptionDate || '-',
      inv.altaDate || '-',
      inv.bajaDate || '-',
      inv.createdAt || '-',
      inv.updatedAt || '-',
      conditionNames,
      // imageNames,
      ...allCustomFieldNames.map((name) => customFieldMap[name]),
    ];

    csv += row.map((v) => `"${v}"`).join(',') + '\n';
  }

  return csv;
};

/**
 * Descarga un array de archivos en un ZIP.
 * @param {Array} files - Array de archivos, cada uno debe tener url y name.
 * @param {String} [zipName] - Nombre del archivo ZIP.
 */
export const downloadFilesAsZip = async (files, zipName = 'archivos.zip') => {
  if (!files || files.length === 0) return;

  const zip = new JSZip();
  const folder = zip.folder('archivos');

  // Descarga cada archivo y lo agrega al ZIP
  await Promise.all(
    files.map(async (file) => {
      try {
        const response = await fetch(file.url);
        const blob = await response.blob();
        // Usa el nombre original si existe
        const fileName = file.metadata?.originalname || file.name || 'archivo';
        folder.file(fileName, blob);
      } catch (e) {
        // Si falla, ignora ese archivo
      }
    }),
  );

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, zipName);
};
