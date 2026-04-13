import React, { useState, useMemo } from 'react';
import { useBrain } from '../context/GlobalDataContext';
import type { Project, ProjectStatus } from '../types';
import { Plus, MoreHorizontal, Calendar, Edit3, Trash2 } from 'lucide-react';

const statusColumns: { key: ProjectStatus; label: string; color: string }[] = [
  { key: 'ideation', label: 'Ideation', color: '#ccff00' },
  { key: 'scripting', label: 'Scripting', color: '#00d2ff' },
  { key: 'filming', label: 'Filming', color: '#ff3399' },
  { key: 'editing', label: 'Editing', color: '#ffb158' },
  { key: 'publishing', label: 'Publishing', color: '#00ff99' },
  { key: 'published', label: 'Published', color: '#ff0000' },
];

const Projects: React.FC = () => {
  const { brain, addProject, updateProject, deleteProject } = useBrain();
  const [draggedProject, setDraggedProject] = useState<Project | null>(null);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    videoTitle: '',
    description: '',
    publishDate: '',
    color: '#ccff00'
  });

  const projectsByStatus = useMemo(() => {
    const grouped: Record<ProjectStatus, Project[]> = {
      ideation: [],
      scripting: [],
      filming: [],
      editing: [],
      publishing: [],
      published: []
    };

    brain.projects?.forEach(project => {
      if (grouped[project.status]) {
        grouped[project.status].push(project);
      }
    });

    return grouped;
  }, [brain.projects]);

  const handleDragStart = (project: Project) => {
    setDraggedProject(project);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: ProjectStatus) => {
    e.preventDefault();
    if (draggedProject && draggedProject.status !== newStatus) {
      updateProject(draggedProject.id, { status: newStatus });
    }
    setDraggedProject(null);
  };

  const handleCreateProject = () => {
    if (newProject.name && newProject.videoTitle) {
      const project: Project = {
        id: Date.now().toString(),
        name: newProject.name,
        videoTitle: newProject.videoTitle,
        status: 'ideation',
        color: newProject.color,
        publishDate: newProject.publishDate,
        tasks: [],
        script: '',
        description: newProject.description,
        notes: '',
        tags: '',
        thumbnailUrl: '',
        plan: {
          topic: '',
          description: '',
          length: '',
          audience: '',
          vision: '',
          hook: ''
        },
        storyboard: []
      };

      addProject(project);
      setNewProject({ name: '', videoTitle: '', description: '', publishDate: '', color: '#ccff00' });
      setShowNewProjectForm(false);
    }
  };

  const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
    <div
      draggable
      onDragStart={() => handleDragStart(project)}
      className="pop-box p-4 mb-3 cursor-move hover:shadow-[12px_12px_0px_0px_black] transition-all"
      style={{ borderColor: project.color }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-black text-sm uppercase tracking-tight flex-1 pr-2">
          {project.name}
        </h4>
        <button className="opacity-50 hover:opacity-100">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <p className="text-xs font-bold mb-2 opacity-80">
        {project.videoTitle}
      </p>

      {project.description && (
        <p className="text-xs mb-2 opacity-60 line-clamp-2">
          {project.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>{project.publishDate || 'No date'}</span>
        </div>
        <div className="flex gap-1">
          <button className="p-1 hover:bg-black/10 rounded">
            <Edit3 size={12} />
          </button>
          <button
            className="p-1 hover:bg-red-500/20 rounded"
            onClick={() => deleteProject(project.id)}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-6xl font-[1000] uppercase tracking-[calc(-0.06em)] leading-none text-black mb-2">
          PROJECT <span className="text-[#00CCFF]">KANBAN</span>
        </h1>
        <p className="text-sm font-black uppercase tracking-[0.3em] text-black/40">
          Production Pipeline Management
        </p>
      </div>

      {/* New Project Button */}
      <div className="mb-6 flex justify-center">
        <button
          onClick={() => setShowNewProjectForm(true)}
          className="pop-button px-6 py-3 flex items-center gap-2"
        >
          <Plus size={20} />
          <span className="font-black">NEW PROJECT</span>
        </button>
      </div>

      {/* New Project Form */}
      {showNewProjectForm && (
        <div className="pop-box p-6 mb-6 max-w-md mx-auto">
          <h3 className="font-black text-lg mb-4 uppercase">Create New Project</h3>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Project Name"
              value={newProject.name}
              onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
              className="pop-input w-full"
            />

            <input
              type="text"
              placeholder="Video Title"
              value={newProject.videoTitle}
              onChange={(e) => setNewProject(prev => ({ ...prev, videoTitle: e.target.value }))}
              className="pop-input w-full"
            />

            <textarea
              placeholder="Description (optional)"
              value={newProject.description}
              onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
              className="pop-input w-full h-20 resize-none"
            />

            <input
              type="date"
              value={newProject.publishDate}
              onChange={(e) => setNewProject(prev => ({ ...prev, publishDate: e.target.value }))}
              className="pop-input w-full"
            />

            <div className="flex gap-2">
              <button
                onClick={handleCreateProject}
                className="pop-button flex-1"
                disabled={!newProject.name || !newProject.videoTitle}
              >
                CREATE
              </button>
              <button
                onClick={() => setShowNewProjectForm(false)}
                className="pop-button flex-1 bg-gray-500"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statusColumns.map(column => (
          <div
            key={column.key}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.key)}
            className="min-h-[400px]"
          >
            <div className="pop-box p-4 mb-4" style={{ borderColor: column.color }}>
              <h3
                className="font-black text-sm uppercase tracking-tight text-center"
                style={{ color: column.color }}
              >
                {column.label}
              </h3>
              <div className="text-xs font-bold text-center mt-1 opacity-60">
                {projectsByStatus[column.key].length} projects
              </div>
            </div>

            <div className="space-y-3">
              {projectsByStatus[column.key].map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}

              {projectsByStatus[column.key].length === 0 && (
                <div className="text-center py-8 text-black/20">
                  <div className="text-4xl mb-2">📋</div>
                  <div className="text-xs font-black uppercase">No projects</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;