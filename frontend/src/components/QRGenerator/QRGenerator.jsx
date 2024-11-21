import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import Logo from '../../assets/logo/sinabe_icon.png';
import { Badge } from 'flowbite-react';
import { MdInfo } from 'react-icons/md';

function QRCodeGenerator({ inventoryInfo, type, qrSize }) {
  const formatInventory = (inventory) => {
    return JSON.stringify({
      modelo: inventory.model.name,
      marca: inventory.model.brand.name,
      tipo: inventory.model.type.name,
      SN: inventory.serialNumber,
      activo: inventory.activeNumber,
      estado: inventory.status,
      recepcion: inventory.receptionDate,
      url: `https://sinabe.sytes.net/inventory/${inventory.id}`,
    });
  };

  let value;
  switch (type) {
    case 'url':
      value = `https://sinabe.sytes.net/inventory/${inventoryInfo.id}`;
      break;
    case 'sn':
      value = inventoryInfo.serialNumber;
      break;

    case 'info':
      value = formatInventory(inventoryInfo);
      break;
    default:
      value = `https://sinabe.sytes.net/inventory/${inventoryInfo.id}`;
      break;
  }

  let size;
  switch (qrSize) {
    case 'xs':
      size = 64;
      break;
    case 'sm':
      size = 128;
      break;
    case 'md':
      size = 256;
      break;
    case 'lg':
      size = 512;
      break;
    default:
      size = 256;
      break;
  }

  const handleDownload = () => {
    const canvas = document.querySelector('canvas');
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    let downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `${inventoryInfo.id}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div
      onDoubleClick={handleDownload}
      className="flex flex-col justify-center items-center"
      id="qr-code-container"
    >
      <QRCodeCanvas
        value={value}
        size={size}
        bgColor="#ffffff"
        fgColor="#7e3af2"
        title={inventoryInfo.model.name}
        imageSettings={{
          src: Logo,
          height: 48,
          width: 48,
          excavate: true,
        }}
      />
      <Badge className="mt-4" color="purple">
        <MdInfo size={20} className="inline mr-2" />
        Doble click para descargar el QR
      </Badge>
    </div>
  );
}

export default QRCodeGenerator;
