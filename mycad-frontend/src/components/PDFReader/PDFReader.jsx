import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ThreeCircles } from 'react-loader-spinner';
import { TbFileSad } from 'react-icons/tb';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDFReader = ({ file }) => {
  const [numPages, setNumPages] = useState(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const ErrorMessage = () => (
    <div className="text-center text-red-500 p-4 flex flex-col justify-center items-center">
      <span>
        <TbFileSad size={44} />
      </span>
      <p className="text-lg font-semibold">Error al cargar el archivo</p>
      <p className="text-sm text-neutral-500">
        El archivo podria estar corrompido o no es un PDF valido
      </p>
    </div>
  );

  return (
    <div>
      <Document
        className={'w-full scale-75 lg:scale-100'}
        loading={
          <ThreeCircles
            visible={true}
            height="100"
            width="100"
            color="#e3a008"
            ariaLabel="three-circles-loading"
          />
        }
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        error={<ErrorMessage />}
        externalLinkTarget="_blank"
      >
        {Array.from(new Array(numPages), (el, index) => (
          <Page key={`page_${index + 1}`} pageNumber={index + 1} />
        ))}
      </Document>
    </div>
  );
};

export default PDFReader;
