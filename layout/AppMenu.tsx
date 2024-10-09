/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState, useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import { FazendaService } from '../service/FazendaService';
import { SetorService } from '../service/SetorService';
import { AppMenuItem } from '@/types';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const [fazendas, setFazendas] = useState<AppMenuItem[]>([]);

    useEffect(() => {
        const fetchFazendasEsetores = async () => {
            try {
                const usuarioId = localStorage.getItem('USER_ID'); // Pegando o ID do usuário logado
                const fazendaService = new FazendaService();
                const setorService = new SetorService();

                const fazendasResponse = await fazendaService.listarPorUsuario(Number(usuarioId)); // Chamando o serviço para listar fazendas do usuário
                const fazendasData = fazendasResponse.data;

                // Agrupar fazendas pelo nome
                const farmsByName: { [key: string]: any[] } = {};

                for (const fazenda of fazendasData) {
                    const farmName = fazenda.nome;

                    if (!farmsByName[farmName]) {
                        farmsByName[farmName] = [];
                    }
                    farmsByName[farmName].push(fazenda);
                }

                const fazendasComSetores = await Promise.all(
                    Object.entries(farmsByName).map(async ([farmName, fazendas]) => {
                        // Construir itens para cada safra
                        const safrasItems = await Promise.all(
                            fazendas.map(async (fazenda) => {
                                const setoresResponse = await setorService.listarPorFazenda(fazenda.id); // Chamando o serviço para listar setores da fazenda
                                const setoresData = setoresResponse.data;

                                return {
                                    label: `Safra: ${fazenda.safra.qual_safra}`,
                                    icon: 'pi pi-fw pi-calendar',
                                    items: setoresData.map((setor: any) => ({
                                        label: setor.nome,
                                        icon: 'pi pi-fw pi-building',
                                        command: () => {
                                            localStorage.setItem('SETOR_ID', setor.id);
                                            window.location.href = '/pages/tipo_list/';
                                        },
                                    })),
                                };
                            })
                        );

                        return {
                            label: farmName,
                            icon: 'pi pi-fw pi-globe',
                            items: safrasItems,
                        };
                    })
                );

                setFazendas(fazendasComSetores);
            } catch (error) {
                console.error('Erro ao carregar fazendas e setores:', error);
            }
        };

        fetchFazendasEsetores();
    }, []);

    const model: AppMenuItem[] = [
        {
            label: 'Menu',
            items: [{ label: 'Tela Principal', icon: 'pi pi-fw pi-home', to: '/pages/home' }],
        },
        {
            label: 'Acesso Rápido',
            items: [...fazendas],
        },
        {
            label: 'Fazenda',
            items: [
                { label: 'Adicionar Fazenda', icon: 'pi pi-plus-circle', to: '/pages/addfazenda' },
                { label: 'Editar Fazenda', icon: 'pi pi-file-edit', to: '/pages/editfazenda' },
            ]
        },
        {
            label: 'Safra',
            items: [
                { label: 'Adicionar Safra', icon: 'pi pi-plus-circle', to: '/pages/addsafra' },
                { label: 'Editar Safra', icon: 'pi pi-file-edit', to: '/pages/editsafra' },
            ]
        },
        {
            label: 'Setor',
            items: [
                { label: 'Adicionar Setor', icon: 'pi pi-plus-circle', to: '/pages/addsetor' },
                { label: 'Editar Setor', icon: 'pi pi-file-edit', to: '/pages/editsetor' },
            ]
        },
        {
            label: 'Tipo de Atividade',
            items: [
                { label: 'Adicionar Tipo de Atividade', icon: 'pi pi-plus-circle', to: '/pages/addtipo' },
                { label: 'Editar Tipo de Atividade', icon: 'pi pi-file-edit', to: '/pages/edittipo' },
            ]
        },
        {
            label: 'Configuração',
            items: [
                { label: 'Usuario', icon: 'pi pi-user-edit', to: '/pages/usuarioconfig', badge: 'NEW' },
            ]
        },
        {
            label: 'Get Started',
            items: [
                {
                    label: 'Informações',
                    icon: 'pi pi-info',
                    to: '/pages/document'
                },
            ]
        }
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
