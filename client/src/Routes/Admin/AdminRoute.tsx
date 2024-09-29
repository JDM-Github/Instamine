import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Dashboard from './Dashboard.tsx';
import Navigation from './Navigation.tsx';

import './AdminRoute.scss';

export default function AdminRoute({ className }) {

	return (
		<div className="admin">
			<Navigation/>
			<div className="admin-content">
				<Routes>
					<Route index path="/" element={<Dashboard/>} />
				</Routes>
			</div>
		</div>
	);
}
