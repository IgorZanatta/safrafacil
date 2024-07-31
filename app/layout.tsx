'use client';
import { LayoutProvider } from '../layout/context/layoutcontext';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import '../styles/demo/Demos.scss';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import LoginPage from './(full-page)/auth/login/page';
import { UserProvider, useUser } from '../layout/context/UserContext';

interface RootLayoutProps {
    children: React.ReactNode;
}

const checkAuth = () => {
    return !!localStorage.getItem('TOKEN_APLICACAO_FRONTEND');
};

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
    const [pageLoaded, setPageLoaded] = useState(false);
    const [autenticado, setAutenticado] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        if (pathname.startsWith('/pages') || pathname === '/') {
            setAutenticado(checkAuth());
            setPageLoaded(true);
        } else {
            setAutenticado(true);
            setPageLoaded(true);
        }
    }, [pathname]);

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <title>SafraFacil</title>
                <link rel="icon" href="/safrafacil/favicon.ico" />
                <link id="theme-css" href={`/safrafacil/themes/lara-light-indigo/theme.css`} rel="stylesheet" />
            </head>
            <body>
                <PrimeReactProvider>
                    <LayoutProvider>
                        <UserProvider>
                            {autenticado ? (
                                children
                            ) : (
                                pageLoaded ? (
                                    <LoginPage />
                                ) : null
                            )}
                        </UserProvider>
                    </LayoutProvider>
                </PrimeReactProvider>
            </body>
        </html>
    );
};

export default RootLayout;
