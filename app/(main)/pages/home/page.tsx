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
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { FazendaService } from '../../../../service/FazendaService';
import { SafraService } from '../../../../service/SafraService';
import { UsuarioService } from '../../../../service/UsuarioService';

import { Projeto } from '@/types';
import { Toolbar } from 'primereact/toolbar';

const Fazenda = () => {
    let fazendaVazio: Projeto.Fazenda = {
        id: 0,
        nome: '',
        tamanho: '',
        safra: { id: 0, qual_safra: '', usuario: { id: 0, nome: '', senha: '', login: '', telefone: '' } },
        usuario: { id: 0, nome: '', senha: '', login: '', telefone: '' }
    };

    let safraVazia: Projeto.Safra = {
        id: 0,
        qual_safra: '',
        usuario: { id: 0, nome: '', senha: '', login: '', telefone: '' }
    };

    const [fazendas, setFazendas] = useState<Projeto.Fazenda[] | null>(null);
    const [hover, setHover] = useState(false);
    const [fazendaDialog, setFazendaDialog] = useState(false);
    const [fazenda, setFazenda] = useState<Projeto.Fazenda>(fazendaVazio);
    const [selectedFazendas, setSelectedFazendas] = useState<Projeto.Fazenda[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    const fazendaService = new FazendaService();
    const safraService = new SafraService();
    const [userName, setUserName] = useState('');

    const [safras, setSafras] = useState<Projeto.Safra[]>([]);
    const [selectedSafra, setSelectedSafra] = useState<Projeto.Safra | null>(null);

    const [safraDialog, setSafraDialog] = useState(false);
    const [safra, setSafra] = useState<Projeto.Safra>(safraVazia);

    useEffect(() => {
        const userId = localStorage.getItem('USER_ID');
        if (userId) {
            const usuarioService = new UsuarioService();
            usuarioService.buscarPorId(parseInt(userId)).then((response) => {
                setUserName(response.data.nome); // Supondo que a resposta contenha o nome do usuário
            }).catch((error) => {
                console.log(error);
            });

            // Carregar fazendas do usuário logado
            fazendaService.listarPorUsuario(parseInt(userId)).then((response) => {
                setFazendas(response.data);
            }).catch((error) => {
                console.log(error);
            });
        }

        safraService.listarTodos().then((response) => {
            setSafras(response.data);
        }).catch((error) => {
            console.log(error);
        });

    }, []);


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

        const userId = localStorage.getItem('USER_ID');
        if (userId) {
            fazenda.usuario.id = parseInt(userId, 10); // Definir o ID do usuário no objeto fazenda
        } else {
            console.error('User ID não encontrado no localStorage');
            return;
        }

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

    const openNewSafra = () => {
        setSafra(safraVazia);
        setSubmitted(false);
        setSafraDialog(true);
    };

    const hideSafraDialog = () => {
        setSubmitted(false);
        setSafraDialog(false);
    };

    const saveSafra = () => {
        setSubmitted(true);
        console.log('Saving Safra:', safra);

        // Recuperar o ID do usuário do localStorage
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
                        console.log('Insert response:', response);
                        setSafraDialog(false);
                        setSafra(safraVazia);
                        setSafras([]); // Substitua null por []
                        toast.current?.show({
                            severity: 'info',
                            summary: 'Sucesso!',
                            detail: 'Safra cadastrada com sucesso!'
                        });
                    }).catch((error) => {
                        console.log('Insert error:', error);
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
                        console.log('Update response:', response);
                        setSafraDialog(false);
                        setSafra(safraVazia);
                        setSafras([]); // Substitua null por []
                        toast.current?.show({
                            severity: 'info',
                            summary: 'Sucesso!',
                            detail: 'Safra alterada com sucesso!'
                        });
                    }).catch((error) => {
                        console.log('Update error:', error);
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
                    <Button label="Adicionar Fazenda" icon={hover ? "pi pi-plus-circle" : "pi pi-plus"} severity="success" className=" mr-2" onClick={openNew} />
                    <Link href="/pages/editfazenda" passHref>
                        <Button
                            label="Editar Fazenda"
                            icon="pi pi-pencil"
                            severity="warning"
                        />
                    </Link>
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Adicionar Safra" icon="pi pi-plus" severity="info" onClick={openNewSafra} />
            </React.Fragment>
        );
    };

    const fazendaDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Salvar" icon="pi pi-check" text onClick={saveFazenda} />
        </>
    );

    const safraDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideSafraDialog} />
            <Button label="Salvar" icon="pi pi-check" text onClick={saveSafra} />
        </>
    );

    const filteredFazendas = fazendas?.filter(fazenda =>
        (!selectedSafra || (fazenda.safra && fazenda.safra.id === selectedSafra.id)) &&
        (!globalFilter || fazenda.nome.toLowerCase().includes(globalFilter.toLowerCase()))
    );

    const handleFazendaClick = (fazendaId: number | undefined) => {
        if (typeof fazendaId === 'number') {
            localStorage.setItem('FAZENDA_ID', fazendaId.toString());
            window.location.href = '/pages/setor_List';
        } else {
            console.error('Fazenda ID é inválido');
        }
    };
    

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                <h2>Bem Vindo, {userName}</h2>
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

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

                    <div className="flex flex-column gap-3">
                        {filteredFazendas?.map((fazenda) => (
                            <div key={fazenda.id} onClick={() => handleFazendaClick(fazenda.id)}>
                                <Card 
                                    title={`Fazenda: ${fazenda.nome}`} 
                                    subTitle={`Tamanho: ${fazenda.tamanho} | Safra: ${fazenda.safra.qual_safra}`} 
                                    className="fazenda-card"
                                    style={{ cursor: 'pointer' }}
                                >
                                </Card>
                            </div>
                        ))}
                    </div>

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

                    <Dialog visible={safraDialog} style={{ width: '450px' }} header="Detalhes da Safra" modal className="p-fluid" footer={safraDialogFooter} onHide={hideSafraDialog}>
                        <div className="field">
                            <label htmlFor="qual_safra">Qual Safra</label>
                            <InputText
                                id="qual_safra"
                                value={safra.qual_safra}
                                onChange={(e) => setSafra(prevSafra => ({ ...prevSafra, qual_safra: e.target.value }))}
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

export default Fazenda;
