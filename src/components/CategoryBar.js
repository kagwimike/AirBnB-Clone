import React, { useState } from 'react';
import './CategoryBar.css';
import HomeIcon from '@mui/icons-material/Home';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import PoolIcon from '@mui/icons-material/Pool';
import CabinIcon from '@mui/icons-material/Cabin';

const categories = [
  { label: 'Homes', value: 'HOMES', icon: <HomeIcon /> },
  { label: 'Experiences', value: 'EXPERIENCES', icon: <LocalActivityIcon /> },
  { label: 'Services', value: 'SERVICES', icon: <RoomServiceIcon /> },
];

function CategoryBar({ onSelectCategory }) {
  const [activeCategory, setActiveCategory] = useState('HOMES');

  const handleClick = (value) => {
    setActiveCategory(value);
    onSelectCategory(value);
  };

  return (
    <div className="category-bar">
      {categories.map((cat) => (
        <div
          key={cat.value}
          className={`category-item ${activeCategory === cat.value ? 'active' : ''}`}
          onClick={() => handleClick(cat.value)}
        >
          {cat.icon}
          <span>{cat.label}</span>
        </div>
      ))}
    </div>
  );
}

export default CategoryBar;