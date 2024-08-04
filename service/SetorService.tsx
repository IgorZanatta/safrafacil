import { axiosInstance, BaseService } from './BaseService';
import axios from "axios";

export class SetorService extends BaseService {
    constructor() {
        super("/setor");
    }

    listarPorUsuario(usuarioId: number) {
        return axiosInstance.get(`${this.url}/usuario/${usuarioId}`);
    }
}
