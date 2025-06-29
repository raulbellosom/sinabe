const ProjectProgressBar = ({ value }) => {
  let barColor = 'bg-sinabe-info';

  if (value > 100) {
    barColor = 'bg-red-600';
  } else if (value >= 95) {
    barColor = 'bg-orange-500';
  } else if (value >= 85) {
    barColor = 'bg-yellow-500';
  } else if (value >= 50) {
    barColor = 'bg-green-500';
  } else if (value >= 25) {
    barColor = 'bg-blue-500';
  } else if (value >= 10) {
    barColor = 'bg-cyan-500';
  } else {
    barColor = 'bg-gray-400';
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
