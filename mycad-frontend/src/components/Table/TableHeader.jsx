const TableHeader = ({ title }) => {
  return (
    <div className="flex text-center md:text-start flex-col-reverse md:flex-row md:items-center md:justify-between">
      <h1 className="text-xl font-bold text-orange-500 w-full">{title}</h1>
    </div>
  );
};

export default TableHeader;
