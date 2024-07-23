import TableHeader from './TableHeader';
import TableActions from './TableActions';
import TableFooter from './TableFooter';
import { Checkbox, Table as T } from 'flowbite-react';

const Table = ({ columns, children }) => {
    return (
        <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <T hoverable>
                    <T.Head className="">
                            {columns?.map((col) => (
                                <T.HeadCell key={col?.id} scope="col" className={`p-4 ${col?.classes}`}>{col.value}</T.HeadCell>
                            ))}
                    </T.Head >
                    <T.Body>
                        {children}
                    </T.Body>
                </T>
            </div>
        </div>
    );
}

export default Table;