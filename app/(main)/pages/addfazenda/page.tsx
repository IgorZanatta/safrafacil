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
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import React, { useEffect, useRef, useState } from 'react';
import { FazendaService } from '../../../../service/FazendaService';
import { SafraService } from '../../../../service/SafraService';

import { Projeto } from '@/types';

const Fazenda = () => {
    let fazendaVazio: Projeto.Fazenda = {
        id: 0,
        nome: '',
        tamanho: '',
        safra: { id: 0, qual_safra: '', usuario: { id: 0, nome: '', senha: '', login: '', telefone: '' } },
        usuario: { id: 0, nome: '', senha: '', login: '', telefone: '' }
    };

    const [fazendas, setFazendas] = useState<Projeto.Fazenda[] | null>(null);
    const [fazendaDialog, setFazendaDialog] = useState(false);
    const [fazenda, setFazenda] = useState<Projeto.Fazenda>(fazendaVazio);
    const [selectedFazendas, setSelectedFazendas] = useState<Projeto.Fazenda[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const fazendaService = new FazendaService();
    const [safras, setSafras] = useState<Projeto.Safra[]>([]);
    const [selectedSafra, setSelectedSafra] = useState<Projeto.Safra | null>(null);

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
    }, [fazendas]);

    const openNew = () => {
        setFazenda(fazendaVazio);
        setSubmitted(false);
        setFazendaDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setFazendaDialog(false);
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

    const exportCSV = () => {
        dt.current?.exportCSV();
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
        setSelectedSafra(val);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Novo" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        
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

    const safraBodyTemplate = (rowData: Projeto.Fazenda) => {
        return (
            <>
                <span className="p-column-title">Safra</span>
                {rowData.safra.qual_safra}
            </>
        );
    };

    const actionBodyTemplate = (rowData: Projeto.Fazenda) => {
        
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h3 className="m-0">Adicionar Fazendas</h3>
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

    const filteredFazendas = fazendas?.filter(fazenda =>
        (!selectedSafra || (fazenda.safra && fazenda.safra.id === selectedSafra.id)) &&
        (!globalFilter || fazenda.nome.toLowerCase().includes(globalFilter.toLowerCase()))
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} ></Toolbar>

                    <div className="flex justify-content-between align-items-center mb-4">
                        <Dropdown
                            value={selectedSafra}
                            options={safras}
                            onChange={onSelectSafraChange}
                            optionLabel="qual_safra"
                            placeholder="Selecione uma Safra"
                            className="mr-2"
                        />
                    </div>

                    <DataTable
                        ref={dt}
                        value={filteredFazendas}
                        selection={selectedFazendas}
                        onSelectionChange={(e) => setSelectedFazendas(e.value as any)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} até {last} de {totalRecords} fazendas"
                        emptyMessage="Nenhuma Fazenda Encontrada"
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        <Column field="nome" header="Nome" sortable body={nomeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="safra" header="Safra" sortable body={safraBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="tamanho" header="Tamanho" sortable body={tamanhoBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
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
                                value={fazenda.safra}
                                options={safras}
                                onChange={(e: DropdownChangeEvent) => setFazenda(prevFazenda => ({ ...prevFazenda, safra: e.value }))}
                                optionLabel="qual_safra"
                                placeholder="Selecione uma Safra"
                            />
                            {submitted && (!fazenda.safra || !fazenda.safra.id) && <small className="p-invalid">Safra é obrigatória.</small>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Fazenda;
