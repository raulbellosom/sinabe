// src/components/Projects/ProjectSearchBar.jsx
import {
  Search,
} from 'lucide-react';


const ProjectSearchBar = ({ searchTerm, setSearchTerm }) => (
  <div className="flex items-center justify-between flex-wrap">
    <label className="text-sm font-medium block mb-1">Buscador</label>
    <div className="relative w-full">
      <Search className="absolute left-3 top-3 text-gray-400" />
      <input
        type="text"
        placeholder="Buscar proyecto..."
        className="w-full pl-10 text-sm pr-4 py-2 border border-neutral-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  </div>
);

export default ProjectSearchBar;
