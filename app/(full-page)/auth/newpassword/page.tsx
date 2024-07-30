'use client';

import React, { useState, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Password } from 'primereact/password';
import { LoginService } from '../../../../service/LoginService';

const NewPasswordPage = () => {
    const [login, setLogin] = useState('');
    const [codigo, setCodigo] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [isPasswordFieldsVisible, setIsPasswordFieldsVisible] = useState(false);
    const toast = useRef<Toast>(null);
    const loginService = new LoginService();

    const enviarEmail = async () => {
        try {
            await loginService.esqueciSenha(login);
            toast.current?.show({ severity: 'info', summary: 'Sucesso', detail: 'Código de verificação enviado para seu email.' });
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao enviar o email.' });
        }
    };

    const navigateToLogin = () => {
        window.location.href = '/auth/login';
    };

    const verificarCodigo = async () => {
        try {
            const isValid = await loginService.verificarCodigo(login, codigo);
            if (isValid) {
                setIsDialogVisible(false);
                setIsPasswordFieldsVisible(true);
                toast.current?.show({ severity: 'info', summary: 'Sucesso', detail: 'Código verificado. Pode redefinir sua senha.' });
            } else {
                toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Código inválido.' });
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao verificar o código.' });
        }
    };

    const redefinirSenha = async () => {
        if (novaSenha === confirmarSenha) {
            try {
                await loginService.redefinirSenha(login, novaSenha);
                toast.current?.show({ severity: 'info', summary: 'Sucesso', detail: 'Senha redefinida com sucesso.' });
            } catch (error) {
                toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao redefinir a senha.' });
            }
        } else {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'As senhas não coincidem.' });
        }
    };

    return (
        <div style={styles.container}>
            <Toast ref={toast} />
            <div style={styles.card}>
                <div style={styles.cardHeader}>
                    <h2>Esqueci Minha Senha</h2>
                </div>
                <div style={styles.cardBody}>
                    <div style={styles.field}>
                        <label htmlFor="login">Email</label>
                        <InputText id="login" value={login} onChange={(e) => setLogin(e.target.value)} />
                    </div>
                    <Button label="Enviar Código" onClick={enviarEmail} style={{ marginTop: '1rem', marginBottom: '1rem' }} />

                    {isPasswordFieldsVisible ? (
                        <>
                            <div style={styles.field}>
                                <label htmlFor="novaSenha">Nova Senha</label>
                                <Password id="novaSenha" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} />
                            </div>
                            <div style={styles.field}>
                                <label htmlFor="confirmarSenha">Confirmar Senha</label>
                                <Password id="confirmarSenha" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} />
                            </div>
                            <Button label="Redefinir Senha" onClick={redefinirSenha} style={{ marginTop: '1rem' }} />
                        </>
                    ) : (
                        <Button label="Verificar Código" onClick={() => setIsDialogVisible(true)} style={{ marginTop: '1rem' }} />
                    )}

                    <Dialog header="Verificar Código" visible={isDialogVisible} onHide={() => setIsDialogVisible(false)}>
                        <div style={styles.field}>
                            <label htmlFor="codigo">Código</label>
                            <InputText id="codigo" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
                        </div>
                        <Button label="Verificar" onClick={verificarCodigo} style={{ marginTop: '1rem' }} />
                    </Dialog>

                    <div style={styles.navigationLink}>
                        <a onClick={navigateToLogin} style={styles.link}>
                            Já tenho cadastro!
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '2rem',
    },
    card: {
        width: '100%',
        maxWidth: '400px',
        padding: '2rem',
        backgroundColor: '#fff',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
    },
    cardHeader: {
        marginBottom: '1rem',
        textAlign: 'center',
    },
    cardBody: {
        display: 'flex',
        flexDirection: 'column',
    },
    field: {
        marginBottom: '1rem',
    },
    navigationLink: {
        marginTop: '1.5rem',
        textAlign: 'center',
    },
    link: {
        color: 'var(--primary-color)',
        cursor: 'pointer',
        textDecoration: 'none',
    },
};

export default NewPasswordPage;
