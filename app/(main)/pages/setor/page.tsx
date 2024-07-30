/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { RadioButton, RadioButtonChangeEvent } from 'primereact/radiobutton';
import { Rating } from 'primereact/rating';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { SetorService } from '../../../../service/SetorService';
import { Projeto } from '@/types';
import { FazendaService } from '../../../../service/FazendaService';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';


/* @todo Used 'as any' for types here. Will fix in next version due to onSelectionChange event type issue. */
const Setor = () => {
    let setorVazio: Projeto.Setor = {
        id: 0,
        nome: '',
        tipo_setor: '',
        tamanho: '',
        fazenda: {
            nome: '', tamanho: '', safra: { id: 0, qual_safra: '' }
        }
    };

    const [setores, setSetores] = useState<Projeto.Setor[] | null>(null);
    const [setorDialog, setSetorDialog] = useState(false);
    const [deleteSetorDialog, setDeleteSetorDialog] = useState(false);
    const [deleteSetoresDialog, setDeleteSetoresDialog] = useState(false);
    const [setor, setSetor] = useState<Projeto.Setor>(setorVazio);
    const [selectedSetores, setSelectedSetores] = useState<Projeto.Setor[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const setorService = new SetorService();
    const fazendaService = new FazendaService();
    const [fazendas, setFazendas] = useState<Projeto.Fazenda[]>([]);

    useEffect(() => {
        if (!setores) {
            setorService.listarTodos().then((response) => {
                console.log(response.data);
                setSetores(response.data);  // Atualiza o estado dos recursos
            }).catch((error) => {
                console.log(error);
            });
        }
    }, [setores]);

    useEffect(() => {
        if (setorDialog) {
            fazendaService.listarTodos()
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
    }, [setorDialog, fazendaService]);

    const openNew = () => {
        setSetor(setorVazio);
        setSubmitted(false);
        setSetorDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setSetorDialog(false);
    };

    const hideDeleteSetorDialog = () => {
        setDeleteSetorDialog(false);
    };

    const hideDeleteSetoresDialog = () => {
        setDeleteSetoresDialog(false);
    };

    const saveSetor = () => {
        setSubmitted(true);

        if (!setor.id) {
            setorService.inserir(setor)
                .then((response) => {
                    setSetorDialog(false);
                    setSetor(setorVazio);
                    setSetores(null);
                    toast.current?.show({
                        severity: 'info',
                        summary: 'Sucesso!',
                        detail: 'Setor cadastrado com sucesso!'
                    });
                }).catch((error) => {
                    console.log(error.data.message);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Erro!',
                        detail: 'Erro ao salvar!' + error.data.message
                    })
                });
        } else {
            setorService.alterar(setor)
                .then((response) => {
                    setSetorDialog(false);
                    setSetor(setorVazio);
                    setSetores(null);
                    toast.current?.show({
                        severity: 'info',
                        summary: 'Sucesso!',
                        detail: 'Setor alterado com sucesso!'
                    });
                }).catch((error) => {
                    console.log(error.data.message);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Erro!',
                        detail: 'Erro ao alterar!' + error.data.message
                    })
                })
        }
    }

    const editSetor = (setor: Projeto.Setor) => {
        setSetor({ ...setor });
        setSetorDialog(true);
    };

    const confirmDeleteSetor = (setor: Projeto.Setor) => {
        setSetor(setor);
        setDeleteSetorDialog(true);
    };

    const deleteSetor = () => {
        if (setor.id) {
            setorService.excluir(setor.id).then((response) => {
                setSetor(setorVazio);
                setDeleteSetorDialog(false);
                setSetores(null);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Sucesso!',
                    detail: 'Setor Excluido'
                });
            }).catch((error) => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro!',
                    detail: 'Erro ao Alterar Setor'
                });
            })
        }
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteSetoresDialog(true);
    };

    const deleteSelectedSetores = () => {
        if (selectedSetores) {
            Promise.all(selectedSetores.map(async (_setor) => {
                if (_setor.id !== undefined) {
                    try {
                        await setorService.excluir(_setor.id);
                    } catch (error) {
                        console.error(`Erro ao excluir setor com id ${_setor.id}:`, error);
                        toast.current?.show({
                            severity: 'error',
                            summary: 'Erro!',
                            detail: `Erro ao excluir setor com id ${_setor.id}`
                        });
                    }
                }
            })).then(() => {
                setSetores((prevSetores) => prevSetores?.filter(setor => !selectedSetores.includes(setor)) || []);
                setSelectedSetores([]);
                setDeleteSetoresDialog(false);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Sucesso!',
                    detail: 'Setores excluídos'
                });
            }).catch((error) => {
                console.error('Erro ao excluir setores:', error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro!',
                    detail: 'Erro ao excluir setores'
                });
            });
        }
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
                    <Button label="Excluir" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedSetores || !(selectedSetores as any).length} />
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

    const idBodyTemplate = (rowData: Projeto.Setor) => {
        return (
            <>
                <span className="p-column-title">Código</span>
                {rowData.id}
            </>
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
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editSetor(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteSetor(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gerenciamento de Setores</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const setorDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Salvar" icon="pi pi-check" text onClick={saveSetor} />
        </>
    );
    const deleteSetorDialogFooter = (
        <>
            <Button label="Não" icon="pi pi-times" text onClick={hideDeleteSetorDialog} />
            <Button label="Sim" icon="pi pi-check" text onClick={deleteSetor} />
        </>
    );
    const deleteSetoresDialogFooter = (
        <>
            <Button label="Não" icon="pi pi-times" text onClick={hideDeleteSetoresDialog} />
            <Button label="Sim" icon="pi pi-check" text onClick={deleteSelectedSetores} />
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
                        <Column field="id" header="Codigo" sortable body={idBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="nome" header="Nome" sortable body={nomeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="tipo_setor" header="Tipo Setor" sortable body={tipoSetorBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="tamanho" header="Tamanho" sortable body={tamanhoBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="fazenda" header="Fazenda" sortable body={fazendaBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
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
                            <Dropdown optionLabel="nome" value={setor.fazenda} options={fazendas} filter onChange={(e: DropdownChangeEvent) => onSelectFazendaChange(e.value)} placeholder='Selecione uma fazenda...' />
                            {submitted && !setor.fazenda && <small className="p-invalid">Fazenda é obrigatória.</small>}
                        </div>

                    </Dialog>

                    <Dialog visible={deleteSetorDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteSetorDialogFooter} onHide={hideDeleteSetorDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {setor && (
                                <span>
                                    Tem certeza que deseja excluir <b>{setor.nome}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteSetoresDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteSetoresDialogFooter} onHide={hideDeleteSetoresDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {setor && <span>Tem certeza que deseja excluir os setores selecionados?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Setor;