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
import 'primeflex/primeflex.css'; // Importa o PrimeFlex
import styles from '../../../../styles/Fazenda.module.scss'; // Importa o CSS Module personalizado

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
    const [safraDialog, setSafraDialog] = useState(false);
    const [listarSafrasDialog, setListarSafrasDialog] = useState(false);
    const [fazenda, setFazenda] = useState<Projeto.Fazenda>(fazendaVazio);
    const [safrasRelacionadas, setSafrasRelacionadas] = useState<Projeto.Safra[]>([]);
    const [selectedFazenda, setSelectedFazenda] = useState<Projeto.Fazenda | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    const fazendaService = new FazendaService();
    const safraService = new SafraService();
    const [userName, setUserName] = useState('');
    const [safras, setSafras] = useState<Projeto.Safra[]>([]);
    const [selectedSafra, setSelectedSafra] = useState<Projeto.Safra | null>(null);
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

            safraService.listarPorUsuario(parseInt(userId)).then((response) => {
                setSafras(response.data);
            }).catch((error) => {
                console.log(error);
            });
        }       

    }, []);

    const openNewFazenda = () => {
        setFazenda(fazendaVazio);
        setSubmitted(false);
        setFazendaDialog(true);
    };

    const openNewSafra = () => {
        setSafra(safraVazia);
        setSubmitted(false);
        setSafraDialog(true);
    };

    const hideFazendaDialog = () => {
        setFazendaDialog(false);
    };

    const hideSafraDialog = () => {
        setSafraDialog(false);
    };

    const hideListarSafrasDialog = () => {
        setListarSafrasDialog(false);
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

    const onSelectSafraChange = (e: DropdownChangeEvent) => {
        const val = e.value;
        setSelectedSafra(val);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className={styles.toolbarContainer}>
                    <Button label="Adicionar Fazenda" icon={hover ? "pi pi-plus-circle" : "pi pi-plus"} severity="success" className={styles.buttonSpacing} onClick={openNewFazenda} />
                    <Link href="/pages/editfazenda" passHref>
                        <Button
                            label="Editar Fazenda"
                            icon="pi pi-pencil"
                            severity="warning"
                            className={styles.buttonSpacing}
                        />
                    </Link>
                    <Button label="Adicionar Safra" icon="pi pi-plus" severity="info" className={styles.buttonSpacing} onClick={openNewSafra} />
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return null;
    };

    const fazendaDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideFazendaDialog} />
            <Button label="Salvar" icon="pi pi-check" text onClick={saveFazenda} />
        </>
    );

    const safraDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideSafraDialog} />
            <Button label="Salvar" icon="pi pi-check" text onClick={saveSafra} />
        </>
    );

    const listarSafrasDialogFooter = (
        <>
            <Button label="Fechar" icon="pi pi-times" text onClick={hideListarSafrasDialog} />
        </>
    );

    const filteredFazendas = fazendas?.filter(fazenda =>
        (!selectedSafra || (fazenda.safra && fazenda.safra.id === selectedSafra.id)) &&
        (!globalFilter || fazenda.nome.toLowerCase().includes(globalFilter.toLowerCase()))
    );

    const agruparFazendasPorNome = (fazendas: Projeto.Fazenda[]) => {
        const agrupadas = fazendas.reduce((acc, fazenda) => {
            if (!acc[fazenda.nome]) {
                acc[fazenda.nome] = [];
            }
            acc[fazenda.nome].push(fazenda);
            return acc;
        }, {} as Record<string, Projeto.Fazenda[]>);
    
        return Object.keys(agrupadas).map(nome => ({
            nome,
            fazendas: agrupadas[nome]
        }));
    };
    
    const fazendasAgrupadas = agruparFazendasPorNome(fazendas || []);
    
    const handleFazendaClick = (grupo: { nome: string, fazendas: Projeto.Fazenda[] }) => {
        const safrasComFazendaId = grupo.fazendas.map(f => ({ ...f.safra, fazendaId: f.id })); // Inclui o ID da fazenda junto com a safra
        setSafrasRelacionadas(safrasComFazendaId);
        setListarSafrasDialog(true);
    };

    // Adicionando a função onInputChange para lidar com mudanças nos campos de input
    const onInputChange = (e: { target: { value: any } }, name: string) => {
        const val = (e.target && e.target.value) || '';
        setFazenda((prevFazenda) => ({
            ...prevFazenda,
            [name]: val,
        }));
    };

    const handleSafraClick = (safra: Projeto.Safra & { fazendaId: number }) => {
        localStorage.setItem('FAZENDA_ID', String(safra.fazendaId)); // Salva o ID da fazenda no localStorage
        localStorage.setItem('SAFRA_ID', String(safra.id)); // Salva o ID da safra no localStorage
        window.location.href = `/pages/setor_List`;
    }

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <h2>Bem Vindo, {userName}</h2>
                    <Toast ref={toast} />
                    <Toolbar className={`${styles.toolbarContainer} mb-4`} left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                    <div className="flex flex-column gap-3">
                        {fazendasAgrupadas.map((grupo) => (
                            <div key={grupo.nome} onClick={() => handleFazendaClick(grupo)}>
                                <Card 
                                    title={`Fazenda: ${grupo.nome}`} 
                                    subTitle={`Total de Safras: ${grupo.fazendas.length}`} 
                                    className="fazenda-card"
                                    style={{ cursor: 'pointer' }}
                                />
                            </div>
                        ))}
                    </div>

                    <Dialog visible={fazendaDialog} style={{ width: '450px' }} header="Detalhes da Fazenda" modal className="p-fluid" footer={fazendaDialogFooter} onHide={hideFazendaDialog}>
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

                    <Dialog visible={listarSafrasDialog} style={{ width: '450px' }} header="Safras Relacionadas" modal className="p-fluid" footer={listarSafrasDialogFooter} onHide={hideListarSafrasDialog}>
                        <div className="field">
                            <label htmlFor="safra">Safras Pertencentes à Fazenda</label>
                            <div className="flex flex-column gap-2">
                                {safrasRelacionadas.map((safra, index) => (
                                    <Button
                                        key={index}
                                        label={safra.qual_safra}
                                        onClick={() => handleSafraClick(safra as Projeto.Safra & { fazendaId: number })} // Casting para informar ao TypeScript
                                        className="p-button-text p-button-plain"
                                    />
                                ))}
                            </div>
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Fazenda;
