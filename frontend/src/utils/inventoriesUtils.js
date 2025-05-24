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
    'Imagenes',
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
