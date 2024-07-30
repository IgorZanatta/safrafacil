import axios from "axios";
import { BaseService, axiosInstance } from "./BaseService";

export class UsuarioService extends BaseService {
    constructor() {
        super('/usuario'); // Defina a URL base correta aqui
    }

    alterarCampos(usuario: Projeto.Usuario) {
        return axiosInstance.put(`${this.url}/campos`, usuario);
    }

    alterarSenha(id: number, novaSenha: string) {
        return axiosInstance.put(`${this.url}/senha/${id}`, { senha: novaSenha });
    }
}