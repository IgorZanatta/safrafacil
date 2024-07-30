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
        qual_safra: ''
    };

    const [safras, setSafras] = useState<Projeto.Safra[] | null>(null);
    const [safraDialog, setSafraDialog] = useState(false);
    const [deleteSafraDialog, setDeleteSafraDialog] = useState(false);
    const [deleteSafrasDialog, setDeleteSafrasDialog] = useState(false);
    const [safra, setSafra] = useState<Projeto.Safra>(safraVazia);
    const [selectedSafras, setSelectedSafras] = useState<Projeto.Safra[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const safraService = new SafraService();

    useEffect(() => {
        if (!safras) {
            safraService.listarTodos().then((response) => {
                console.log(response.data);
                setSafras(response.data);
            }).catch((error) => {
                console.log(error);
            });
        }
    }, [safraService, safras]);

    const openNew = () => {
        setSafra(safraVazia);
        setSubmitted(false);
        setSafraDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setSafraDialog(false);
    };

    const hideDeleteSafraDialog = () => {
        setDeleteSafraDialog(false);
    };

    const hideDeleteSafrasDialog = () => {
        setDeleteSafrasDialog(false);
    };

    const saveSafra = () => {
        setSubmitted(true);
    
        if (safra.qual_safra) {
            if (!safra.id) {
                safraService.inserir(safra)
                    .then((response) => {
                        setSafraDialog(false);
                        setSafra(safraVazia);
                        setSafras(null);
                        toast.current?.show({
                            severity: 'info',
                            summary: 'Sucesso!',
                            detail: 'Safra cadastrada com sucesso!'
                        });
                    }).catch((error) => {
                        console.log(error);
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
                        setSafras(null);
                        toast.current?.show({
                            severity: 'info',
                            summary: 'Sucesso!',
                            detail: 'Safra alterada com sucesso!'
                        });
                    }).catch((error) => {
                        console.log(error);
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
    

    const editSafra = (safra: Projeto.Safra) => {
        setSafra({ ...safra });
        setSafraDialog(true);
    };

    const confirmDeleteSafra = (safra: Projeto.Safra) => {
        setSafra(safra);
        setDeleteSafraDialog(true);
    };

    const deleteSafra = () => {
        if (safra.id) {
            safraService.excluir(safra.id).then((response) => {
                setSafra(safraVazia);
                setDeleteSafraDialog(false);
                setSafras(null);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Sucesso!',
                    detail: 'Safra Excluida'
                });
            }).catch((error) => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro!',
                    detail: 'Erro ao Excluir Safra'
                });
            })
        }
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteSafrasDialog(true);
    };

    const deleteSelectedSafras = () => {
        if (selectedSafras) {
            Promise.all(selectedSafras.map(async (_safra) => {
                if (_safra.id !== undefined) {
                    try {
                        await safraService.excluir(_safra.id);
                    } catch (error) {
                        console.error(`Erro ao excluir safra com id ${_safra.id}:`, error);
                        toast.current?.show({
                            severity: 'error',
                            summary: 'Erro!',
                            detail: `Erro ao excluir safra com id ${_safra.id}`
                        });
                    }
                }
            })).then(() => {
                setSafras((prevSafras) => prevSafras?.filter(safra => !selectedSafras.includes(safra)) || []);
                setSelectedSafras([]);
                setDeleteSafrasDialog(false);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Sucesso!',
                    detail: 'Safras excluídas'
                });
            }).catch((error) => {
                console.error('Erro ao excluir safras:', error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro!',
                    detail: 'Erro ao excluir safras'
                });
            });
        }
    };

    const onInputChange = (e: { target: { value: any } }, name: string) => {
        const val = (e.target && e.target.value) || '';
        setSafra((prevSafra) => ({
            ...prevSafra,
            [name]: val
        }));
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Novo" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
                    <Button label="Excluir" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedSafras || !selectedSafras.length} />
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Export" icon="pi pi-upload" severity="help" onClick={exportCSV} />
            </React.Fragment>
        );
    };

    const idBodyTemplate = (rowData: Projeto.Safra) => {
        return (
            <>
                <span className="p-column-title">Código</span>
                {rowData.id}
            </>
        );
    };

    const qualSafraBodyTemplate = (rowData: Projeto.Safra) => {
        return (
            <>
                <span className="p-column-title">Qual Safra</span>
                {rowData.qual_safra}
            </>
        );
    };

    const actionBodyTemplate = (rowData: Projeto.Safra) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editSafra(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteSafra(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gerenciamento de Safras</h5>
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
    const deleteSafraDialogFooter = (
        <>
            <Button label="Não" icon="pi pi-times" text onClick={hideDeleteSafraDialog} />
            <Button label="Sim" icon="pi pi-check" text onClick={deleteSafra} />
        </>
    );
    const deleteSafrasDialogFooter = (
        <>
            <Button label="Não" icon="pi pi-times" text onClick={hideDeleteSafrasDialog} />
            <Button label="Sim" icon="pi pi-check" text onClick={deleteSelectedSafras} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={safras}
                        selection={selectedSafras}
                        onSelectionChange={(e) => setSelectedSafras(e.value as any)}
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
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        <Column field="id" header="Codigo" sortable body={idBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="qual_safra" header="Qual Safra" sortable body={qualSafraBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
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

                    <Dialog visible={deleteSafraDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteSafraDialogFooter} onHide={hideDeleteSafraDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {safra && (
                                <span>
                                    Tem certeza que deseja excluir <b>{safra.qual_safra}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteSafrasDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteSafrasDialogFooter} onHide={hideDeleteSafrasDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {safra && <span>Tem certeza que deseja excluir as safras selecionadas?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Safra;
