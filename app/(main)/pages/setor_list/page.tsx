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
import { SetorService } from '../../../../service/SetorService';
import { Projeto } from '@/types';
import { FazendaService } from '../../../../service/FazendaService';
import { useRouter } from 'next/router';

const Setor = () => {
    const setorVazio: Projeto.Setor = {
        id: 0,
        nome: '',
        tipo_setor: '',
        tamanho: '',
        fazenda: {
            id: 0,
            nome: '',
            tamanho: '',
            safra: { id: 0, qual_safra: '', usuario: { id: 0, nome: '', senha: '', login: '', telefone: '' } },
            usuario: { id: 0, nome: '', senha: '', login: '', telefone: '' }
        }
    };

    const [setores, setSetores] = useState<Projeto.Setor[] | null>(null);
    const [setorDialog, setSetorDialog] = useState(false);
    const [setor, setSetor] = useState<Projeto.Setor>(setorVazio);
    const [selectedSetores, setSelectedSetores] = useState<Projeto.Setor[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const setorService = new SetorService();
    const fazendaService = new FazendaService();
    const [fazendas, setFazendas] = useState<Projeto.Fazenda[]>([]);
    const router = useRouter();
    const { fazendaId } = router.query;

    useEffect(() => {
        if (fazendaId) {
            fetchSetores(parseInt(fazendaId as string, 10));
        }
    }, [fazendaId]);

    useEffect(() => {
        if (setorDialog) {
            fazendaService.listarTodos()
                .then((response) => setFazendas(response.data))
                .catch((error) => {
                    console.log("Erro ao carregar fazendas:", error);
                    toast.current?.show({
                        severity: 'info',
                        summary: 'Erro!',
                        detail: 'Erro ao carregar a lista de fazendas!'
                    });
                });
        }
    }, [setorDialog]);

    const fetchSetores = (fazendaId: number) => {
        setorService.listarPorFazenda(fazendaId).then((response) => {
            setSetores(response.data);
        }).catch((error) => {
            console.error("Erro ao carregar setores:", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao carregar setores',
                life: 3000
            });
        });
    };

    const openNew = () => {
        setSetor(setorVazio);
        setSubmitted(false);
        setSetorDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setSetorDialog(false);
    };

    const saveSetor = () => {
        setSubmitted(true);
        if (!setor.id) {
            setorService.inserir(setor)
                .then(() => {
                    setSetorDialog(false);
                    setSetor(setorVazio);
                    fetchSetores(parseInt(fazendaId as string, 10));
                    toast.current?.show({
                        severity: 'info',
                        summary: 'Sucesso!',
                        detail: 'Setor cadastrado com sucesso!'
                    });
                }).catch((error) => {
                    console.log(error.response?.data.message);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Erro!',
                        detail: 'Erro ao salvar! ' + error.response?.data.message
                    });
                });
        } else {
            setorService.alterar(setor)
                .then(() => {
                    setSetorDialog(false);
                    setSetor(setorVazio);
                    fetchSetores(parseInt(fazendaId as string, 10));
                    toast.current?.show({
                        severity: 'info',
                        summary: 'Sucesso!',
                        detail: 'Setor alterado com sucesso!'
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
    }

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        setSetor(prevSetor => ({
            ...prevSetor,
            [name]: val,
        }));
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
        return (
            <React.Fragment>
            </React.Fragment>
        );
    };

    const fazendaOptionTemplate = (option: Projeto.Fazenda) => {
        return (
            <div>
                {option.nome} - {option.safra.qual_safra}
            </div>
        );
    };

    const nomeBodyTemplate = (rowData: Projeto.Setor) => {
        return (
            <>
                <span className="p-column-title">Nome</span>
                {rowData.nome}
            </>
        );
    };

    const tamanhoBodyTemplate = (rowData: Projeto.Setor) => {
        return (
            <>
                <span className="p-column-title">Tamanho</span>
                {rowData.tamanho}
            </>
        );
    };

    const tipoSetorBodyTemplate = (rowData: Projeto.Setor) => {
        return (
            <>
                <span className="p-column-title">Tipo Setor</span>
                {rowData.tipo_setor}
            </>
        );
    };

    const fazendaBodyTemplate = (rowData: Projeto.Setor) => {
        return (
            <>
                <span className="p-column-title">Fazenda</span>
                {rowData.fazenda.nome}
            </>
        );
    };

    const actionBodyTemplate = (rowData: Projeto.Setor) => {
        return (
            <>
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h3 className="m-0">Adicionar Setores</h3>
        </div>
    );

    const setorDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Salvar" icon="pi pi-check" text onClick={saveSetor} />
        </>
    );

    const onSelectFazendaChange = (fazenda: Projeto.Fazenda) => {
        let _setor = { ...setor };
        _setor.fazenda = fazenda;
        setSetor(_setor);
    }

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={setores}
                        selection={selectedSetores}
                        onSelectionChange={(e) => setSelectedSetores(e.value as any)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} até {last} de {totalRecords} setores"
                        globalFilter={globalFilter}
                        emptyMessage="Nenhum Setor Encontrado"
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        <Column field="nome" header="Nome" sortable body={nomeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="tipo_setor" header="Tipo Setor" sortable body={tipoSetorBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="tamanho" header="Tamanho" sortable body={tamanhoBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="fazenda" header="Fazenda" sortable body={fazendaBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                    </DataTable>

                    <Dialog visible={setorDialog} style={{ width: '450px' }} header="Detalhes do Setor" modal className="p-fluid" footer={setorDialogFooter} onHide={hideDialog}>

                        <div className="field">
                            <label htmlFor="nome">Nome</label>
                            <InputText
                                id="nome"
                                value={setor.nome}
                                onChange={(e) => onInputChange(e, 'nome')}
                                required
                                autoFocus
                                className={classNames({
                                    'p-invalid': submitted && !setor.nome
                                })}
                            />
                            {submitted && !setor.nome && <small className="p-invalid">Nome é Obrigatorio.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="tamanho">Tamanho</label>
                            <InputText
                                id="tamanho"
                                value={setor.tamanho}
                                onChange={(e) => onInputChange(e, 'tamanho')}
                                required
                                className={classNames({
                                    'p-invalid': submitted && !setor.tamanho
                                })}
                            />
                            {submitted && !setor.tamanho && <small className="p-invalid">Tamanho é Obrigatorio.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="tipo_setor">Tipo Setor</label>
                            <InputText
                                id="tipo_setor"
                                value={setor.tipo_setor}
                                onChange={(e) => onInputChange(e, 'tipo_setor')}
                                required
                                className={classNames({
                                    'p-invalid': submitted && !setor.tipo_setor
                                })}
                            />
                            {submitted && !setor.tipo_setor && <small className="p-invalid">Tipo Setor é Obrigatorio.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="fazenda">Fazenda</label>
                            <Dropdown
                                value={setor.fazenda}
                                options={fazendas}
                                onChange={(e: DropdownChangeEvent) => onSelectFazendaChange(e.value)}
                                optionLabel="nome"
                                placeholder="Selecione uma fazenda..."
                                filter
                                itemTemplate={fazendaOptionTemplate}
                            />
                            {submitted && !setor.fazenda && <small className="p-invalid">Fazenda é obrigatória.</small>}
                        </div>

                    </Dialog>

                </div>
            </div>
        </div>
    );
};

export default Setor;
