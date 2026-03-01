
import { QRCodeCanvas } from 'qrcode.react';
import Logo from '../../assets/logo/sinabe_icon.png';
import { Badge } from 'flowbite-react';
import {
  Info,
} from 'lucide-react';
import { APP_URL } from '../../config/env';

function QRCodeGenerator({ inventoryInfo, type, qrSize }) {
  const inventoryUrl = `${APP_URL.replace(/\/$/, '')}/inventory/${inventoryInfo.id}`;

  const formatInventory = (inventory) => {
    return JSON.stringify({
      modelo: inventory.model.name,
      marca: inventory.model.brand.name,
      tipo: inventory.model.type.name,
      SN: inventory.serialNumber,
      activo: inventory.activeNumber,
      estado: inventory.status,
      recepcion: inventory.receptionDate,
      url: `${APP_URL.replace(/\/$/, '')}/inventory/${inventory.id}`,
    });
  };

  let value;
  switch (type) {
    case 'url':
      value = inventoryUrl;
      break;
    case 'sn':
      value = inventoryInfo.serialNumber;
      break;

    case 'info':
      value = formatInventory(inventoryInfo);
      break;
    default:
      value = inventoryUrl;
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
        <Info size={20} className="inline mr-2" />
        Doble click para descargar el QR
      </Badge>
    </div>
  );
}

export default QRCodeGenerator;
