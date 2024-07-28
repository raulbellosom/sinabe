import React from 'react';
import {
  FaFilePdf,
  FaFileExcel,
  FaFileCsv,
  FaFileImage,
  FaFilePowerpoint,
  FaFileWord,
  FaFile,
  FaFileVideo,
} from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import classNames from 'classnames';

const FileIcon = ({ file, className, size, onRemove }) => {
  const iconSize = size || 24;

  const getIcon = (file) => {
    if (file.type.includes('pdf')) {
      return <FaFilePdf className="text-red-500" size={iconSize} />;
    } else if (
      file.type.includes('excel') ||
      file.type.includes('spreadsheetml')
    ) {
      return <FaFileExcel className="text-green-500" size={iconSize} />;
    } else if (file.type.includes('csv')) {
      return <FaFileCsv className="text-lime-500" size={iconSize} />;
    } else if (file.type.includes('image')) {
      return <FaFileImage className="text-cyan-500" size={iconSize} />;
    } else if (file.type.includes('powerpoint')) {
      return <FaFilePowerpoint className="text-orange-500" size={iconSize} />;
    } else if (file.type.includes('word')) {
      return <FaFileWord className="text-blue-500" size={iconSize} />;
    } else if (file.type.includes('video')) {
      return <FaFileVideo className="text-indigo-500" size={iconSize} />;
    } else {
      return <FaFile className="text-stone-400" size={iconSize} />;
    }
  };

  return (
    <div
      className={classNames(
        'h-full flex items-center justify-between py-1 px-2 rounded-md transition-all cursor-pointer hover:scale-95 hover:bg-slate-300 ease-in-out duration-100',
        className,
      )}
    >
      <div className="flex items-center truncate">
        <span>{getIcon(file)}</span>
        <span className="ml-2 truncate">{file.name}</span>
      </div>
      {onRemove && (
        <span>
          <IoClose
            className="ml-2 text-red-500 cursor-pointer"
            size={iconSize}
            onClick={onRemove}
          />
        </span>
      )}
    </div>
  );
};

export default FileIcon;
