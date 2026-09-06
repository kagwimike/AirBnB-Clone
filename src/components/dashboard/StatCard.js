import React from 'react';

import './StatCard.css';

function StatCard({
  title,
  value,
  icon,
  trend,
  trendText
}) {

  return (

    <div className="stat-card">

      <div className="stat-card-top">

        <div className="stat-card-icon">

          {icon}

        </div>


        {trend && (

          <div className="stat-card-trend">

            {trend}

          </div>

        )}

      </div>


      <div className="stat-card-content">

        <p>
          {title}
        </p>

        <h2>
          {value}
        </h2>


        {trendText && (

          <span>

            {trendText}

          </span>

        )}

      </div>

    </div>

  );
}

export default StatCard;