import classNames from 'classnames';

export const getButtonClassNames = (
  color,
  filled,
  disabled = false,
  className,
) => {
  const baseClasses =
    'w-full md:w-fit h-9 xl:h-10 text-sm xl:text-base transition ease-in-out duration-200 p-2 xl:p-4 flex items-center justify-center rounded-md border text-stone-800';

  let notFilledClasses = {
    'hover:bg-purple-500 hover:text-white': color === 'mycad' && !disabled,
    'hover:bg-sinabe-danger hover:text-white': color === 'danger' && !disabled,
    'hover:bg-sinabe-warning hover:text-white':
      color === 'warning' && !disabled,
    'hover:bg-sinabe-success hover:text-white':
      color === 'success' && !disabled,
    'hover:bg-sinabe-info hover:text-white': color === 'info' && !disabled,
    'hover:bg-sinabe-dark hover:text-white': color === 'dark' && !disabled,
    'hover:bg-red-500 hover:text-white': color === 'red' && !disabled,
    'hover:bg-yellow-300 hover:text-white': color === 'yellow' && !disabled,
    'hover:bg-cyan-500 hover:text-white': color === 'cyan' && !disabled,
    'hover:bg-indigo-500 hover:text-white': color === 'indigo' && !disabled,
    'hover:bg-green-500 hover:text-white': color === 'green' && !disabled,
    'hover:bg-blue-500 hover:text-white': color === 'blue' && !disabled,
    'hover:bg-purple-500 hover:text-white': color === 'purple' && !disabled,
    'hover:bg-amber-500 hover:text-white': color === 'amber' && !disabled,
    'hover:bg-gray-500 hover:text-white': color === 'gray' && !disabled,
    'hover:bg-stone-200 hover:text-stone-800': color === 'stone' && !disabled,
    'hover:bg-purple-400 hover:text-white': color === 'purple' && !disabled,
    'hover:bg-pink-500 hover:text-white': color === 'pink' && !disabled,
    'hover:bg-teal-500 hover:text-white': color === 'teal' && !disabled,
    'hover:bg-lime-500 hover:text-white': color === 'lime' && !disabled,
    'hover:bg-emerald-500 hover:text-white': color === 'emerald' && !disabled,
    'hover:bg-violet-500 hover:text-white': color === 'violet' && !disabled,
    'hover:bg-cyan-500 hover:text-white': color === 'cyan' && !disabled,
    'hover:bg-rose-500 hover:text-white': color === 'rose' && !disabled,
    'hover:bg-fuchsia-500 hover:text-white': color === 'fuchsia' && !disabled,
    'hover:bg-white text-black': color === 'white' && !disabled,
    'hover:bg-black hover:text-white': color === 'black' && !disabled,
  };
  let filledClasses = {
    'bg-purple-500 text-white border-purple-500 hover:bg-purple-600':
      color === 'mycad',
    'bg-sinabe-danger text-white border-sinabe-danger hover:bg-mycad-rose':
      color === 'danger',
    'bg-sinabe-warning text-white border-sinabe-warning hover:bg-mycad-salmon':
      color === 'warning',
    'bg-sinabe-success text-white border-sinabe-success hover:bg-sinabe-success':
      color === 'success',
    'bg-sinabe-info text-white border-sinabe-info hover:bg-sinabe-info':
      color === 'info',
    'bg-sinabe-dark text-white border-sinabe-dark hover:bg-sinabe-dark':
      color === 'dark',
    'bg-red-500 text-white border-red-500 hover:bg-red-700': color === 'red',
    'bg-yellow-300 text-white border-yellow-300 hover:bg-yellow-400':
      color === 'yellow',
    'bg-cyan-500 text-white border-cyan-500 hover:bg-cyan-700':
      color === 'cyan',
    'bg-indigo-500 text-white border-indigo-500 hover:bg-indigo-700':
      color === 'indigo',
    'bg-green-500 text-white border-green-500 hover:bg-green-700':
      color === 'green',
    'bg-blue-500 text-white border-blue-500 hover:bg-blue-700':
      color === 'blue',
    'bg-purple-500 text-white border-purple-500 hover:bg-purple-700':
      color === 'purple',
    'bg-amber-500 text-white border-amber-500 hover:bg-amber-700':
      color === 'amber',
    'bg-gray-500 text-white border-gray-500 hover:bg-gray-700':
      color === 'gray',
    'bg-stone-200 text-stone-800 border-stone-200 hover:bg-stone-300':
      color === 'stone',
    'bg-purple-400 text-white border-purple-400 hover:bg-purple-700':
      color === 'purple',
    'bg-pink-500 text-white border-pink-500 hover:bg-pink-700':
      color === 'pink',
    'bg-teal-500 text-white border-teal-500 hover:bg-teal-700':
      color === 'teal',
    'bg-lime-500 text-white border-lime-500 hover:bg-lime-700':
      color === 'lime',
    'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-700':
      color === 'emerald',
    'bg-violet-500 text-white border-violet-500 hover:bg-violet-700':
      color === 'violet',
    'bg-cyan-500 text-white border-cyan-500 hover:bg-cyan-700':
      color === 'cyan',
    'bg-rose-500 text-white border-rose-500 hover:bg-rose-700':
      color === 'rose',
    'bg-fuchsia-500 text-white border-fuchsia-500 hover:bg-fuchsia-700':
      color === 'fuchsia',
    'bg-white text-black border-white hover:bg-white': color === 'white',
    'bg-black text-white border-black hover:border-gray-200 hover:text-black hover:bg-stone-200':
      color === 'black',
  };

  const disabledClasses = {
    'cursor-not-allowed hover:bg-white hover:text-stone-800 hover:animate-shake':
      disabled,
  };

  const colorClasses = classNames(filled ? filledClasses : notFilledClasses);

  return classNames(baseClasses, colorClasses, disabledClasses, className);
};
