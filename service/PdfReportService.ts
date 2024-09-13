import pdfMake from "pdfmake/build/pdfMake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { FazendaService } from "./FazendaService";
import { SetorService } from "./SetorService";
import { TipoService } from "./TipoService";
import { TDocumentDefinitions, Content } from "pdfmake/interfaces";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const formatarData = (data: Date | null) => {
    if (!data) return "Data não disponível";
    const d = new Date(data);
    const dia = d.getDate().toString().padStart(2, '0');
    const mes = (d.getMonth() + 1).toString().padStart(2, '0');
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
};

// Função para gerar o relatório a partir de uma fazenda, vasculhando seus setores e tipos de atividade
export const gerarRelatorioFazenda = async (fazendaId: number) => {
    const fazendaService = new FazendaService();
    const tipoService = new TipoService();

    const fazendaResponse = await fazendaService.buscarPorId(fazendaId);
    const fazenda = fazendaResponse.data;

    if (!fazenda) {
        console.error("Fazenda não encontrada.");
        return;
    }

    // Verifica se a fazenda possui nome e safra
    const fazendaNome = fazenda.nome;
    const safraQualidade = fazenda.safra?.qual_safra;

    // Carregar todos os setores da fazenda
    const setoresResponse = await new SetorService().listarPorFazenda(fazendaId);
    const setores = setoresResponse.data;

    if (!setores || setores.length === 0) {
        console.error("A fazenda não possui setores ou os setores não foram carregados.");
        return;
    }

    const content: Content[] = [];

    for (const setor of setores) {
        // Carregar tipos de atividade do setor
        const tiposResponse = await tipoService.listarPorSetor(setor.id);
        const tipos = tiposResponse.data;

        if (!tipos || tipos.length === 0) {
            console.warn(`Setor ${setor.nome} não possui tipos de atividades.`);
            continue;
        }

        // Para cada tipo de atividade encontrado, gera uma página
        tipos.forEach((tipo: any) => {
            content.push({
                stack: [
                    { text: `Fazenda: ${tipo.setor.fazenda.nome}`, style: 'header', alignment: 'center' },
                    { text: `Safra: ${tipo.setor.fazenda.safra.qual_safra}`, style: 'subheader', alignment: 'center' },
                    { text: `Setor: ${setor.nome} - Tamanho: ${setor.tamanho || 'N/A'}`, style: 'subheader', alignment: 'center' },
                    { text: `Atividade: ${tipo.tipo_atividade}`, style: 'sectionHeader' },
                    { text: `Data: ${formatarData(tipo.data)}`, style: 'normalText' },
                    { text: `Gasto: ${tipo.gasto}`, style: 'normalText' },
                    { text: `Lucro: ${tipo.lucro}`, style: 'normalText' },
                    { text: `Observação: ${tipo.observacao}`, style: 'normalText' }
                ],
                pageBreak: 'after'
            });
        });
    }

    const docDefinition: TDocumentDefinitions = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        content: content,
        styles: {
            header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
            subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
            sectionHeader: { fontSize: 12, bold: true, margin: [0, 10, 0, 5] },
            normalText: { fontSize: 10, margin: [0, 5, 0, 5] }
        }
    };

    pdfMake.createPdf(docDefinition).download(
        `relatorio_fazenda_${fazendaNome}_${
            safraQualidade
        }.pdf`
    );
};


export const gerarRelatorioSetor = async (setorId: number) => {
    try {
        const setorService = new SetorService();
        const tipoService = new TipoService(); // Chama o serviço de tipos

        // Busca o setor
        const setorResponse = await setorService.buscarPorId(setorId);
        const setor = setorResponse.data;

        if (!setor) {
            throw new Error("Setor não encontrado.");
        }

        const fazendaNome = setor.fazenda?.nome || "Fazenda não disponível";
        const safraNome = setor.fazenda?.safra?.qual_safra || "Safra não disponível";

        // Carregar os tipos de atividades para o setor
        const tiposResponse = await tipoService.listarPorSetor(setorId);
        const tipos = tiposResponse.data;

        const content: Content[] = [
            
        ];

        // Adiciona os tipos de atividades, se existirem
        if (tipos && tipos.length > 0) {
            tipos.forEach((tipo: any) => {
                content.push({
                    stack: [
                        { text: `Fazenda: ${fazendaNome}`, style: 'header', alignment: 'center' },
                        { text: `Safra: ${safraNome}`, style: 'subheader', alignment: 'center' },
                        { text: `Setor: ${setor.nome} - Tamanho: ${setor.tamanho || 'N/A'}`, style: 'subheader', alignment: 'center' },
                        { text: `Atividade: ${tipo.tipo_atividade}`, style: 'sectionHeader' },
                        { text: `Data: ${formatarData(tipo.data)}`, style: 'normalText' },
                        { text: `Gasto: ${tipo.gasto}`, style: 'normalText' },
                        { text: `Lucro: ${tipo.lucro}`, style: 'normalText' },
                        { text: `Observação: ${tipo.observacao}`, style: 'normalText' }
                    ],
                    pageBreak: 'after'
                });
            });
        } else {
            content.push({
                text: 'Nenhuma atividade registrada para este setor.',
                style: 'normalText',
                alignment: 'center',
                margin: [0, 10]
            });
        }

        const docDefinition: TDocumentDefinitions = {
            pageSize: 'A4',
            pageMargins: [40, 60, 40, 60],
            content: content,
            styles: {
                header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
                subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
                sectionHeader: { fontSize: 12, bold: true, margin: [0, 10, 0, 5] },
                normalText: { fontSize: 10, margin: [0, 5, 0, 5] }
            }
        };

        pdfMake.createPdf(docDefinition).download(`relatorio_setor_${setor.nome}.pdf`);
        console.log("PDF gerado com sucesso para o setor:", setor.nome);
    } catch (error: any) {
        console.error(`Erro ao gerar PDF para o setor ${setorId}:`, error.message);
        throw new Error(`Erro ao gerar PDF para o setor: ${setorId}`);
    }
};

export const gerarRelatorioTipoAtividade = async (tipoId: number) => {
    try {
        const tipoService = new TipoService();

        // Busca o tipo de atividade
        const tipoResponse = await tipoService.buscarPorId(tipoId);
        const tipo = tipoResponse.data;

        if (!tipo) {
            throw new Error('Tipo de atividade não encontrado.');
        }

        // Informações básicas do tipo de atividade
        const content: Content[] = [
            { text: `Fazenda:  ${tipo.setor?.fazenda?.nome}`, style: 'header', alignment: 'center' },
            { text: `Safra: ${tipo.setor?.fazenda?.safra?.qual_safra}`, style: 'subheader', alignment: 'center' },
            { text: `Setor: ${tipo.setor?.nome} - Tamanho: ${tipo.setor?.tamanho || 'N/A'}`, style: 'subheader', alignment: 'center' },
            { text: `Atividade: ${tipo.tipo_atividade}`, style: 'header', alignment: 'center' },
            { text: `Data: ${formatarData(tipo.data)}`, style: 'normalText', alignment: 'left' },
            { text: `Gasto: ${tipo.gasto}`, style: 'normalText', alignment: 'left' },
            { text: `Lucro: ${tipo.lucro}`, style: 'normalText', alignment: 'left' },
            { text: `Observação: ${tipo.observacao}`, style: 'normalText', alignment: 'left' },
        ];

        const docDefinition: TDocumentDefinitions = {
            pageSize: 'A4',
            pageMargins: [40, 60, 40, 60],
            content: content,
            styles: {
                header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
                normalText: { fontSize: 12, margin: [0, 5, 0, 5] }
            }
        };

        pdfMake.createPdf(docDefinition).download(`relatorio_tipo_${tipo.tipo_atividade}.pdf`);
        console.log("PDF gerado com sucesso para o tipo de atividade:", tipo.tipo_atividade);
    } catch (error: any) {
        console.error(`Erro ao gerar PDF para o tipo de atividade ${tipoId}:`, error.message);
    }
};