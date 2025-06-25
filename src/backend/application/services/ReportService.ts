import { ISaleRepository } from "../../domain/repositories/ISaleRepository";
import { ILogisticsRepository } from "../../domain/repositories/ILogisticsRepository";

export class ReportService {
    constructor(private saleRepo: ISaleRepository, private logisticRepo: ILogisticsRepository) { }

    async getConsolidatedReport(params?: { startDate?: Date; endDate?: Date }) {
        const { startDate, endDate } = params || {};

        const salesByStore = await this.saleRepo.groupSalesByStore(startDate, endDate);
        const topProducts = await this.saleRepo.getTopProducts(10,startDate, endDate);
        const centralStock = await this.logisticRepo.findAllCentralStock();

        return {
            salesByStore,
            topProducts,
            centralStock,
        };
    }
}