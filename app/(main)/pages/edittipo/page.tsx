'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { DropdownChangeEvent, Dropdown as DropdownPrimeReact } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import { Projeto } from '@/types';
import { TipoService } from '../../../../service/TipoService';
import { SetorService } from '../../../../service/SetorService';

const Tipo = () => {
    const tipoVazio: Projeto.Tipo = {
        id: 0,
        tipo_atividade: '',
        data: null,
        gasto: '',
        lucro: '',
        observacao: '',
        anexos: '',
        setor: {
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
        }
    };

    const [tipos, setTipos] = useState<Projeto.Tipo[]>([]);
    const [tipoDialog, setTipoDialog] = useState(false);
    const [deleteTipoDialog, setDeleteTipoDialog] = useState(false);
    const [deleteTiposDialog, setDeleteTiposDialog] = useState(false);
    const [tipo, setTipo] = useState<Projeto.Tipo>(tipoVazio);
    const [selectedTipos, setSelectedTipos] = useState<Projeto.Tipo[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [filterTipoAtividade, setFilterTipoAtividade] = useState<string | null>(null);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const tipoService = new TipoService();
    const setorService = new SetorService();
    const [setores, setSetores] = useState<Projeto.Setor[]>([]);
    const [filterFazenda, setFilterFazenda] = useState<number | null>(null);
    const [fazendas, setFazendas] = useState<Projeto.Fazenda[]>([]);


    useEffect(() => {
        const usuarioId = localStorage.getItem('USER_ID');
        if (!usuarioId) {
            window.location.href = '/login';
            return;
        }

        tipoService.listarPorUsuario(Number(usuarioId)).then((response) => {
            setTipos(response.data);
        }).catch((error) => {
            console.log(error);
            toast.current?.show({
                severity: 'error',
                summary: 'Erro!',
                detail: 'Erro ao carregar tipos de atividade!'
            });
        });
    }, []);

    useEffect(() => {
        const usuarioId = localStorage.getItem('USER_ID');
        if (!usuarioId) {
            window.location.href = '/login';
            return;
        }

        if (tipoDialog) {
            setorService.listarPorUsuario(Number(usuarioId))
                .then((response) => setSetores(response.data))
                .catch(error => {
                    console.log(error);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Erro!',
                        detail: 'Erro ao carregar a lista de setores!'
                    });
                });
        }
    }, [tipoDialog]);
    

    const openNew = () => {
        setTipo(tipoVazio);
        setSubmitted(false);
        setFile(null);
        setTipoDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setTipoDialog(false);
    };

    const hideDeleteTipoDialog = () => {
        setDeleteTipoDialog(false);
    };

    const hideDeleteTiposDialog = () => {
        setDeleteTiposDialog(false);
    };

    const saveTipo = async () => {
        setSubmitted(true);

        if (!tipo.setor || !tipo.setor.id) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro!',
                detail: 'Setor é obrigatório.'
            });
            return;
        }

        try {
            const formData = new FormData();
            formData.append('tipo_atividade', tipo.tipo_atividade);
            formData.append('gasto', tipo.gasto.replace(",", "."));
            formData.append('lucro', tipo.lucro.replace(",", "."));
            formData.append('data', tipo.data ? tipo.data.toISOString().split('T')[0] : '');
            formData.append('observacao', tipo.observacao);
            formData.append('setor', tipo.setor.id.toString());

            if (file) {
                formData.append('anexos', file);
            }

            let response;
            if (!tipo.id) {
                response = await tipoService.inserir(formData);
            } else {
                response = await tipoService.alterarTipo(tipo.id, formData);
            }

            if (response.status === 200 || response.status === 201) {
                setTipoDialog(false);
                setTipo(tipoVazio);
                setTipos([]);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Sucesso!',
                    detail: !tipo.id ? 'Tipo Inserido' : 'Tipo Alterado'
                });
            } else {
                throw new Error('Falha ao salvar o tipo');
            }

        } catch (error) {
            console.error('Erro ao Inserir/Alterar Tipo:', error);

            toast.current?.show({
                severity: 'error',
                summary: 'Erro!',
                detail: 'Erro ao Inserir/Alterar Tipo'
            });
        }
    };

    const handleFileUpload = (event: any) => {
        setFile(event.files[0]);
    };

    const editTipo = (tipo: Projeto.Tipo) => {
        setTipo({ ...tipo, data: tipo.data ? new Date(tipo.data) : null });
        setFile(null);
        setTipoDialog(true);
    };

    const confirmDeleteTipo = (tipo: Projeto.Tipo) => {
        setTipo(tipo);
        setDeleteTipoDialog(true);
    };

    const deleteTipo = () => {
        if (tipo.id) {
            tipoService.excluir(tipo.id).then((response) => {
                setTipo(tipoVazio);
                setDeleteTipoDialog(false);
                setTipos([]);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Sucesso!',
                    detail: 'Tipo Excluído'
                });
            }).catch((error) => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro!',
                    detail: 'Erro ao Excluir Tipo'
                });
            });
        }
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteTiposDialog(true);
    };

    const setorOptionTemplate = (option: Projeto.Setor) => {
        return (
            <div>
                {option.nome} - {option.fazenda.nome} ({option.fazenda.safra.qual_safra})
            </div>
        );
    };

    const deleteSelectedTipos = () => {
        if (selectedTipos) {
            Promise.all(selectedTipos.map(async (_tipo) => {
                if (_tipo.id !== undefined) {
                    try {
                        await tipoService.excluir(_tipo.id);
                    } catch (error) {
                        console.error(`Erro ao excluir tipo com id ${_tipo.id}:`, error);
                        toast.current?.show({
                            severity: 'error',
                            summary: 'Erro!',
                            detail: `Erro ao excluir tipo com id ${_tipo.id}`
                        });
                    }
                }
            })).then(() => {
                setTipos((prevTipos) => prevTipos?.filter(tipo => !selectedTipos.includes(tipo)) || []);
                setSelectedTipos([]);
                setDeleteTiposDialog(false);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Sucesso!',
                    detail: 'Tipos excluídos'
                });
            }).catch((error) => {
                console.error('Erro ao excluir tipos:', error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro!',
                    detail: 'Erro ao excluir tipos'
                });
            });
        }
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';

        setTipo(prevTipo => ({
            ...prevTipo,
            [name]: val,
        }));
    };

    const onFileSelect = (e: any) => {
        setFile(e.files[0]);
    };

    const onCalendarChange = (e: any) => {
        setTipo(prevTipo => ({
            ...prevTipo,
            data: e.value
        }));
    };

    const onInputNumberChange = (e: any, name: string) => {
        const val = e.value !== null ? e.value.toString().replace(".", ",") : '';

        setTipo(prevTipo => ({
            ...prevTipo,
            [name]: val,
        }));
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Excluir" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedTipos || !selectedTipos.length} />
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

    const actionBodyTemplate = (rowData: Projeto.Tipo) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editTipo(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteTipo(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
          <h3 className="m-0">Editar Tipo de Atividade</h3>
          <div className="flex flex-column md:flex-row mt-2 md:mt-0">
            <DropdownPrimeReact
              value={filterTipoAtividade}
              options={tipos.map((tipo) => ({ label: tipo.tipo_atividade, value: tipo.tipo_atividade }))}
              onChange={(e: DropdownChangeEvent) => setFilterTipoAtividade(e.value)}
              placeholder="Filtrar por Tipo de Atividade"
              className="w-full md:w-auto md:mr-2"
            />
            <DropdownPrimeReact
              value={filterFazenda}
              options={tipos
                .map((tipo) => ({
                  label: `${tipo.setor.fazenda.nome} (${tipo.setor.fazenda.safra.qual_safra})`,
                  value: tipo.setor.fazenda.id,
                }))
                .filter((v, i, a) => a.findIndex((t) => t.value === v.value) === i)}
              onChange={(e: DropdownChangeEvent) => setFilterFazenda(e.value)}
              placeholder="Filtrar por Fazenda"
              className="w-full md:w-auto mt-2 md:mt-0"
            />
          </div>
        </div>
      );
      

    const tipoDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Salvar" icon="pi pi-check" text onClick={saveTipo} />
        </React.Fragment>
    );

    const deleteTipoDialogFooter = (
        <React.Fragment>
            <Button label="Não" icon="pi pi-times" text onClick={hideDeleteTipoDialog} />
            <Button label="Sim" icon="pi pi-check" text onClick={deleteTipo} />
        </React.Fragment>
    );

    const deleteTiposDialogFooter = (
        <React.Fragment>
            <Button label="Não" icon="pi pi-times" text onClick={hideDeleteTiposDialog} />
            <Button label="Sim" icon="pi pi-check" text onClick={deleteSelectedTipos} />
        </React.Fragment>
    );

    const onSelectSetorChange = (setor: Projeto.Setor) => {
        let _tipo = { ...tipo };
        _tipo.setor = setor;
        setTipo(_tipo);
    };

    const filteredTipos = tipos.filter((tipo) => {
        return (
            (filterFazenda ? tipo.setor?.fazenda?.id === filterFazenda : true) && // Filtro por fazenda
            (filterTipoAtividade ? tipo.tipo_atividade === filterTipoAtividade : true) && // Filtro por tipo de atividade
            (globalFilter ? tipo.tipo_atividade.toLowerCase().includes(globalFilter.toLowerCase()) : true) // Filtro global
        );
    });

    return (
        <div className="datatable-crud-demo">
            <div className="card">
                <Toast ref={toast} />
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

                <DataTable
                    ref={dt}
                    value={filteredTipos}
                    selection={selectedTipos}
                    onSelectionChange={(e) => setSelectedTipos(e.value)}
                    dataKey="id"
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    className="datatable-responsive"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} tipos"
                    globalFilter={globalFilter}
                    emptyMessage="Nenhum tipo encontrado."
                    header={header}
                    responsiveLayout="scroll"
                >
                    <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                    <Column field="tipo_atividade" header="Tipo de Atividade" sortable></Column>
                    <Column field="setor.nome" header="Setor" sortable></Column>
                    <Column field="setor.fazenda.nome" header="Fazenda" sortable></Column>
                    <Column field="setor.fazenda.safra.qual_safra" header="Safra" sortable></Column>
                    <Column body={actionBodyTemplate}></Column>
                </DataTable>
            </div>

            <Dialog visible={tipoDialog} style={{ width: '450px' }} header="Detalhes do Tipo" modal className="p-fluid" footer={tipoDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="tipo_atividade">Tipo de Atividade</label>
                    <InputText
                        id="tipo_atividade"
                        value={tipo.tipo_atividade}
                        onChange={(e) => onInputChange(e, 'tipo_atividade')}
                        required
                        autoFocus
                        className={classNames({
                            'p-invalid': submitted && !tipo.tipo_atividade
                        })}
                    />
                    {submitted && !tipo.tipo_atividade && <small className="p-invalid">Tipo de Atividade é requerido.</small>}
                </div>

                <div className="field">
                    <label htmlFor="data">Data</label>
                    <Calendar
                        id="data"
                        value={tipo.data}
                        onChange={onCalendarChange}
                        required
                        showIcon
                        className={classNames({
                            'p-invalid': submitted && !tipo.data
                        })}
                    />
                    {submitted && !tipo.data && <small className="p-invalid">Data é requerida.</small>}
                </div>

                <div className="field">
                    <label htmlFor="gasto">Gasto</label>
                    <InputNumber
                        id="gasto"
                        value={parseFloat(tipo.gasto)}
                        onValueChange={(e) => onInputNumberChange(e, 'gasto')}
                        mode="decimal"
                        minFractionDigits={2}
                        maxFractionDigits={2}
                        required
                        className={classNames({
                            'p-invalid': submitted && !tipo.gasto
                        })}
                    />
                    {submitted && !tipo.gasto && <small className="p-invalid">Gasto é requerido.</small>}
                </div>

                <div className="field">
                    <label htmlFor="lucro">Lucro</label>
                    <InputNumber
                        id="lucro"
                        value={parseFloat(tipo.lucro)}
                        onValueChange={(e) => onInputNumberChange(e, 'lucro')}
                        mode="decimal"
                        minFractionDigits={2}
                        maxFractionDigits={2}
                        required
                        className={classNames({
                            'p-invalid': submitted && !tipo.lucro
                        })}
                    />
                    {submitted && !tipo.lucro && <small className="p-invalid">Lucro é requerido.</small>}
                </div>

                <div className="field">
                    <label htmlFor="observacao">Observação</label>
                    <InputTextarea
                        id="observacao"
                        value={tipo.observacao}
                        onChange={(e) => onInputChange(e, 'observacao')}
                        required
                        className={classNames({
                            'p-invalid': submitted && !tipo.observacao
                        })}
                    />
                    {submitted && !tipo.observacao && <small className="p-invalid">Observação é requerida.</small>}
                </div>

                <div className="field">
                    <label htmlFor="setor">Setor</label>
                    <DropdownPrimeReact
                        value={tipo.setor}
                        options={setores}
                        onChange={(e: DropdownChangeEvent) => onSelectSetorChange(e.value)}
                        optionLabel="nome"
                        placeholder="Selecione um setor..."
                        filter
                        itemTemplate={setorOptionTemplate}
                    />
                    {submitted && (!tipo.setor || !tipo.setor.id) && <small className="p-invalid">Setor é obrigatório.</small>}
                </div>

                <div className="field">
                    <label htmlFor="anexos">Foto</label>
                    <FileUpload mode="basic" name="anexos" accept="image/*" maxFileSize={1000000} customUpload auto uploadHandler={onFileSelect} />
                    {submitted && !file && <small className="p-invalid">Foto é requerida.</small>}
                </div>
            </Dialog>

            <Dialog visible={deleteTipoDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteTipoDialogFooter} onHide={hideDeleteTipoDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {tipo && <span>Tem certeza que deseja excluir o tipo <b>{tipo.tipo_atividade}</b>?</span>}
                </div>
            </Dialog>

            <Dialog visible={deleteTiposDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteTiposDialogFooter} onHide={hideDeleteTiposDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {selectedTipos && <span>Tem certeza que deseja excluir os tipos selecionados?</span>}
                </div>
            </Dialog>
        </div>
    );
};

export default Tipo;
