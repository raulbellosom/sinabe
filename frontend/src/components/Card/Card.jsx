import React from 'react';
import ImageViewer from '../ImageViewer/ImageViewer';
import { Badge, Card as FlowbiteCard } from 'flowbite-react';
import classNames from 'classnames';

const Card = ({ data = {}, showImage = false }) => {
  return (
    <div>
      <FlowbiteCard
        theme={{
          root: {
            base: 'border border-gray-200 rounded-md overflow-hidden',
            children: 'p-2',
          },
        }}
        className="w-full"
      >
        <div className="bg-white">
          <div className="w-full flex gap-3">
            {showImage &&
              data.image &&
              (data?.image?.value ? (
                <div className="w-24 h-24">
                  <ImageViewer
                    containerClassNames={'h-24 w-24'}
                    images={[data?.image?.value]}
                  />
                </div>
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center">
                  <p className="text-gray-500 text-sm">Sin imagen</p>
                </div>
              ))}
            <div className="flex flex-col">
              {Object.keys(data).map((key) => {
                if (key === 'title') {
                  return (
                    <h4
                      key={key}
                      className="text-sm font-semibold text-purple-500"
                    >
                      {data[key].value}
                    </h4>
                  );
                }
                if (key === 'subtitle') {
                  return (
                    <h6 key={key} className="text-xs font-medium text-gray-600">
                      {data[key].value}
                    </h6>
                  );
                }
                if (key === 'tags') {
                  return (
                    <div key={key} className="w-full flex flex-wrap gap-1 pt-2">
                      {data[key].value.map((tag, index) => {
                        if (index > 2) return null;
                        return (
                          <Badge size={'xs'} key={index} color="indigo">
                            {tag}
                          </Badge>
                        );
                      })}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 text-wrap gap-1.5 pt-2">
            {Object.keys(data).map((key) => {
              if (key === 'image') return null;
              if (key === 'actions') return null;
              if (key === 'title') return null;
              if (key === 'subtitle') return null;
              if (key === 'id') return null;
              if (key === 'tags') return null;
              return (
                <div key={key} className="mb-2">
                  <h6 className="text-sm font-semibold text-gray-600 truncate">
                    {data[key].key}
                  </h6>
                  <p
                    className={classNames(
                      'text-xs font-light text-gray-800 pt-1',
                      {
                        'rounded-md flex items-center gap-2 font-semibold justify-center p-1 w-full':
                          data[key].key === 'Estado',
                      },
                      {
                        'bg-mycad-primary text-white text-center':
                          data[key].value === 'ALTA',
                        'bg-mycad-danger text-white text-center':
                          data[key].value === 'BAJA',
                        'bg-mycad-warning text-white text-center':
                          data[key].value === 'PROPUESTA DE BAJA',
                      },
                    )}
                  >
                    {data[key].value}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="flex flex-col justify-between gap-3">
            {data?.actions && <>{data.actions.value}</>}
          </div>
        </div>
      </FlowbiteCard>
    </div>
  );
};

export default Card;
