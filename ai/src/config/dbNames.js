/**
 * Nombres físicos en MySQL (por defecto, Prisma usa estos mismos).
 * Si tus tablas/columnas tienen nombres distintos, ajústalo aquí.
 */
export const DB = {
  tables: {
    inventory: 'Inventory',
    model: 'Model',
    brand: 'InventoryBrand',
    type: 'InventoryType',
    location: 'InventoryLocation',
    invoice: 'Invoice',
    purchaseOrder: 'PurchaseOrder'
  },
  cols: {
    inventory: {
      id: 'id',
      status: 'status',
      createdById: 'createdById',
      activeNumber: 'activeNumber',
      serialNumber: 'serialNumber',
      comments: 'comments',
      modelId: 'modelId',
      enabled: 'enabled',
      receptionDate: 'receptionDate',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      details: 'details',
      altaDate: 'altaDate',
      bajaDate: 'bajaDate',
      internalFolio: 'internalFolio',
      invoiceId: 'invoiceId',
      purchaseOrderId: 'purchaseOrderId',
      locationId: 'locationId'
    },
    model: { id: 'id', name: 'name', brandId: 'brandId', typeId: 'typeId', enabled: 'enabled' },
    brand: { id: 'id', name: 'name', enabled: 'enabled' },
    type: { id: 'id', name: 'name', enabled: 'enabled' },
    location: { id: 'id', name: 'name', enabled: 'enabled' },
    invoice: { id: 'id', code: 'code', supplier: 'supplier', purchaseOrderId: 'purchaseOrderId', createdAt: 'createdAt' },
    purchaseOrder: { id: 'id', code: 'code', supplier: 'supplier', createdAt: 'createdAt' }
  },
  enums: {
    Status: ['ALTA','BAJA','PROPUESTA']
  }
};
