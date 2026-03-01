import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Box } from 'lucide-react';
import classNames from 'classnames';

const AccordionItem = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="border-b border-neutral-200 dark:border-neutral-700">
      <button
        className={classNames(
          'w-full flex justify-between items-center p-4 transition-colors duration-300',
          {
            'hover:bg-neutral-100 dark:hover:bg-neutral-700/50 bg-white dark:bg-neutral-900':
              !isOpen,
          },
          {
            'hover:bg-neutral-200 dark:hover:bg-neutral-700 bg-neutral-100 dark:bg-neutral-800':
              isOpen,
          },
        )}
        onClick={toggleAccordion}
      >
        <span className="text-sm lg:text-base font-semibold text-neutral-800 dark:text-neutral-100">
          <i>
            <Box size={22} className="mr-3 inline-block text-violet-500" />
          </i>
          {title}
        </span>
        <span className="text-neutral-500 dark:text-neutral-400">
          {isOpen ? <ChevronUp /> : <ChevronDown />}
        </span>
      </button>
      {isOpen && (
        <div className="p-4 bg-white dark:bg-neutral-900 transition-all duration-500">
          <div className="text-neutral-600 dark:text-neutral-300">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

const Accordion = ({ data = [] }) => {
  return (
    <div className="mx-auto">
      {data?.map((item, index) => (
        <AccordionItem key={index} title={item.title} content={item.content} />
      ))}
    </div>
  );
};

export default React.memo(Accordion);
