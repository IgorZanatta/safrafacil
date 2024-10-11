'use client';

import React, { useState, useMemo, useContext, useRef, ChangeEvent } from 'react';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { Projeto } from '@/types';
import { LoginService } from '../../../../service/LoginService';

const NewUserPage = () => {
    let usuarioVazio: Projeto.Usuario = {
        id: 0,
        nome: '',
        senha: '',
        login: '',
        telefone: ''
    };

    const [usuario, setUsuario] = useState<Projeto.Usuario>(usuarioVazio);
    const loginService = useMemo(() => new LoginService(), []);
    const { layoutConfig } = useContext(LayoutContext);
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });
    const toast = useRef<Toast>(null);

    const onInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        setUsuario(prevUsuario => ({
            ...prevUsuario,
            [name]: val,
        }));
    };

    const novoUsuario = () => {
        loginService.novoCadastro(usuario).then(() => {
            setUsuario(usuarioVazio);
            toast.current?.show({
                severity: 'info',
                summary: 'Sucesso!',
                detail: 'Usuário cadastrado com sucesso! Um e-mail de confirmação foi enviado.'
            });
        }).catch(error => {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro!',
                detail: 'Erro ao cadastrar!'
            });
        });
    };

    const navigateToLogin = () => {
        window.location.href = '/auth/login';
    };

    return (
        <div className={containerClassName}>
            <Toast ref={toast} />
            <div className="flex flex-column align-items-center justify-content-center">
            <img src={`/layout/images/logo.png`} alt="SafraFacil logo" style={{ width: '200px', height: 'auto', margin: '0', padding: '0' }} className="flex-shrink-0" />
                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)'
                    }}
                >
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        <div className="text-center mb-5">
                            <div className="text-900 text-3xl font-medium mb-3">Sou novo por aqui</div>
                        </div>

                        <div>
                            <label htmlFor="nome" className="block text-900 text-xl font-medium mb-2">
                                Nome
                            </label>
                            <InputText
                                id="nome"
                                value={usuario.nome}
                                onChange={(e) => onInputChange(e, 'nome')}
                                type="text"
                                placeholder="Digite seu nome"
                                className="w-full md:w-30rem mb-5"
                                style={{ padding: '1rem' }}
                            />

                            <label htmlFor="login" className="block text-900 text-xl font-medium mb-2">
                                Login
                            </label>
                            <InputText
                                id="login"
                                value={usuario.login}
                                onChange={(e) => onInputChange(e, 'login')}
                                type="text"
                                placeholder="Digite seu login"
                                className="w-full md:w-30rem mb-5"
                                style={{ padding: '1rem' }}
                            />

                            <label htmlFor="senha" className="block text-900 font-medium text-xl mb-2">
                                Senha
                            </label>
                            <Password
                                inputId="password1"
                                value={usuario.senha}
                                onChange={(e) => onInputChange(e, 'senha')}
                                placeholder="Digite sua senha"
                                toggleMask
                                className="w-full mb-5"
                                inputClassName="w-full p-3 md:w-30rem"
                            />

                            <label htmlFor="telefone" className="block text-900 text-xl font-medium mb-2">
                                Telefone
                            </label>
                            <InputText
                                id="telefone"
                                value={usuario.telefone}
                                onChange={(e) => onInputChange(e, 'telefone')}
                                type="text"
                                placeholder="Digite seu telefone"
                                className="w-full md:w-30rem mb-5"
                                style={{ padding: '1rem' }}
                            />

                            <div className="flex align-items-center justify-content-between mb-5 gap-5">
                                <a
                                    className="font-medium no-underline ml-2 text-right cursor-pointer"
                                    style={{ color: 'var(--primary-color)' }}
                                    onClick={navigateToLogin}
                                >
                                    Já tenho cadastro!
                                </a>
                            </div>
                            <Button label="Efetuar Cadastro" className="w-full p-3 text-xl" onClick={novoUsuario}></Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewUserPage;
