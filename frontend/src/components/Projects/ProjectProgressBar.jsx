const ProjectProgressBar = ({ value }) => {
  return (
    <div className="w-full h-3 bg-sinabe-gray rounded-full overflow-hidden">
      <div
        className="h-full bg-sinabe-info transition-all duration-500"
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
};

export default ProjectProgressBar;
