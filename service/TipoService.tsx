import {axiosInstance, BaseService} from "./BaseService";


export class TipoService extends BaseService {
    constructor(){
        super("/tipo");
    }

}