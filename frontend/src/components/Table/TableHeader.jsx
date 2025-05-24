import { Dropdown } from 'flowbite-react';
import ActionButtons from '../ActionButtons/ActionButtons';
import { BsThreeDotsVertical } from 'react-icons/bs';

const TableHeader = ({ title, icon: Icon, actions, collapsedActions }) => {
  return (
    <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between text-start bg-white gap-4">
      <div className="flex items-center gap-2 text-purple-500 w-full">
        {Icon && <Icon size={24} className="inline-block" />}
        <h1 className="text-xl xl:text-2xl font-bold">{title}</h1>
      </div>
      <div className="w-full flex gap-2 justify-end">
        <ActionButtons extraActions={actions} />
        {collapsedActions && (
          <Dropdown
            renderTrigger={() => (
              <button className="w-fit bg-white hover:bg-neutral-200 md:w-fit h-9 xl:h-10 text-sm xl:text-base cursor-pointer transition ease-in-out duration-200 p-4 flex items-center justify-center rounded-md border text-stone-800">
                <BsThreeDotsVertical className="text-lg text-neutral-600" />
              </button>
            )}
            dismissOnClick={true}
            inline
            arrowIcon={null}
            placement="bottom-start"
            className="md:w-52"
          >
            {collapsedActions?.map(
              (action, index) =>
                action && (
                  <Dropdown.Item
                    key={index}
                    className="min-w-36 min-h-12"
                    onClick={() => action?.action()}
                    icon={action?.icon}
                  >
                    <span>{action?.label}</span>
                  </Dropdown.Item>
                ),
            )}
          </Dropdown>
        )}
      </div>
    </div>
  );
};

export default TableHeader;
