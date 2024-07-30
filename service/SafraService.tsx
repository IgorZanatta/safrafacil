import axios from "axios";
import {axiosInstance, BaseService} from "./BaseService";


export class SafraService extends BaseService {
    constructor(){
        super("/safra");
    }

}