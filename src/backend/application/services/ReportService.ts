import { ISaleRepository } from "../../domain/repositories/ISaleRepository";
import { ILogisticsRepository } from "../../domain/repositories/ILogisticsRepository";

export class ReportService {
    constructor(private saleRepo: ISaleRepository, private logisticRepo: ILogisticsRepository) { }

    async getConsolidatedReport() {
        const salesByStore = await this.saleRepo.groupSalesByStore();
        const topProducts = await this.saleRepo.getTopProducts(10);
        const centralStock = await this.logisticRepo.findAllCentralStock();

        return {
            salesByStore,
            topProducts,
            centralStock,
        };
    }
}