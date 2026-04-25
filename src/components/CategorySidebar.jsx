import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import './CategorySidebar.css';

const CategorySidebar = () => {
  const [departments, setDepartments] = useState([]);

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
          {departments.map((dept, idx) => (
            <li key={idx} className="category-item">
              <span className="category-name">
                 <a href={`/?search=${encodeURIComponent(dept.name)}#products`} style={{color: 'inherit', textDecoration: 'none'}}>{dept.name}</a>
              </span>
              <ul className="subcategory-list">
                {dept.sections.map((sub, i) => (
                  <li key={i}>
                    <a href={`/?search=${encodeURIComponent(sub)}#products`}>{sub}</a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default CategorySidebar;
