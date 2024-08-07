/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from 'next/navigation';
import React, { useContext, useMemo, useRef, useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { LoginService } from '../../../../service/LoginService';
import { Toast } from 'primereact/toast';
import Link from 'next/link';
import { Dialog } from 'primereact/dialog';
import { useUser } from '../../../../layout/context/UserContext'; // Certifique-se de que o caminho está correto

const LoginPage = () => {
    const [login, setLogin] = useState('');
    const [senha, setSenha] = useState('');
    const [showLoading, setShowLoading] = useState(false);
    const { layoutConfig } = useContext(LayoutContext);
    const { setUserId } = useUser();
    const router = useRouter();
    const toast = useRef<Toast>(null);

    const loginService = useMemo(() => new LoginService(), []);

    const efetuarLogin = () => {
        setShowLoading(true);
        loginService.login(login, senha)
            .then((response) => {
                setShowLoading(false);
                const { token, userId } = response.data;
                localStorage.setItem('TOKEN_APLICACAO_FRONTEND', token);
                if (userId) {
                    localStorage.setItem('USER_ID', userId.toString());
                    setUserId(userId.toString());
                } else {
                    console.error('userId não encontrado na resposta do login');
                }
                if (toast.current) {
                    toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Login realizado com sucesso!', life: 3000 });
                }
                router.push('/pages/home');
            })
            .catch((error) => {
                setShowLoading(false);
                console.error('Login Error:', error);
                if (toast.current) {
                    toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Credenciais inválidas', life: 3000 });
                }
            });
    }

    const efetuarLoginAdmin = () => {
        setShowLoading(true);
        loginService.login('admin', 'admin')
            .then((response) => {
                setShowLoading(false);
                const { token, userId } = response.data;
                localStorage.setItem('TOKEN_APLICACAO_FRONTEND', token);
                if (userId) {
                    localStorage.setItem('USER_ID', userId.toString());
                    setUserId(userId.toString());
                } else {
                    console.error('userId não encontrado na resposta do login');
                }
                if (toast.current) {
                    toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Login realizado com sucesso!', life: 3000 });
                }
                router.push('/pages/home');
            })
            .catch((error) => {
                setShowLoading(false);
                console.error('Login Error:', error);
                if (toast.current) {
                    toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Credenciais inválidas', life: 3000 });
                }
            });
    }

    return (
        <div className={classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' })}>
            <Toast ref={toast} />
            <Dialog visible={showLoading} modal onHide={() => {}} closable={false}>
                <div className="flex align-items-center justify-content-center flex-column">
                    <img src="/loading.gif" alt="Loading" />
                    <p>Aguarde enquanto conecta com o servidor...</p>
                </div>
            </Dialog>
            <div className="flex flex-column align-items-center justify-content-center">
                <img src={`/layout/images/logo-${layoutConfig.colorScheme === 'light' ? 'dark' : 'white'}.svg`} alt="Sakai logo" className="mb-5 w-6rem flex-shrink-0" />
                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)'
                    }}
                >
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        <div className="text-center mb-5">
                            <span className="text-600 font-medium">Eu já possuo cadastro!</span>
                        </div>

                        <div>
                            <label htmlFor="login" className="block text-900 text-xl font-medium mb-2">
                                Login
                            </label>
                            <InputText id="login" value={login} onChange={(e) => setLogin(e.target.value)} type="text" placeholder="Digite seu login" className="w-full md:w-30rem mb-5" style={{ padding: '1rem' }} />

                            <label htmlFor="senha" className="block text-900 font-medium text-xl mb-2">
                                Senha
                            </label>
                            <Password inputId="senha" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Password" toggleMask className="w-full mb-5" inputClassName="w-full p-3 md:w-30rem"></Password>

                            <div className="flex align-items-center justify-content-between mb-5 gap-5">                            
                                <Link href="/auth/newuser" className="font-medium no-underline ml-2 text-right cursor-pointer" style={{ color: 'var(--primary-color)' }}>
                                    Sou novo por aqui!
                                </Link>
                                <Link href="/auth/newpassword" className="font-medium no-underline ml-2 text-right cursor-pointer" style={{ color: 'var(--primary-color)' }}>
                                    Forgot password?
                                </Link>
                            </div>
                            <Button label="Entrar" className="w-full p-3 text-xl" onClick={efetuarLogin}></Button>
                        </div>

                        <div className="text-center mt-5">
                            <span className="text-600 font-medium">Fazer login com a conta admin de teste</span>
                            <Button label="Entrar como Admin" className="w-full p-3 text-xl mt-3" onClick={efetuarLoginAdmin}></Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
