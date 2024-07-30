/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import { Dropdown } from 'primereact/dropdown';
import React, { useEffect, useRef, useState } from 'react';
import { FazendaService } from '../../../../service/FazendaService';
import { SafraService } from '../../../../service/SafraService';

import { Projeto } from '@/types';
import { DropdownChangeEvent } from 'primereact/dropdown';

const Fazenda = () => {
    let fazendaVazio: Projeto.Fazenda = {
        id: 0,
        nome: '',
        tamanho: '',
        safra: { id: 0, qual_safra: '' }
    };

    const [fazendas, setFazendas] = useState<Projeto.Fazenda[] | null>(null);
    const [fazendaDialog, setFazendaDialog] = useState(false);
    const [deleteFazendaDialog, setDeleteFazendaDialog] = useState(false);
    const [deleteFazendasDialog, setDeleteFazendasDialog] = useState(false);
    const [fazenda, setFazenda] = useState<Projeto.Fazenda>(fazendaVazio);
    const [selectedFazendas, setSelectedFazendas] = useState<Projeto.Fazenda[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const fazendaService = new FazendaService();
    const [safras, setSafras] = useState<Projeto.Safra[]>([]);

    useEffect(() => {
        const safraService = new SafraService();
        safraService.listarTodos().then((response) => {
            setSafras(response.data);
        }).catch((error) => {
            console.log(error);
        });

        if (!fazendas) {
            fazendaService.listarTodos().then((response) => {
                console.log(response.data);
                setFazendas(response.data);
            }).catch((error) => {
                console.log(error);
            });
        }
    }, [fazendaService, fazendas]);

    const openNew = () => {
        setFazenda(fazendaVazio);
        setSubmitted(false);
        setFazendaDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setFazendaDialog(false);
    };

    const hideDeleteFazendaDialog = () => {
        setDeleteFazendaDialog(false);
    };

    const hideDeleteFazendasDialog = () => {
        setDeleteFazendasDialog(false);
    };

    const saveFazenda = () => {
        setSubmitted(true);
    
        if (fazenda.nome && fazenda.tamanho && fazenda.safra && fazenda.safra.id) {
            if (!fazenda.id) {
                fazendaService.inserir(fazenda)
                    .then((response) => {
                        setFazendaDialog(false);
                        setFazenda(fazendaVazio);
                        setFazendas(null);
                        toast.current?.show({
                            severity: 'info',
                            summary: 'Sucesso!',
                            detail: 'Fazenda cadastrada com sucesso!'
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
                fazendaService.alterar(fazenda)
                    .then((response) => {
                        setFazendaDialog(false);
                        setFazenda(fazendaVazio);
                        setFazendas(null);
                        toast.current?.show({
                            severity: 'info',
                            summary: 'Sucesso!',
                            detail: 'Fazenda alterada com sucesso!'
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
    

    const editFazenda = (fazenda: Projeto.Fazenda) => {
        setFazenda({ ...fazenda });
        setFazendaDialog(true);
    };

    const confirmDeleteFazenda = (fazenda: Projeto.Fazenda) => {
        setFazenda(fazenda);
        setDeleteFazendaDialog(true);
    };

    const deleteFazenda = () => {
        if (fazenda.id) {
            fazendaService.excluir(fazenda.id).then((response) => {
                setFazenda(fazendaVazio);
                setDeleteFazendaDialog(false);
                setFazendas(null);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Sucesso!',
                    detail: 'Fazenda Excluida'
                });
            }).catch((error) => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro!',
                    detail: 'Erro ao Alterar Fazenda'
                });
            })
        }
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteFazendasDialog(true);
    };

    const deleteSelectedFazendas = () => {
        if (selectedFazendas) {
            Promise.all(selectedFazendas.map(async (_fazenda) => {
                if (_fazenda.id !== undefined) {
                    try {
                        await fazendaService.excluir(_fazenda.id);
                    } catch (error) {
                        console.error(`Erro ao excluir fazenda com id ${_fazenda.id}:`, error);
                        toast.current?.show({
                            severity: 'error',
                            summary: 'Erro!',
                            detail: `Erro ao excluir fazenda com id ${_fazenda.id}`
                        });
                    }
                }
            })).then(() => {
                setFazendas((prevFazendas) => prevFazendas?.filter(fazenda => !selectedFazendas.includes(fazenda)) || []);
                setSelectedFazendas([]);
                setDeleteFazendasDialog(false);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Sucesso!',
                    detail: 'Fazendas excluídas'
                });
            }).catch((error) => {
                console.error('Erro ao excluir fazendas:', error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro!',
                    detail: 'Erro ao excluir fazendas'
                });
            });
        }
    };

    const onInputChange = (e: { target: { value: any } }, name: string) => {
        const val = (e.target && e.target.value) || '';

        setFazenda((prevFazenda) => ({
            ...prevFazenda,
            [name]: name === 'safra' ? { id: val } : val,
        }));
    };

    const onSelectSafraChange = (e: DropdownChangeEvent) => {
        const val = e.value;
        setFazenda((prevFazenda) => ({
            ...prevFazenda,
            safra: val,
        }));
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Novo" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
                    <Button label="Excluir" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedFazendas || !selectedFazendas.length} />
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <FileUpload mode="basic" accept="image/*" maxFileSize={1000000} chooseLabel="Import" className="mr-2 inline-block" />
                <Button label="Export" icon="pi pi-upload" severity="help" onClick={exportCSV} />
            </React.Fragment>
        );
    };

    const idBodyTemplate = (rowData: Projeto.Fazenda) => {
        return (
            <>
                <span className="p-column-title">Código</span>
                {rowData.id}
            </>
        );
    };

    const nomeBodyTemplate = (rowData: Projeto.Fazenda) => {
        return (
            <>
                <span className="p-column-title">Nome</span>
                {rowData.nome}
            </>
        );
    };

    const tamanhoBodyTemplate = (rowData: Projeto.Fazenda) => {
        return (
            <>
                <span className="p-column-title">Tamanho</span>
                {rowData.tamanho}
            </>
        );
    };

    const actionBodyTemplate = (rowData: Projeto.Fazenda) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editFazenda(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteFazenda(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gerenciamento de Fazendas</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const fazendaDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Salvar" icon="pi pi-check" text onClick={saveFazenda} />
        </>
    );
    const deleteFazendaDialogFooter = (
        <>
            <Button label="Não" icon="pi pi-times" text onClick={hideDeleteFazendaDialog} />
            <Button label="Sim" icon="pi pi-check" text onClick={deleteFazenda} />
        </>
    );
    const deleteFazendasDialogFooter = (
        <>
            <Button label="Não" icon="pi pi-times" text onClick={hideDeleteFazendasDialog} />
            <Button label="Sim" icon="pi pi-check" text onClick={deleteSelectedFazendas} />
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
                        value={fazendas}
                        selection={selectedFazendas}
                        onSelectionChange={(e) => setSelectedFazendas(e.value as any)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} até {last} de {totalRecords} fazendas"
                        globalFilter={globalFilter}
                        emptyMessage="Nenhuma Fazenda Encontrada"
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        <Column field="id" header="Codigo" sortable body={idBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="nome" header="Nome" sortable body={nomeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="tamanho" header="Tamanho" sortable body={tamanhoBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={fazendaDialog} style={{ width: '450px' }} header="Detalhes da Fazenda" modal className="p-fluid" footer={fazendaDialogFooter} onHide={hideDialog}>

                        <div className="field">
                            <label htmlFor="nome">Nome</label>
                            <InputText
                                id="nome"
                                value={fazenda.nome}
                                onChange={(e) => onInputChange(e, 'nome')}
                                required
                                autoFocus
                                className={classNames({
                                    'p-invalid': submitted && !fazenda.nome
                                })}
                            />
                            {submitted && !fazenda.nome && <small className="p-invalid">Nome é Obrigatorio.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="tamanho">Tamanho</label>
                            <InputText
                                id="tamanho"
                                value={fazenda.tamanho}
                                onChange={(e) => onInputChange(e, 'tamanho')}
                                required
                                className={classNames({
                                    'p-invalid': submitted && !fazenda.tamanho
                                })}
                            />
                            {submitted && !fazenda.tamanho && <small className="p-invalid">Tamanho é Obrigatorio.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="safra">Safra</label>
                            <Dropdown 
                                id="safra"
                                optionLabel="qual_safra"
                                value={fazenda.safra}
                                options={safras}
                                onChange={onSelectSafraChange}
                                placeholder="Selecione uma Safra"
                                filter
                            />
                            {submitted && (!fazenda.safra || !fazenda.safra.id) && <small className="p-invalid">Safra é obrigatória.</small>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteFazendaDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteFazendaDialogFooter} onHide={hideDeleteFazendaDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {fazenda && (
                                <span>
                                    Tem certeza que deseja excluir <b>{fazenda.nome}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteFazendasDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteFazendasDialogFooter} onHide={hideDeleteFazendasDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {fazenda && <span>Tem certeza que deseja excluir as fazendas selecionadas?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Fazenda;
