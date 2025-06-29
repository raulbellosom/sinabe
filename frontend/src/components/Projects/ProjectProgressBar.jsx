const ProjectProgressBar = ({ value }) => {
  let barColor = 'bg-sinabe-info';

  if (value > 100) {
    barColor = 'bg-red-600';
  } else if (value >= 90) {
    barColor = 'bg-yellow-400';
  }

  return (
    <div className="w-full h-3 bg-sinabe-gray rounded-full overflow-hidden">
      <div
        className={`h-full transition-all duration-500 ${barColor}`}
        style={{ width: `${Math.min(value, 100)}%` }} // opcional: no sobrepasa visualmente
      ></div>
    </div>
  );
};

export default ProjectProgressBar;
