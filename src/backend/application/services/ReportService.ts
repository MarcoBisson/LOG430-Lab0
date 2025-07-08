import { ISaleRepository } from "../../domain/repositories/ISaleRepository";
import { ILogisticsRepository } from "../../domain/repositories/ILogisticsRepository";
import { User, UserRole } from "@prisma/client";

export class ReportService {
    constructor(private saleRepo: ISaleRepository, private logisticRepo: ILogisticsRepository) { }

    async getConsolidatedReport(user: User, params?: { startDate?: Date; endDate?: Date }) {
        const { startDate, endDate } = params || {};

        const salesByStore = await this.saleRepo.groupSalesByStore(user.id,startDate, endDate);
        const topProducts = await this.saleRepo.getTopProducts(user.id, 10,startDate, endDate);
        
        let centralStock: {productId:number, stock:number}[]= []
        if (user.role == UserRole.ADMIN)
             centralStock = await this.logisticRepo.findAllCentralStock();

        return {
            salesByStore,
            topProducts,
            centralStock,
        };
    }
}