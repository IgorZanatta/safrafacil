import {axiosInstance, BaseService} from "./BaseService";


export class TipoService extends BaseService {
    constructor(){
        super("/tipo");
    }

    listarPorUsuario(usuarioId: number) {
        return axiosInstance.get(`${this.url}/usuario/${usuarioId}`);
    }
}