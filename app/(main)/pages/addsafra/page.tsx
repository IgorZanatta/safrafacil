/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { SafraService } from '../../../../service/SafraService';

import { Projeto } from '@/types';

const Safra = () => {
    let safraVazia: Projeto.Safra = {
        id: 0,
        qual_safra: '',
        usuario: { id: 0, nome: '', senha: '', login: '', telefone: '' }
    };

    const [safras, setSafras] = useState<Projeto.Safra[] | null>(null);
    const [safraDialog, setSafraDialog] = useState(false);
    const [safra, setSafra] = useState<Projeto.Safra>(safraVazia);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const safraService = new SafraService();

    useEffect(() => {
        const userId = localStorage.getItem('USER_ID');
        if (userId) {
            safraService.listarPorUsuario(parseInt(userId)).then((response) => {
                setSafras(response.data);
            }).catch((error) => {
                console.log(error);
            });
        }
    }, []);

    const openNew = () => {
        setSafra(safraVazia);
        setSubmitted(false);
        setSafraDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setSafraDialog(false);
    };

    const saveSafra = () => {
        setSubmitted(true);
        const userId = localStorage.getItem('USER_ID');
        if (userId) {
            safra.usuario.id = parseInt(userId, 10); // Definir o ID do usuário no objeto safra
        } else {
            console.error('User ID não encontrado no localStorage');
            return;
        }

        if (safra.qual_safra) {
            if (!safra.id) {
                safraService.inserir(safra)
                    .then((response) => {
                        setSafraDialog(false);
                        setSafra(safraVazia);
                        safraService.listarPorUsuario(parseInt(userId)).then((response) => {
                            setSafras(response.data);
                        }).catch((error) => {
                            console.log(error);
                        });
                        toast.current?.show({
                            severity: 'info',
                            summary: 'Sucesso!',
                            detail: 'Safra cadastrada com sucesso!'
                        });
                    }).catch((error) => {
                        const message = error.response?.data?.message || 'Erro ao salvar!';
                        toast.current?.show({
                            severity: 'error',
                            summary: 'Erro!',
                            detail: message
                        });
                    });
            } else {
                safraService.alterar(safra)
                    .then((response) => {
                        setSafraDialog(false);
                        setSafra(safraVazia);
                        safraService.listarPorUsuario(parseInt(userId)).then((response) => {
                            setSafras(response.data);
                        }).catch((error) => {
                            console.log(error);
                        });
                        toast.current?.show({
                            severity: 'info',
                            summary: 'Sucesso!',
                            detail: 'Safra alterada com sucesso!'
                        });
                    }).catch((error) => {
                        const message = error.response?.data?.message || 'Erro ao alterar!';
                        toast.current?.show({
                            severity: 'error',
                            summary: 'Erro!',
                            detail: message
                        });
                    });
            }
        }
    }

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const onInputChange = (e: { target: { value: any } }, name: string) => {
        const val = (e.target && e.target.value) || '';
        setSafra((prevSafra) => ({
            ...prevSafra,
            [name]: val
        }));
    };

    const qualSafraBodyTemplate = (rowData: Projeto.Safra) => {
        return (
            <>
                <span className="p-column-title">Qual Safra</span>
                {rowData.qual_safra}
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h3 className="m-0">Adicionar Safras</h3>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const safraDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Salvar" icon="pi pi-check" text onClick={saveSafra} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={<Button label="Novo" icon="pi pi-plus" severity="success" onClick={openNew} />} ></Toolbar>

                    <DataTable
                        ref={dt}
                        value={safras}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} até {last} de {totalRecords} safras"
                        globalFilter={globalFilter}
                        emptyMessage="Nenhuma Safra Encontrada"
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column field="qual_safra" header="Qual Safra" sortable body={qualSafraBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                    </DataTable>

                    <Dialog visible={safraDialog} style={{ width: '450px' }} header="Detalhes da Safra" modal className="p-fluid" footer={safraDialogFooter} onHide={hideDialog}>

                        <div className="field">
                            <label htmlFor="qual_safra">Qual Safra</label>
                            <InputText
                                id="qual_safra"
                                value={safra.qual_safra}
                                onChange={(e) => onInputChange(e, 'qual_safra')}
                                required
                                autoFocus
                                className={classNames({
                                    'p-invalid': submitted && !safra.qual_safra
                                })}
                            />
                            {submitted && !safra.qual_safra && <small className="p-invalid">Qual Safra é Obrigatória.</small>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Safra;
