// src/components/Projects.jsx
import { useState } from 'react';
import { FaPlus, FaUsers, FaTasks, FaChartLine } from 'react-icons/fa';

const Projects = () => {
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Complete redesign of company website with modern UI/UX',
      status: 'active',
      progress: 65,
      team: 4,
      tasks: 12,
      completedTasks: 8,
      deadline: '2024-12-20',
      color: '#6366f1'
    },
    {
      id: 2,
      name: 'Mobile App',
      description: 'Native mobile application for iOS and Android',
      status: 'active',
      progress: 40,
      team: 6,
      tasks: 18,
      completedTasks: 7,
      deadline: '2025-01-15',
      color: '#8b5cf6'
    },
    {
      id: 3,
      name: 'E-commerce Platform',
      description: 'Full-stack e-commerce solution with payment integration',
      status: 'planning',
      progress: 15,
      team: 3,
      tasks: 24,
      completedTasks: 3,
      deadline: '2025-02-28',
      color: '#ec4899'
    },
    {
      id: 4,
      name: 'CRM System',
      description: 'Customer relationship management system',
      status: 'completed',
      progress: 100,
      team: 5,
      tasks: 20,
      completedTasks: 20,
      deadline: '2024-11-30',
      color: '#10b981'
    }
  ]);

  const [view, setView] = useState('grid'); // 'grid' or 'list'

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'planning': return '#f59e0b';
      case 'completed': return '#6366f1';
      default: return '#6b7280';
    }
  };

  return (
    <div className="projects-container">
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p className="page-subtitle">Manage and track your projects</p>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={view === 'grid' ? 'active' : ''}
              onClick={() => setView('grid')}
            >
              Grid
            </button>
            <button 
              className={view === 'list' ? 'active' : ''}
              onClick={() => setView('list')}
            >
              List
            </button>
          </div>
          <button className="btn-primary">
            <FaPlus /> New Project
          </button>
        </div>
      </div>

      <div className="project-stats">
        <div className="stat-card">
          <div className="stat-icon active">
            <FaChartLine />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {projects.filter(p => p.status === 'active').length}
            </div>
            <div className="stat-label">Active Projects</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon planning">
            <FaTasks />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {projects.filter(p => p.status === 'planning').length}
            </div>
            <div className="stat-label">Planning</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed">
            <FaUsers />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {projects.filter(p => p.status === 'completed').length}
            </div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
      </div>

      <div className={`projects-${view}`}>
        {projects.map((project) => (
          <div key={project.id} className="project-card">
            <div className="project-header">
              <div 
                className="project-color-bar" 
                style={{ backgroundColor: project.color }}
              />
              <div className="project-title-section">
                <h3>{project.name}</h3>
                <span 
                  className="project-status"
                  style={{ 
                    backgroundColor: `${getStatusColor(project.status)}20`,
                    color: getStatusColor(project.status)
                  }}
                >
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </div>
            </div>

            <p className="project-description">{project.description}</p>

            <div className="project-progress">
              <div className="progress-header">
                <span>Progress</span>
                <span className="progress-value">{project.progress}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${project.progress}%`,
                    backgroundColor: project.color
                  }}
                />
              </div>
            </div>

            <div className="project-meta">
              <div className="meta-item">
                <FaUsers />
                <span>{project.team} members</span>
              </div>
              <div className="meta-item">
                <FaTasks />
                <span>{project.completedTasks}/{project.tasks} tasks</span>
              </div>
            </div>

            <div className="project-footer">
              <div className="deadline">
                Due: {new Date(project.deadline).toLocaleDateString()}
              </div>
              <button className="btn-view">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;