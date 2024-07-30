import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL_API || 'http://localhost:8080',
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('TOKEN_APLICACAO_FRONTEND');          
        const userId = localStorage.getItem('USER_ID'); // Recuperando o ID do usuário
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        if (userId) {
            config.headers['X-User-Id'] = userId; // Incluindo o ID do usuário nos headers
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (erro) => {
        const response = erro.response;
        if (response && response.status === 401) {
            localStorage.removeItem('TOKEN_APLICACAO_FRONTEND');
            localStorage.removeItem('USER_ID'); // Removendo o ID do usuário no caso de 401
            window.location.reload();         
        }
        return Promise.reject(erro);
    }
);

export class BaseService {
    url: string;

    constructor(url: string) {
        this.url = url;
    }

    listarTodos() {
        return axiosInstance.get(this.url);
    }

    listarPorUsuario(usuarioId: number) {
        return axiosInstance.get(`${this.url}/${usuarioId}`);
    }

    listarPorFazenda(fazendaId: number) {
        return axiosInstance.get(`${this.url}/fazenda/${fazendaId}`);
    }

    inserir(objeto: any) {
        const headers = objeto instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
        return axiosInstance.post(this.url, objeto, { headers });
    }

    alterar(objeto: any) {
        const headers = objeto instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
        return axiosInstance.put(this.url, objeto);
    }

    alterarTipo(id: number, objeto: any) {
        const headers = objeto instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
        return axiosInstance.put(`${this.url}/${id}`, objeto, { headers });
    }

    excluir(id: number) {
        return axiosInstance.delete(`${this.url}/${id}`);
    }

    buscarPorId(id: number) {
        return axiosInstance.get(`${this.url}/${id}`);
    }

    listarPorSetor(setorId: number) {
        return axiosInstance.get(`${this.url}/setor/${setorId}`);
    }

    listarPorData(data: string) {
        return axiosInstance.get(`${this.url}/data/${data}`);
    }
}
