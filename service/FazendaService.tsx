import axios from "axios";
import {BaseService} from "./BaseService";
import { axiosInstance } from "./BaseService";

export class FazendaService extends BaseService {
    constructor() {
        super("/fazenda");
    }

}