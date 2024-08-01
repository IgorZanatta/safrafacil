/* eslint-disable @next/next/no-sync-scripts */
import React from 'react';

const Documentation = () => {
    return (
        <>
            <div className="grid">
                <div className="col-12">
                    <div className="card docs">
                        <h5>Sobre o Aplicativo</h5>
                        <p>
                            Este aplicativo é um sistema de gerenciamento agrícola desenvolvido utilizando as tecnologias React com PrimeReact no front-end e Spring Boot no back-end. Ele funciona como um caderno ou bloco de notas digital onde o usuário pode adicionar informações sobre plantio, colheita, manutenção do solo, entre outros. O usuário pode criar fazendas, associar safras a essas fazendas e organizar essas informações em setores específicos.
                        </p>

                        <h5>Objetivo do Aplicativo</h5>
                        <p>
                            O principal objetivo deste aplicativo é facilitar a gestão agrícola, permitindo que os agricultores registrem e organizem todas as informações relacionadas às suas fazendas e setores. Isso inclui detalhes sobre cada safra, desde o plantio até a colheita e manutenção do solo, garantindo que cada etapa do processo seja documentada. Ao proporcionar uma visão clara e detalhada das atividades agrícolas, o sistema ajuda os agricultores a tomar decisões informadas e planejar futuras operações.
                        </p>

                        <h5>Objetivo para Uso Presente</h5>
                        <p>
                            Atualmente, o aplicativo oferece aos usuários a capacidade de registrar informações detalhadas sobre suas operações agrícolas de maneira estruturada e organizada. Os usuários podem criar perfis completos de fazendas, incluindo detalhes como tamanho e tipo de cultivo. Cada fazenda pode ser associada a múltiplas safras, permitindo a gestão individualizada de diferentes ciclos de cultivo ao longo do ano.
                        </p>
                        <p>
                            Dentro de cada fazenda, os usuários podem adicionar setores específicos, como talhões (áreas designadas para plantio) e setores de mecânica (destinados à manutenção e reparo de máquinas agrícolas), entre outros. Cada setor pode ter diversas atividades registradas, abrangendo desde o plantio e a colheita até a manutenção do solo e das máquinas. Essas funcionalidades permitem que os usuários monitorem todas as etapas do processo agrícola, desde a preparação do solo até a colheita, garantindo uma gestão mais eficiente e precisa das operações.
                        </p>

                        <h5>Objetivo para Uso Futuro</h5>
                        <p>
                            Com o passar do tempo, as informações registradas no aplicativo se transformarão em um valioso banco de dados. Esse acervo permitirá aos usuários identificar padrões e problemas recorrentes em suas operações agrícolas. Por exemplo, ao analisar os registros, será possível perceber se um determinado talhão apresenta uma tendência a infestações de pragas em diversas safras consecutivas. Esse tipo de insight permitirá a identificação das causas e a implementação de soluções preventivas mais eficazes.
                        </p>
                        <p>
                            Da mesma forma, a análise dos dados sobre a manutenção de máquinas permitirá identificar equipamentos que apresentam defeitos frequentes. Com essas informações, os usuários poderão tomar decisões informadas sobre a manutenção preventiva ou a substituição de máquinas, reduzindo o tempo de inatividade e aumentando a eficiência operacional.
                        </p>
                        <p>
                            Além disso, o aplicativo permitirá que os usuários registrem e analisem o consumo de insumos agrícolas, como defensivos, fertilizantes e combustível. Com esses dados em mãos, será possível calcular médias de consumo ao longo de várias safras, permitindo uma gestão mais estratégica dos recursos. Ao conhecer a demanda média de insumos, os agricultores poderão negociar melhores condições de compra com fornecedores e planejar aquisições em períodos mais vantajosos economicamente, otimizando custos e garantindo a disponibilidade dos materiais necessários para cada safra.
                        </p>
                        <p>
                            O objetivo final é transformar os dados coletados em inteligência prática, ajudando os agricultores a tomar decisões estratégicas que aumentem a produtividade e a sustentabilidade de suas operações agrícolas. Com uma visão detalhada e analítica das atividades agrícolas, incluindo o uso de insumos, os usuários estarão melhor equipados para enfrentar os desafios do campo e otimizar seus processos de cultivo.
                        </p>

                        <h5>Funcionalidades</h5>
                        <ul className="line-height-3">
                            <li>Gerenciamento de Fazendas: Criação, edição, exclusão e listagem de fazendas, associando-as a safras específicas.</li>
                            <li>Gerenciamento de Setores: Criação, edição, exclusão e listagem de setores dentro das fazendas, como talhões e áreas de manutenção de máquinas.</li>
                            <li>Gerenciamento de Tipos de Atividades: Criação, edição, exclusão e listagem de tipos de atividades agrícolas para cada setor.</li>
                            <li>Autenticação e Autorização: Sistema de login e controle de acesso baseado em JWT.</li>
                            <li>Filtro por Safras: Possibilidade de filtrar fazendas por safras específicas.</li>
                            <li>Upload de Arquivos: Funcionalidade para adicionar fotos e documentos às atividades.</li>
                        </ul>

                        <h4>Quem Sou Eu</h4>
                        <p>
                            Meu nome é Igor Zanatta Saraiva. Sou estudante de Engenharia de Computação com foco em Desenvolvimento Back-End. Tenho experiência com Java e Spring Boot, incluindo a implementação de segurança com JWT e integração com bancos de dados relacionais usando PostgreSQL. No front-end, possuo conhecimentos em React, JavaScript, HTML, CSS e TypeScript. Atualmente, estou desenvolvendo um projeto completo utilizando essas tecnologias, aplicando boas práticas e padrões de design. Procuro oportunidades de estágio para aplicar e expandir meus conhecimentos em um ambiente profissional dinâmico e inovador.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Documentation;
