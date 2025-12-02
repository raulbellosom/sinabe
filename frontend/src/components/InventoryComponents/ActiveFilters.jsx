import React from 'react';
import { FaFileInvoice, FaSitemap, FaMapMarkerAlt } from 'react-icons/fa';
import { MdInventory } from 'react-icons/md';
import { BiCategory } from 'react-icons/bi';
import { GrClose } from 'react-icons/gr';

const ActiveFilters = ({
  query,
  updateQuery,
  currentInvoice,
  currentPurchaseOrder,
  verticalOptions,
}) => {
  const hasActiveFilters =
    currentInvoice ||
    currentPurchaseOrder ||
    query.locationName ||
    query.modelName?.length > 0 ||
    query.brandName?.length > 0 ||
    query.typeName?.length > 0 ||
    query.verticalId?.length > 0 ||
    query.status?.length > 0 ||
    query.conditionName?.length > 0;

  if (!hasActiveFilters) return null;

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2">
        {currentInvoice && (
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            <FaFileInvoice size={12} />
            <span>Factura: {currentInvoice.code}</span>
            <button
              onClick={() =>
                updateQuery({
                  ...query,
                  invoiceId: null,
                  invoiceCode: null,
                  page: 1,
                })
              }
              className="ml-1 hover:text-blue-900"
            >
              <GrClose size={12} />
            </button>
          </div>
        )}
        {currentPurchaseOrder && (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            <FaSitemap size={12} />
            <span>OC: {currentPurchaseOrder.code}</span>
            <button
              onClick={() =>
                updateQuery({
                  ...query,
                  purchaseOrderId: null,
                  purchaseOrderCode: null,
                  page: 1,
                })
              }
              className="ml-1 hover:text-green-900"
            >
              <GrClose size={12} />
            </button>
          </div>
        )}
        {query.locationName && (
          <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
            <FaMapMarkerAlt size={12} />
            <span>Ubicación: {decodeURIComponent(query.locationName)}</span>
            <button
              onClick={() =>
                updateQuery({
                  ...query,
                  locationName: null,
                  page: 1,
                })
              }
              className="ml-1 hover:text-purple-900"
            >
              <GrClose size={12} />
            </button>
          </div>
        )}
        {query.modelName?.map((model) => (
          <div
            key={model}
            className="flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
          >
            <MdInventory size={12} />
            <span>Modelo: {model}</span>
            <button
              onClick={() =>
                updateQuery({
                  ...query,
                  modelName: query.modelName.filter((m) => m !== model),
                  page: 1,
                })
              }
              className="ml-1 hover:text-indigo-900"
            >
              <GrClose size={12} />
            </button>
          </div>
        ))}
        {query.brandName?.map((brand) => (
          <div
            key={brand}
            className="flex items-center gap-2 px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm"
          >
            <span>Marca: {brand}</span>
            <button
              onClick={() =>
                updateQuery({
                  ...query,
                  brandName: query.brandName.filter((b) => b !== brand),
                  page: 1,
                })
              }
              className="ml-1 hover:text-pink-900"
            >
              <GrClose size={12} />
            </button>
          </div>
        ))}
        {query.typeName?.map((type) => (
          <div
            key={type}
            className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
          >
            <BiCategory size={12} />
            <span>Tipo: {type}</span>
            <button
              onClick={() =>
                updateQuery({
                  ...query,
                  typeName: query.typeName.filter((t) => t !== type),
                  page: 1,
                })
              }
              className="ml-1 hover:text-amber-900"
            >
              <GrClose size={12} />
            </button>
          </div>
        ))}
        {query.verticalId?.map((vId) => {
          const verticalName =
            verticalOptions.find((v) => v.id === vId)?.name || vId;
          return (
            <div
              key={vId}
              className="flex items-center gap-2 px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm"
            >
              <FaSitemap size={12} />
              <span>Vertical: {verticalName}</span>
              <button
                onClick={() =>
                  updateQuery({
                    ...query,
                    verticalId: query.verticalId.filter((id) => id !== vId),
                    page: 1,
                  })
                }
                className="ml-1 hover:text-cyan-900"
              >
                <GrClose size={12} />
              </button>
            </div>
          );
        })}
        {query.status?.map((status) => (
          <div
            key={status}
            className="flex items-center gap-2 px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm"
          >
            <span>Estatus: {status}</span>
            <button
              onClick={() =>
                updateQuery({
                  ...query,
                  status: query.status.filter((s) => s !== status),
                  page: 1,
                })
              }
              className="ml-1 hover:text-teal-900"
            >
              <GrClose size={12} />
            </button>
          </div>
        ))}
        {query.conditionName?.map((condition) => (
          <div
            key={condition}
            className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
          >
            <span>Condición: {condition}</span>
            <button
              onClick={() =>
                updateQuery({
                  ...query,
                  conditionName: query.conditionName.filter(
                    (c) => c !== condition,
                  ),
                  page: 1,
                })
              }
              className="ml-1 hover:text-orange-900"
            >
              <GrClose size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveFilters;
