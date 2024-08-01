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
import { UserProvider } from '../layout/context/UserContext';
import TokenRenewPopup from '@/demo/components/TokenRenewPopup';
import { LoginService } from '@/service/LoginService';

interface RootLayoutProps {
    children: React.ReactNode;
}

const checkAuth = () => {
    return !!localStorage.getItem('TOKEN_APLICACAO_FRONTEND');
};

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
    const [pageLoaded, setPageLoaded] = useState(false);
    const [autenticado, setAutenticado] = useState(false);
    const [showRenewPopup, setShowRenewPopup] = useState(false);
    const pathname = usePathname();
    const loginService = new LoginService();

    useEffect(() => {
        const isMainPage = pathname.startsWith('/pages') || pathname === '/';
        if (isMainPage) {
            setAutenticado(checkAuth());
        } else {
            setAutenticado(true);
        }
        setPageLoaded(true);
    }, [pathname]);

    useEffect(() => {
        const interval = setInterval(() => {
            const timeRemaining = loginService.checkTokenValidity();
            const isMainPage = pathname.startsWith('/pages') || pathname === '/';
            if (isMainPage && timeRemaining !== -1 && timeRemaining <= 5 * 60 * 1000) { // 5 minutes
                setShowRenewPopup(true);
            }
        }, 60 * 1000); // Check every minute

        return () => clearInterval(interval);
    }, [pathname]);

    const handleRenew = async () => {
        const success = await loginService.renewToken();
        setShowRenewPopup(!success);
    };

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <title>SafraFacil</title>
                <link rel="icon" href="/favicon.ico" />
                <link id="theme-css" href={`/themes/lara-light-indigo/theme.css`} rel="stylesheet" />
            </head>
            <body>
                <PrimeReactProvider>
                    <LayoutProvider>
                        <UserProvider>
                            {autenticado ? (
                                <>
                                    {children}
                                    {showRenewPopup && (
                                        <TokenRenewPopup onRenew={handleRenew} onDismiss={() => setShowRenewPopup(false)} />
                                    )}
                                </>
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
