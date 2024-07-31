/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useImperativeHandle, useRef, useState } from 'react';
import { AppTopbarRef } from '@/types';
import { LayoutContext } from './context/layoutcontext';
import { Calendar, CalendarSelectEvent } from 'primereact/calendar'; // Usamos CalendarSelectEvent

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);
    const calendarButtonRef = useRef(null);
    const [calendarVisible, setCalendarVisible] = useState(false);

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    const toggleCalendar = () => {
        setCalendarVisible(!calendarVisible);
    };

    const handleDateSelect = (e: CalendarSelectEvent) => { // Usamos CalendarSelectEvent
        const selectedDate = e.value as Date;
        if (selectedDate) {
            const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
            window.location.href = `/pages/tipolistdata/${formattedDate}`;
        }
    };

    const logout = () => {
        localStorage.removeItem('TOKEN_APLICACAO_FRONTEND');
    };

    return (
        <div className="layout-topbar">
            <Link href="/pages/home" className="layout-topbar-logo">
                <img src={`/layout/images/logo-${layoutConfig.colorScheme !== 'light' ? 'white' : 'dark'}.svg`} width="47.22px" height={'35px'} alt="logo" />
                <span>SafraFacil</span>
            </Link>

            <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
                <i className="pi pi-bars" />
            </button>

            <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={showProfileSidebar}>
                <i className="pi pi-ellipsis-v" />
            </button>

            <div ref={topbarmenuRef} className={classNames('layout-topbar-menu', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}>
                <button ref={calendarButtonRef} type="button" className="p-link layout-topbar-button" onClick={toggleCalendar}>
                    <i className="pi pi-calendar"></i>
                    <span>Calendar</span>
                </button>
                <Link href="/pages/usuarioconfig">
                    <button type="button" className="p-link layout-topbar-button">
                        <i className="pi pi-user"></i>
                        <span>Profile</span>
                    </button>
                </Link>
                <Link href="/pages/document">
                    <button type="button" className="p-link layout-topbar-button">
                        <i className="pi pi-cog"></i>
                        <span>Settings</span>
                    </button>
                </Link>
                <a href="/" onClick={logout}>
                    <button type="button" className="p-link layout-topbar-button">
                        <i className="pi pi-sign-out"></i>
                        <span>Sair</span>
                    </button>
                </a>
            </div>

            {calendarVisible && (
                <div className="layout-topbar-calendar" style={{ position: 'absolute', top: '100%', right: 0, zIndex: 1000 }}>
                    <Calendar inline onSelect={handleDateSelect} />
                </div>
            )}
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;
