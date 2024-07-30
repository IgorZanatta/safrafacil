/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import React, { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Projeto } from '@/types';
import { UsuarioService } from '../../../../service/UsuarioService';

const EditarUsuario = () => {
    const usuarioVazio: Projeto.Usuario = {
        id: 0,
        nome: '',
        senha: '',
        login: '',
        telefone: ''
    };

    const [usuario, setUsuario] = useState<Projeto.Usuario>(usuarioVazio);
    const [submitted, setSubmitted] = useState(false);
    const [editDialog, setEditDialog] = useState(false);
    const [editField, setEditField] = useState<string>('');
    const [editValue, setEditValue] = useState<string>('');
    const toast = useRef<Toast>(null);
    const usuarioService = new UsuarioService();

    useEffect(() => {
        const userId = localStorage.getItem('USER_ID');
        if (userId) {
            const parsedUserId = parseInt(userId, 10);
            if (!isNaN(parsedUserId)) {
                usuarioService.buscarPorId(parsedUserId).then((response) => {
                    setUsuario(response.data);
                }).catch((error) => {
                    console.error(error);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Erro',
                        detail: 'Erro ao carregar usuário',
                        life: 3000
                    });
                });
            } else {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'ID de usuário inválido',
                    life: 3000
                });
            }
        } else {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'ID do usuário não encontrado no localStorage',
                life: 3000
            });
        }
    }, []);

    const openEditDialog = (field: string) => {
        setEditField(field);
        setEditValue('');
        setEditDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setEditDialog(false);
    };

    const saveCampos = () => {
        setSubmitted(true);

        if (editValue.trim()) {
            const updatedUsuario = { ...usuario, [editField]: editValue };

            usuarioService.alterarCampos(updatedUsuario)
                .then((response) => {
                    setEditDialog(false);
                    setUsuario(updatedUsuario); // Atualize o estado do usuário com os novos valores
                    toast.current?.show({
                        severity: 'info',
                        summary: 'Sucesso!',
                        detail: 'Usuário alterado com sucesso!'
                    });
                }).catch((error) => {
                    console.log(error.response?.data.message);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Erro!',
                        detail: 'Erro ao alterar! ' + error.response?.data.message
                    });
                });
        }
    };

    const saveSenha = () => {
        setSubmitted(true);
    
        if (editValue.trim()) {
            console.log('Senha enviada:', editValue); // Adicione este log para verificar a senha enviada
            usuarioService.alterarSenha(usuario.id!, editValue)
                .then((response) => {
                    setEditDialog(false);
                    toast.current?.show({
                        severity: 'info',
                        summary: 'Sucesso!',
                        detail: 'Senha alterada com sucesso!'
                    });
                }).catch((error) => {
                    console.log(error.response?.data.message);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Erro!',
                        detail: 'Erro ao alterar senha! ' + error.response?.data.message
                    });
                });
        }
    };

    const saveUsuario = () => {
        if (editField === 'senha') {
            saveSenha();
        } else {
            saveCampos();
        }
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const val = (e.target && e.target.value) || '';
        setEditValue(val);
    };

    const editDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Salvar" icon="pi pi-check" text onClick={saveUsuario} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <h5 className="m-0">Detalhes do Usuário</h5>
                    <div className="field">
                        <label htmlFor="nome">Nome</label>
                        <div className="p-inputgroup">
                            <InputText id="nome" value={usuario.nome} disabled />
                            <Button icon="pi pi-pencil" onClick={() => openEditDialog('nome')} />
                        </div>
                    </div>
                    <div className="field">
                        <label htmlFor="senha">Senha</label>
                        <div className="p-inputgroup">
                            <InputText id="senha" value="******" disabled /> {/* Mostrar senha como mascarada */}
                            <Button icon="pi pi-pencil" onClick={() => openEditDialog('senha')} />
                        </div>
                    </div>
                    <div className="field">
                        <label htmlFor="login">Login</label>
                        <div className="p-inputgroup">
                            <InputText id="login" value={usuario.login} disabled />
                            <Button icon="pi pi-pencil" onClick={() => openEditDialog('login')} />
                        </div>
                    </div>
                    <div className="field">
                        <label htmlFor="telefone">Telefone</label>
                        <div className="p-inputgroup">
                            <InputText id="telefone" value={usuario.telefone} disabled />
                            <Button icon="pi pi-pencil" onClick={() => openEditDialog('telefone')} />
                        </div>
                    </div>

                    <Dialog visible={editDialog} style={{ width: '450px' }} header={`Editar ${editField}`} modal className="p-fluid" footer={editDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor={editField}>{editField.charAt(0).toUpperCase() + editField.slice(1)}</label>
                            <InputText
                                id={editField}
                                value={editValue}
                                onChange={onInputChange}
                                required
                                autoFocus
                                className={classNames({
                                    'p-invalid': submitted && !editValue
                                })}
                            />
                            {submitted && !editValue && <small className="p-invalid">{`${editField.charAt(0).toUpperCase() + editField.slice(1)} é Obrigatório.`}</small>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default EditarUsuario;
