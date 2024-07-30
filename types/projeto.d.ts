declare namespace Projeto{
    type Usuario = {
        id?: number;
        nome: string;
        senha?: string;
        login: string;
        telefone: string;
    };

    type Fazenda = {
        id?: number;
        nome: string;
        tamanho: string;
        safra: Safra;
        usuario: Usuario;
    };
    

    type Setor = {
        id?: number;
        nome: string;
        tipo_setor: string;
        tamanho: string;
        fazenda: Fazenda;

    };

    type Tipo = {
        id?: number;
        tipo_atividade: string;
        data: Date | null;
        gasto: string;
        lucro: string;
        observacao: string;
        anexos: string;
        setor: Setor;
    };

    type Safra = {
        id?: number;
        qual_safra: string;
        usuario: Usuario;

    };

}