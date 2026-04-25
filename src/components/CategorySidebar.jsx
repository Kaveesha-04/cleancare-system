import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import './CategorySidebar.css';

const CategorySidebar = () => {
  const [departments, setDepartments] = useState([]);
  const [expandedDepts, setExpandedDepts] = useState({});

  const toggleDept = (deptName) => {
    setExpandedDepts(prev => ({ ...prev, [deptName]: !prev[deptName] }));
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/departments`)
      .then(res => res.json())
      .then(data => setDepartments(data))
      .catch(err => console.error("Failed to load sparse departments", err));
  }, []);

  return (
    <aside className="category-sidebar">
      <div className="sidebar-header">
        <h3>Departments</h3>
      </div>
      <div className="sidebar-contents">
        <ul className="category-list">
          {departments.map((dept, idx) => {
            const isExpanded = !!expandedDepts[dept.name];
            return (
            <li key={idx} className="category-item">
              <div className="category-name" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                 <a href={`/?search=${encodeURIComponent(dept.name)}#products`} style={{color: 'inherit', textDecoration: 'none', flexGrow: 1}}>{dept.name}</a>
                 <span onClick={() => toggleDept(dept.name)} className="category-toggle-icon" style={{cursor: 'pointer', padding: '0 0.5rem', fontSize: '0.85rem', color: '#64748b'}}>
                   {isExpanded ? '▲' : '▼'}
                 </span>
              </div>
              {isExpanded && (
                <ul className="subcategory-list">
                  {dept.sections.map((sub, i) => (
                    <li key={i}>
                      <a href={`/?search=${encodeURIComponent(sub)}#products`}>{sub}</a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )})}
        </ul>
      </div>
    </aside>
  );
};

export default CategorySidebar;
