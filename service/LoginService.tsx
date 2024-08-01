import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL_API || "https://safrafacilapi.onrender.com"
});

export class LoginService {

    novoCadastro(usuario: Projeto.Usuario) {
        return axiosInstance.post("/auth/novoUsuario", usuario);
    }

    login(login: string, senha: string) {
        return axiosInstance.post("/auth/login", 
            { username: login, password: senha })
            .then(response => {
                // Certifique-se de que o userId está presente na resposta
                if (!response.data.userId) {
                    throw new Error('userId não encontrado na resposta do login');
                }
                return response;
            });
    }

    verificarCadastro(uuid: string) {
        return axiosInstance.get(`/auth/verificarCadastro/${uuid}`);
    }
    esqueciSenha(login: string) {
        return axiosInstance.post('/auth/esqueciSenha', { login });
    }

    verificarCodigo(login: string, codigoVerificacao: string) {
        return axiosInstance.post('/auth/verificarCodigo', { login, codigoVerificacao });
    }

    redefinirSenha(login: string, novaSenha: string) {
        console.log('Redefinir Senha - Login:', login, 'Nova Senha:', novaSenha); // Log para depuração
        return axiosInstance.post('/auth/redefinirSenha', { login, novaSenha });
    }
    checkTokenValidity() {
        const token = localStorage.getItem('TOKEN_APLICACAO_FRONTEND');
        if (!token) return -1; // Retorna -1 se o token não existir

        const { exp } = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = exp * 1000;
        const currentTime = new Date().getTime();

        return expirationTime - currentTime;
    }

    async renewToken() {
        const response = await axiosInstance.post('/auth/renew-token', null, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('TOKEN_APLICACAO_FRONTEND')}`
            }
        });

        if (response.status === 200) {
            localStorage.setItem('TOKEN_APLICACAO_FRONTEND', response.data.token);
            return true;
        } else {
            return false;
        }
    }
}
