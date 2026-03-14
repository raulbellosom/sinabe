import { QRCodeCanvas } from 'qrcode.react';
import { Badge } from '../ui/flowbite';
import { Info } from 'lucide-react';
import {
  QR_CONTENT_PRESETS,
  buildQRValue,
  getInventoryPublicUrl,
  getQRCodeCanvasProps,
} from '../../utils/qrCodeUtils';

function QRCodeGenerator({ inventoryInfo, type, qrSize }) {
  const inventoryUrl = getInventoryPublicUrl(inventoryInfo.id);

  let value;
  switch (type) {
    case 'url':
      value = inventoryUrl;
      break;
    case 'sn':
      value = inventoryInfo.serialNumber;
      break;

    case 'info':
      value = buildQRValue(inventoryInfo, {
        preset: QR_CONTENT_PRESETS.full.key,
      });
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
        {...getQRCodeCanvasProps(size, inventoryInfo.model.name)}
      />
      <Badge className="mt-4" color="purple">
        <Info size={20} className="inline mr-2" />
        Doble click para descargar el QR
      </Badge>
    </div>
  );
}

export default QRCodeGenerator;
