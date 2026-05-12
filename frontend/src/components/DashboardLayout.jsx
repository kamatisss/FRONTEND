import React from 'react';
import TopNavbar from './TopNavbar';

const DashboardLayout = ({ children }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <TopNavbar />
            <div style={{ flex: 1, overflowY: 'auto', background: '#ecf0f1', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                {children}
            </div>
        </div>
    );
};

export default DashboardLayout;
