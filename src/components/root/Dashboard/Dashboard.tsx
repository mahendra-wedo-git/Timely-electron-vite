// src/components/Dashboard.jsx
import { FaClock, FaBriefcase, FaCheckCircle, FaChartLine } from 'react-icons/fa';

export const Dashboard = () => {
  const recentActivities = [
    { id: 1, action: 'Completed task "Design UI"', time: '2 hours ago', type: 'task' },
    { id: 2, action: 'Added 4.5 hours to Website Redesign', time: '3 hours ago', type: 'worklog' },
    { id: 3, action: 'Started new project Mobile App', time: '1 day ago', type: 'project' },
    { id: 4, action: 'Updated project status', time: '2 days ago', type: 'update' }
  ];

  const quickStats = [
    { label: 'Hours Today', value: '6.5h', icon: <FaClock />, color: '#6366f1' },
    { label: 'Active Projects', value: '4', icon: <FaBriefcase />, color: '#8b5cf6' },
    { label: 'Tasks Done', value: '12', icon: <FaCheckCircle />, color: '#10b981' },
    { label: 'This Week', value: '32h', icon: <FaChartLine />, color: '#f59e0b' }
  ];

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's your overview</p>
        </div>
      </div>

      <div className="quick-stats-grid">
        {quickStats.map((stat, index) => (
          <div key={index} className="quick-stat-card">
            <div className="stat-icon-wrapper" style={{ backgroundColor: `${stat.color}20` }}>
              <div className="stat-icon" style={{ color: stat.color }}>
                {stat.icon}
              </div>
            </div>
            <div className="stat-details">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  {activity.type === 'task' && <FaCheckCircle />}
                  {activity.type === 'worklog' && <FaClock />}
                  {activity.type === 'project' && <FaBriefcase />}
                  {activity.type === 'update' && <FaChartLine />}
                </div>
                <div className="activity-content">
                  <div className="activity-action">{activity.action}</div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <h2>This Week's Progress</h2>
          <div className="progress-chart">
            <div className="week-bars">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                const heights = [80, 95, 70, 85, 100, 50, 30];
                return (
                  <div key={day} className="day-bar">
                    <div 
                      className="bar-fill"
                      style={{ height: `${heights[idx]}%` }}
                    />
                    <div className="day-label">{day}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
