/* eslint-disable @next/next/no-img-element */
'use client';
import Link from 'next/link';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import React, { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Projeto } from '@/types';
import { SetorService } from '../../../../service/SetorService';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { FazendaService } from '../../../../service/FazendaService';

const SetorList: React.FC = () => {
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
    const [hover, setHover] = useState(false);
    const [setorDialog, setSetorDialog] = useState(false);
    const [setor, setSetor] = useState<Projeto.Setor>(setorVazio);
    const [submitted, setSubmitted] = useState(false);
    const [fazendas, setFazendas] = useState<Projeto.Fazenda[]>([]);
    const [tipoSetores, setTipoSetores] = useState<string[]>([]);
    const [selectedTipoSetor, setSelectedTipoSetor] = useState<string | null>(null);
    const toast = useRef<Toast>(null);
    const setorService = new SetorService();
    const fazendaService = new FazendaService();

    useEffect(() => {
        const fazendaId = localStorage.getItem('FAZENDA_ID');
        if (fazendaId) {
            const id = parseInt(fazendaId, 10);
            console.log('ID da fazenda do localStorage:', id);

            fazendaService.buscarPorId(id).then((response: any) => {
                console.log("Nome da fazenda obtido:", response.data.nome);
                setSetor(prevSetor => ({
                    ...prevSetor,
                    fazenda: response.data
                }));
            }).catch((error: any) => {
                console.error("Erro ao buscar a fazenda:", error);
            });

            fetchSetores(id);
        } else {
            console.error("ID da fazenda não encontrado no localStorage");
        }
    }, []);

    const fetchSetores = (fazendaId: number) => {
        console.log('Fazendo requisição para listar setores da fazenda ID:', fazendaId);
        setorService.listarPorFazenda(fazendaId).then((response: any) => {
            console.log('Resposta da requisição listarPorFazenda:', response.data);
            setSetores(response.data);

            const tiposUnicos = Array.from(new Set(response.data.map((setor: Projeto.Setor) => setor.tipo_setor))) as string[];
            setTipoSetores(tiposUnicos);
        }).catch((error: any) => {
            console.error("Erro ao carregar setores:", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao carregar setores',
                life: 3000
            });
        });
    };

    useEffect(() => {
        if (setorDialog) {
            const usuarioId = localStorage.getItem('USER_ID');
            if (usuarioId) {
                fazendaService.listarPorUsuario(Number(usuarioId))
                    .then((response: any) => setFazendas(response.data))
                    .catch((error: any) => {
                        console.log("Erro ao carregar fazendas:", error);
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
        const usuarioId = localStorage.getItem('USER_ID');
        const fazendaId = localStorage.getItem('FAZENDA_ID');
        if (usuarioId && fazendaId) {
            fazendaService.listarPorUsuario(Number(usuarioId))
                .then((response) => {
                    setFazendas(response.data);
                    const fazenda = response.data.find((fazenda: Projeto.Fazenda) => fazenda.id === parseInt(fazendaId, 10)) || setorVazio.fazenda;
                    setSetor({
                        ...setorVazio,
                        fazenda
                    });
                    setSubmitted(false);
                    setSetorDialog(true);
                })
                .catch(error => {
                    console.log(error);
                    toast.current?.show({
                        severity: 'info',
                        summary: 'Erro!',
                        detail: 'Erro ao carregar a lista de fazendas!'
                    });
                });
        }
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
                    setSetorDialog(false);
                    setSetor(setorVazio);
                    const fazendaId = localStorage.getItem('FAZENDA_ID');
                    if (fazendaId !== null) {
                        fetchSetores(parseInt(fazendaId, 10));
                    }
                    toast.current?.show({
                        severity: 'info',
                        summary: 'Sucesso!',
                        detail: 'Setor cadastrado com sucesso!'
                    });
                }).catch((error) => {
                    console.log(error.response?.data?.message);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Erro!',
                        detail: 'Erro ao salvar! ' + error.response?.data?.message
                    })
                });
        } else {
            setorService.alterar(setor)
                .then((response) => {
                    setSetorDialog(false);
                    setSetor(setorVazio);
                    const fazendaId = localStorage.getItem('FAZENDA_ID');
                    if (fazendaId !== null) {
                        fetchSetores(parseInt(fazendaId, 10));
                    }
                    toast.current?.show({
                        severity: 'info',
                        summary: 'Sucesso!',
                        detail: 'Setor alterado com sucesso!'
                    });
                }).catch((error) => {
                    console.log(error.response?.data?.message);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Erro!',
                        detail: 'Erro ao alterar! ' + error.response?.data?.message
                    })
                })
        }
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';

        setSetor(prevSetor => ({
            ...prevSetor,
            [name]: val,
        }));
    };

    const onSelectFazendaChange = (fazenda: Projeto.Fazenda) => {
        setSetor(prevSetor => ({
            ...prevSetor,
            fazenda
        }));
    };

    const fazendaOptionTemplate = (option: Projeto.Fazenda) => {
        return (
            <div>
                {option.nome} - {option.safra.qual_safra}
            </div>
        );
    };

    const setorDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Salvar" icon="pi pi-check" text onClick={saveSetor} />
        </>
    );

    const onTipoSetorChange = (e: DropdownChangeEvent) => {
        setSelectedTipoSetor(e.value);
    };

    const filteredSetores = setores?.filter(setor => !selectedTipoSetor || setor.tipo_setor === selectedTipoSetor);

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    {setores && setores.length > 0 && (
                        <h3>Setores da {setores[0].fazenda.nome} {setores[0].fazenda.safra.qual_safra} </h3>
                    )}
                    <div className="flex justify-content-between align-items-center mb-4">
                        <div className="flex gap-3">
                            <Button 
                                label="Adicionar Setor" 
                                icon={hover ? "pi pi-plus-circle" : "pi pi-plus"} 
                                severity="success" 
                                onClick={openNew}
                                onMouseEnter={() => setHover(true)}
                                onMouseLeave={() => setHover(false)}
                            />
                            <Link href="/pages/setor" passHref>
                                <Button
                                    label="Editar Setor"
                                    icon="pi pi-pencil"
                                    severity="warning"
                                />
                            </Link>
                        </div>
                        <div className="flex align-items-center">
                            <Dropdown
                                value={selectedTipoSetor}
                                options={tipoSetores.map(tipo => ({ label: tipo, value: tipo }))}
                                onChange={onTipoSetorChange}
                                placeholder="Selecione um Tipo de Setor"
                                className="mr-2"
                            />
                        </div>
                    </div>
                    <div className="flex flex-column gap-3">
                        {filteredSetores?.map((setor) => (
                            <Link key={setor.id} href={`/pages/tipoList/${setor.id}`} legacyBehavior>
                                <a style={{ textDecoration: 'none' }}>
                                    <Card 
                                        title={`Setor: ${setor.nome}`} 
                                        subTitle={`Fazenda: ${setor.fazenda.nome} | Safra: ${setor.fazenda.safra.qual_safra}`} 
                                        className="setor-card"
                                        style={{ cursor: 'pointer' }}
                                    >
                                    </Card>
                                </a>
                            </Link>
                        ))}
                    </div>

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

export default SetorList;
