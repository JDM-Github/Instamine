import React, { useState } from 'react';
import { Link, useLocation  } from 'react-router-dom';
import './Navigation.scss';

export default function Navigation()
{
	return (
		<div className={`admin-navigation`}>

			<input className="nav-items" placeholder={'Search...'} />
			<div className="nav-items" data-label='DASHBOARD'>
				<Link to="/admin">
					<div>{'DASHBOARD'}</div>
				</Link>
			</div>
		</div>
	);
}
