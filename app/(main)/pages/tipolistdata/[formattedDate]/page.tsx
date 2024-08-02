'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataView, DataViewLayoutOptions } from 'primereact/dataview';
import { Button } from 'primereact/button';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { TipoService } from '../../../../../service/TipoService';
import Link from 'next/link';
import type { Projeto } from '@/types';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload } from 'primereact/fileupload';
import { classNames } from 'primereact/utils';
import { Dropdown as DropdownPrimeReact } from 'primereact/dropdown';
import { SetorService } from '../../../../../service/SetorService';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { useMemo } from 'react';

const TipoListDemo = () => {
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

    const [dataViewValue, setDataViewValue] = useState<Projeto.Tipo[]>([]);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filteredValue, setFilteredValue] = useState<Projeto.Tipo[] | null>(null);
    const [layout, setLayout] = useState<'grid' | 'list' | (string & Record<string, unknown>)>('grid');
    const [sortKey, setSortKey] = useState(null);
    const [sortOrder, setSortOrder] = useState<0 | 1 | -1 | null>(null);
    const [sortField, setSortField] = useState('');
    const [tipoDialog, setTipoDialog] = useState(false);
    const [viewTipoDialog, setViewTipoDialog] = useState(false);
    const [tipo, setTipo] = useState<Projeto.Tipo>(tipoVazio);
    const [setores, setSetores] = useState<Projeto.Setor[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [existingAnexos, setExistingAnexos] = useState<Blob | null>(null);
    const toast = useRef<Toast>(null);
    const tipoService = useMemo(() => new TipoService(), []);
    const setorService = useMemo(() => new SetorService(), []);


    const sortOptions = [
        { label: 'Lucro Maior para Menor', value: '!lucro' },
        { label: 'Lucro Menor para Maior', value: 'lucro' }
    ];

    const tipoOptions = dataViewValue.map(tipo => ({ label: tipo.tipo_atividade, value: tipo.tipo_atividade }));

    useEffect(() => {
        const pathname = window.location.pathname;
        const dateParam = pathname.split('/').pop(); // Extrai a data da URL
        if (dateParam) {
            const formattedDate = dateParam; // Defina `formattedDate` aqui como uma string
            tipoService.listarPorData(formattedDate).then((response) => {
                setDataViewValue(response.data);
            }).catch((error) => {
                console.error(error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar tipos',
                    life: 3000
                });
            });
        }
        setGlobalFilterValue('');
    }, [tipoService]);

    useEffect(() => {
        const usuarioId = localStorage.getItem('USER_ID'); // Obtém o ID do usuário logado

        if (tipoDialog && usuarioId) {
            setorService.listarPorUsuario(Number(usuarioId))
                .then((response) => setSetores(response.data))
                .catch(error => {
                    console.log(error);
                    toast.current?.show({
                        severity: 'info',
                        summary: 'Erro!',
                        detail: 'Erro ao carregar a lista de setores!'
                    });
                });
        }
    }, [tipoDialog, setorService]);

    const onFilterChange = (event: DropdownChangeEvent) => {
        const value = event.value;
        setGlobalFilterValue(value);
        if (value === '') {
            setFilteredValue(null);
        } else {
            const filtered = dataViewValue.filter((tipo) => tipo.tipo_atividade === value);
            setFilteredValue(filtered);
        }
    };

    const onSortChange = (event: DropdownChangeEvent) => {
        const value = event.value;

        if (value.indexOf('!') === 0) {
            setSortOrder(-1);
            setSortField(value.substring(1, value.length));
            setSortKey(value);
        } else {
            setSortOrder(1);
            setSortField(value);
            setSortKey(value);
        }
    };

    const dataViewHeader = (
        <div className="flex flex-column md:flex-row md:justify-content-between gap-2">
            <Dropdown value={sortKey} options={sortOptions} optionLabel="label" placeholder="Ordenar por Lucro" onChange={onSortChange} />
            <Dropdown value={globalFilterValue} options={tipoOptions} optionLabel="label" placeholder="Buscar por Tipo de Atividade" onChange={onFilterChange} />
            <DataViewLayoutOptions layout={layout} onChange={(e) => setLayout(e.value)} />
        </div>
    );

    const openNew = () => {
        const usuarioId = localStorage.getItem('USER_ID');
        if (usuarioId) {
            setorService.listarPorUsuario(Number(usuarioId))
                .then((response) => {
                    setSetores(response.data);
                    setTipo(tipoVazio);
                    setSubmitted(false);
                    setFile(null);
                    setExistingAnexos(null);
                    setTipoDialog(true);
                })
                .catch(error => {
                    console.log(error);
                    toast.current?.show({
                        severity: 'info',
                        summary: 'Erro!',
                        detail: 'Erro ao carregar a lista de setores!'
                    });
                });
        }
    };

    const hideDialog = () => {
        setSubmitted(false);
        setTipoDialog(false);
    };

    const hideViewDialog = () => {
        setViewTipoDialog(false);
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
            formData.append('gasto', tipo.gasto);
            formData.append('lucro', tipo.lucro);
            formData.append('data', tipo.data ? tipo.data.toISOString().split('T')[0] : '');
            formData.append('observacao', tipo.observacao);
            formData.append('setor', tipo.setor.id.toString());

            if (file) {
                formData.append('anexos', file);
            } else if (existingAnexos) {
                formData.append('anexos', existingAnexos);
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
                setFile(null);
                setExistingAnexos(null);
                const pathname = window.location.pathname;
                const dateParam = pathname.split('/').pop(); // Extrai a data da URL
                if (dateParam) {
                    const formattedDate = dateParam; // Defina `formattedDate` aqui como uma string
                    tipoService.listarPorData(formattedDate).then((response) => {
                        setDataViewValue(response.data);
                    }).catch((error) => {
                        console.error(error);
                        toast.current?.show({
                            severity: 'error',
                            summary: 'Erro',
                            detail: 'Erro ao carregar tipos',
                            life: 3000
                        });
                    });
                }
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

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';

        setTipo(prevTipo => ({
            ...prevTipo,
            [name]: val,
        }));
    };

    const onCalendarChange = (e: any) => {
        setTipo(prevTipo => ({
            ...prevTipo,
            data: e.value
        }));
    };

    const onInputNumberChange = (e: any, name: string) => {
        const val = e.value?.toString() || '';
        setTipo(prevTipo => ({
            ...prevTipo,
            [name]: val,
        }));
    };

    const onSelectSetorChange = (setor: Projeto.Setor) => {
        let _tipo = { ...tipo };
        _tipo.setor = setor;
        setTipo(_tipo);
    };

    const setorOptionTemplate = (option: Projeto.Setor) => {
        return (
            <div>
                {option.nome} - {option.fazenda.nome} ({option.fazenda.safra.qual_safra})
            </div>
        );
    };

    const itemTemplate = (data: Projeto.Tipo) => {
        if (!data) {
            return;
        }

        const openViewTipoDialog = () => {
            setTipo({
                ...data,
                data: data.data ? new Date(data.data) : null
            });
            setExistingAnexos(new Blob([data.anexos], { type: 'image/jpeg' }));
            setViewTipoDialog(true);
        };

        if (layout === 'list') {
            return (
                <div className="col-12" onClick={openViewTipoDialog}>
                    <div className="flex flex-column md:flex-row align-items-center p-3 w-full">
                        <img src={`data:image/jpeg;base64,${data.anexos}`} alt={data.tipo_atividade} className="my-4 md:my-0 w-9 md:w-10rem shadow-2 mr-5" />
                        <div className="flex-1 flex flex-column align-items-center text-center md:text-left">
                            <div className="font-bold text-2xl">{data.tipo_atividade}</div>
                            <div className="mb-2">{data.data ? new Date(data.data).toLocaleDateString() : ''}</div>
                            <div className="flex align-items-center">
                                <i className="pi pi-tag mr-2"></i>
                                <span className="font-semibold">{data.gasto}</span>
                            </div>
                        </div>
                        <div className="flex flex-row md:flex-column justify-content-between w-full md:w-auto align-items-center md:align-items-end mt-5 md:mt-0">
                            <span className="text-2xl font-semibold mb-2 align-self-center md:align-self-end">{data.lucro}</span>
                        </div>
                    </div>
                </div>
            );
        } else if (layout === 'grid') {
            return (
                <div className="col-12 lg:col-4" onClick={openViewTipoDialog}>
                    <div className="card m-3 border-1 surface-border">
                        <div className="flex flex-wrap gap-2 align-items-center justify-content-between mb-2">
                            <div className="flex align-items-center">
                                <i className="pi pi-tag mr-2" />
                                <span className="font-semibold">{data.tipo_atividade}</span>
                            </div>
                        </div>
                        <div className="flex flex-column align-items-center text-center mb-3">
                            <img src={`data:image/jpeg;base64,${data.anexos}`} alt={data.tipo_atividade} className="w-9 shadow-2 my-3 mx-0" />
                            <div className="text-2xl font-bold">{data.tipo_atividade}</div>
                            <div className="mb-3">{data.data ? new Date(data.data).toLocaleDateString() : ''}</div>
                        </div>
                    </div>
                </div>
            );
        }
    };

    const tipoDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Salvar" icon="pi pi-check" text onClick={saveTipo} />
        </React.Fragment>
    );

    const viewTipoDialogFooter = (
        <React.Fragment>
            <Button label="Fechar" icon="pi pi-times" text onClick={hideViewDialog} />
            <Button label="Editar" icon="pi pi-pencil" text onClick={() => { setViewTipoDialog(false); setTipoDialog(true); }} />
        </React.Fragment>
    );

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    {tipo && setores.length > 0 && (
                        <h3>Setor {setores[0].nome}</h3>
                    )}
                    <div className="flex justify-content-between align-items-center mb-4">
                        <div className="flex gap-3">
                            <Button
                                label="Adicionar Tipo"
                                icon="pi pi-plus"
                                severity="success"
                                onClick={openNew}
                            />
                            <Link href="/pages/tipo" passHref>
                                <Button
                                    label="Editar Tipo"
                                    icon="pi pi-pencil"
                                    severity="warning"
                                />
                            </Link>
                        </div>
                    </div>
                    <DataView value={filteredValue || dataViewValue} layout={layout} paginator rows={9} sortOrder={sortOrder} sortField={sortField} itemTemplate={itemTemplate} header={dataViewHeader}></DataView>
                </div>
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
                        required
                        mode="decimal"
                        minFractionDigits={2}
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
                        required
                        mode="decimal"
                        minFractionDigits={2}
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
                    <FileUpload mode="basic" name="anexos" accept="image/*" maxFileSize={1000000} customUpload auto uploadHandler={(e) => setFile(e.files[0])} />
                    {submitted && !file && !tipo.anexos && <small className="p-invalid">Foto é requerida.</small>}
                </div>
            </Dialog>

            <Dialog visible={viewTipoDialog} style={{ width: '450px' }} header="Visualizar Tipo" modal className="p-fluid" footer={viewTipoDialogFooter} onHide={hideViewDialog}>
                <div className="field">
                    <label htmlFor="tipo_atividade">Tipo de Atividade</label>
                    <InputText
                        id="tipo_atividade"
                        value={tipo.tipo_atividade}
                        readOnly
                    />
                </div>

                <div className="field">
                    <label htmlFor="data">Data</label>
                    <InputText
                        id="data"
                        value={tipo.data ? tipo.data.toISOString().split('T')[0] : ''}
                        readOnly
                    />
                </div>

                <div className="field">
                    <label htmlFor="gasto">Gasto</label>
                    <InputText
                        id="gasto"
                        value={tipo.gasto}
                        readOnly
                    />
                </div>

                <div className="field">
                    <label htmlFor="lucro">Lucro</label>
                    <InputText
                        id="lucro"
                        value={tipo.lucro}
                        readOnly
                    />
                </div>

                <div className="field">
                    <label htmlFor="observacao">Observação</label>
                    <InputTextarea
                        id="observacao"
                        value={tipo.observacao}
                        readOnly
                    />
                </div>

                <div className="field">
                    <label htmlFor="setor">Setor</label>
                    <InputText
                        id="setor"
                        value={tipo.setor.nome}
                        readOnly
                    />
                </div>

                <div className="field">
                    <label htmlFor="anexos">Foto</label>
                    {tipo.anexos && <img src={`data:image/jpeg;base64,${tipo.anexos}`} alt="Anexo" className="w-full shadow-2" />}
                </div>
            </Dialog>
        </div>
    );
};

export default TipoListDemo;
