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
                const fazendaService = new FazendaService();
                const setorService = new SetorService();

                const fazendasResponse = await fazendaService.listarTodos();
                const fazendasData = fazendasResponse.data;

                const fazendasComSetores = await Promise.all(fazendasData.map(async (fazenda: any) => {
                    const setoresResponse = await setorService.listarPorFazenda(fazenda.id);
                    const setoresData = setoresResponse.data;

                    return {
                        label: `${fazenda.nome} - Safra: ${fazenda.safra.qual_safra}`,
                        items: setoresData.map((setor: any) => ({
                            label: setor.nome,
                            icon: 'pi pi-fw pi-building',
                            to: `/pages/tipoList/${setor.id}`
                        }))
                    };
                }));

                setFazendas(fazendasComSetores);
            } catch (error) {
                console.error('Erro ao carregar fazendas e setores:', error);
            }
        };

        fetchFazendasEsetores();
    }, []);

    const model: AppMenuItem[] = [
        {
            label: 'Home',
            items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/pages/home' }]
        },
        {
            label: 'Fazenda',
            items: [
                ...fazendas
            ]
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
                    label: 'Documentation',
                    icon: 'pi pi-fw pi-question',
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
