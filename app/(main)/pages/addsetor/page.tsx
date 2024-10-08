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
import { gerarRelatorioSetor } from '@/service/PdfReportService';

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
            safra: {
                id: 0,
                qual_safra: '',
                usuario: { id: 0, nome: '', senha: '', login: '', telefone: '' }
            },
            usuario: { id: 0, nome: '', senha: '', login: '', telefone: '' }
        }
    };

    const [setores, setSetores] = useState<Projeto.Setor[] | null>(null);
    const [setorDialog, setSetorDialog] = useState(false);
    const [setor, setSetor] = useState<Projeto.Setor>(setorVazio);
    const [selectedSetores, setSelectedSetores] = useState<Projeto.Setor[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [selectedTipoSetor, setSelectedTipoSetor] = useState<string | null>(null);
    const [tipoSetores, setTipoSetores] = useState<string[]>([]);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const setorService = new SetorService();
    const fazendaService = new FazendaService();
    const [fazendas, setFazendas] = useState<Projeto.Fazenda[]>([]);

    useEffect(() => {
        const userId = localStorage.getItem('USER_ID');
        if (userId) {
            setorService.listarPorUsuario(parseInt(userId)).then((response) => {
                const setoresData = response.data;
                console.log(setoresData);
                setSetores(setoresData);

                // Extrair tipos de setor únicos
                const tiposUnicos = Array.from(new Set(setoresData.map((setor: Projeto.Setor) => setor.tipo_setor))) as string[];
                setTipoSetores(tiposUnicos);
            }).catch((error) => {
                console.log(error);
            });
        }
    }, []);

    useEffect(() => {
        if (setorDialog) {
            const userId = localStorage.getItem('USER_ID');
            if (userId) {
                fazendaService.listarPorUsuario(parseInt(userId))
                    .then((response) => setFazendas(response.data))
                    .catch(error => {
                        console.log(error);
                        toast.current?.show({
                            severity: 'info',
                            summary: 'Erro!',
                            detail: 'Erro ao carregar a lista de fazendas!'
                        });
                    });
            }
        }
    }, [setorDialog]);

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
                .then((response) => {
                    const userId = localStorage.getItem('USER_ID');
                    setSetorDialog(false);
                    setSetor(setorVazio);
                    setorService.listarPorUsuario(parseInt(userId || '0')).then((response) => {
                        setSetores(response.data);
                    }).catch((error) => {
                        console.log(error);
                    });
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
                    })
                });
        } else {
            setorService.alterar(setor)
                .then((response) => {
                    const userId = localStorage.getItem('USER_ID');
                    setSetorDialog(false);
                    setSetor(setorVazio);
                    setorService.listarPorUsuario(parseInt(userId || '0')).then((response) => {
                        setSetores(response.data);
                    }).catch((error) => {
                        console.log(error);
                    });
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
                    })
                })
        }
    }

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

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
                <Button
                    label="Gerar PDF"
                    icon="pi pi-file-pdf"
                    severity="info"
                    className="p-button-info mr-2"
                    onClick={generatePDF} // Função para gerar PDF
                    disabled={selectedSetores.length === 0} // Desabilita o botão se nenhum setor for selecionado
                />
            </React.Fragment>
        );
    };

    const generatePDF = async () => {
        if (selectedSetores.length === 0) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Nenhum setor selecionado!' });
            return;
        }

        for (const setor of selectedSetores) {
            if (setor.id) {
                try {
                    await gerarRelatorioSetor(setor.id);
                } catch (error) {
                    console.error("Erro ao gerar relatório para o setor: ", setor.nome, error);
                    toast.current?.show({ severity: 'error', summary: 'Erro', detail: `Erro ao gerar PDF para o setor ${setor.nome}.` });
                }
            } else {
                console.error("Setor sem ID: ", setor);
                toast.current?.show({ severity: 'error', summary: 'Erro', detail: `Setor ${setor.nome} está sem ID!` });
            }
        }

        toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'PDF gerado com sucesso!' });
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

    const safraBodyTemplate = (rowData: Projeto.Setor) => {
        return (
            <>
                <span className="p-column-title">Safra</span>
                {rowData.fazenda.safra.qual_safra}
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
                {/* Ações (se necessário) */}
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h3 className="m-0">Adicionar Setores</h3>
            <div className="flex flex-column md:flex-row mt-2 md:mt-0">
                <span className="p-input-icon-left md:mr-2">
                    <i className="pi pi-search" />
                    <InputText
                        type="search"
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Buscar por nome..."
                        className="w-full"
                    />
                </span>
                <Dropdown
                    value={selectedTipoSetor}
                    options={tipoSetores.map(tipo => ({ label: tipo, value: tipo }))}
                    onChange={(e: DropdownChangeEvent) => setSelectedTipoSetor(e.value)}
                    placeholder="Selecione um Tipo de Setor"
                    className="mt-2 md:ml-2 md:mt-0 w-full md:w-auto"
                />
            </div>
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

    const filteredSetores = setores?.filter(setor =>
        (!selectedTipoSetor || setor.tipo_setor === selectedTipoSetor) &&
        (!globalFilter || setor.nome.toLowerCase().includes(globalFilter.toLowerCase()))
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={filteredSetores}
                        selection={selectedSetores}
                        onSelectionChange={(e) => setSelectedSetores(e.value as any)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} até {last} de {totalRecords} setores"
                        emptyMessage="Nenhum Setor Encontrado"
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        <Column field="nome" header="Nome" sortable body={nomeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="tipo_setor" header="Tipo Setor" sortable body={tipoSetorBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="fazenda" header="Fazenda" sortable body={fazendaBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="safra" header="Safra" sortable body={safraBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
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
                                autoFocus
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
                                autoFocus
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
