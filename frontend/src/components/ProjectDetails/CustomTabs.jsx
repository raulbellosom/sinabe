import { useState, useEffect } from 'react';
import classNames from 'classnames';

const CustomTabs = ({ tabs, initialIndex = 0, onTabChange }) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  // Sincronizar cambios desde el exterior si cambia el initialIndex
  useEffect(() => {
    setActiveIndex(initialIndex);
  }, [initialIndex]);

  const handleTabClick = (index) => {
    setActiveIndex(index);
    onTabChange?.(index); // notifica al padre si lo desea
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-2">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabClick(index)}
            className={classNames(
              'flex items-center justify-center gap-2 w-full px-4 py-2 text-xs xl:text-sm font-bold rounded-lg transition-all whitespace-nowrap text-center',
              {
                'bg-white dark:bg-sinabe-blue-dark text-sinabe-primary shadow-sm':
                  index === activeIndex,
                'text-gray-600 dark:text-gray-300 hover:text-sinabe-primary':
                  index !== activeIndex,
              },
            )}
          >
            <span className="inline-block">
              <tab.icon className="text-base" />
            </span>
            {tab.title}
          </button>
        ))}
      </div>

      <div className="w-full mt-4 overflow-x-hidden">
        {tabs.map((tab, index) => (
          <div
            key={index}
            className={classNames({
              'block w-full': index === activeIndex,
              hidden: index !== activeIndex,
            })}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomTabs;
