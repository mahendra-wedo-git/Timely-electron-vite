// src/components/WorkLog.jsx
import { useState } from 'react';
import { FaPlus, FaClock, FaCalendar, FaEdit, FaTrash } from 'react-icons/fa';

const WorkLog = () => {
  const [logs, setLogs] = useState([
    {
      id: 1,
      task: 'Design new UI components',
      project: 'Website Redesign',
      hours: 4.5,
      date: '2024-12-06',
      status: 'completed'
    },
    {
      id: 2,
      task: 'Fix authentication bug',
      project: 'Mobile App',
      hours: 2,
      date: '2024-12-06',
      status: 'in-progress'
    },
    {
      id: 3,
      task: 'Client meeting and review',
      project: 'E-commerce Platform',
      hours: 1.5,
      date: '2024-12-05',
      status: 'completed'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newLog, setNewLog] = useState({
    task: '',
    project: '',
    hours: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddLog = () => {
    if (newLog.task && newLog.project && newLog.hours) {
      setLogs([
        ...logs,
        {
          id: Date.now(),
          ...newLog,
          hours: parseFloat(newLog.hours),
          status: 'completed'
        }
      ]);
      setNewLog({
        task: '',
        project: '',
        hours: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddForm(false);
    }
  };

  const handleDeleteLog = (id:any) => {
    setLogs(logs.filter(log => log.id !== id));
  };

  const totalHours = logs.reduce((sum, log) => sum + log.hours, 0);

  return (
    <div className="worklog-container">
      <div className="page-header">
        <div>
          <h1>Work Log</h1>
          <p className="page-subtitle">Track your daily work activities</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          <FaPlus /> Add New Log
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon clock">
            <FaClock />
          </div>
          <div className="stat-content">
            <div className="stat-value">{totalHours}h</div>
            <div className="stat-label">Total Hours</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon calendar">
            <FaCalendar />
          </div>
          <div className="stat-content">
            <div className="stat-value">{logs.length}</div>
            <div className="stat-label">Total Entries</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed">
            <FaCalendar />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {logs.filter(l => l.status === 'completed').length}
            </div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="add-log-form">
          <h3>Add New Work Log</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Task Description</label>
              <input
                type="text"
                value={newLog.task}
                onChange={(e) => setNewLog({ ...newLog, task: e.target.value })}
                placeholder="Enter task description"
              />
            </div>
            <div className="form-group">
              <label>Project</label>
              <input
                type="text"
                value={newLog.project}
                onChange={(e) => setNewLog({ ...newLog, project: e.target.value })}
                placeholder="Enter project name"
              />
            </div>
            <div className="form-group">
              <label>Hours</label>
              <input
                type="number"
                step="0.5"
                value={newLog.hours}
                onChange={(e) => setNewLog({ ...newLog, hours: e.target.value })}
                placeholder="0.0"
              />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={newLog.date}
                onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleAddLog}>
              Add Log
            </button>
          </div>
        </div>
      )}

      <div className="logs-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Task</th>
              <th>Project</th>
              <th>Hours</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.date).toLocaleDateString()}</td>
                <td>{log.task}</td>
                <td>
                  <span className="project-badge">{log.project}</span>
                </td>
                <td>{log.hours}h</td>
                <td>
                  <span className={`status-badge ${log.status}`}>
                    {log.status === 'completed' ? 'Completed' : 'In Progress'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" title="Edit">
                      <FaEdit />
                    </button>
                    <button 
                      className="btn-icon delete" 
                      title="Delete"
                      onClick={() => handleDeleteLog(log.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkLog;