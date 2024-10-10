/* eslint-disable @next/next/no-img-element */

import React, { useContext } from 'react';
import { LayoutContext } from './context/layoutcontext';

const AppFooter = () => {
    const { layoutConfig } = useContext(LayoutContext);

    return (
        <div className="layout-footer">
            <img src={`/layout/images/logo.png`} alt="logo" style={{ width: '40px', height: 'auto', display: 'block'}} />
            by
            <span className="font-medium ml-2">SafraFacil</span>
        </div>
    );
};

export default AppFooter;
