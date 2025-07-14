import type { ISaleRepository } from '../../domain/repositories/ISaleRepository';
import type { ILogisticsRepository } from '../../domain/repositories/ILogisticsRepository';
import type { User} from '@prisma/client';
import { UserRole } from '@prisma/client';

export class ReportService {
    constructor(private readonly saleRepo: ISaleRepository, private readonly logisticRepo: ILogisticsRepository) { }

    async getConsolidatedReport(
        user: User,
        params?: {
            startDate?: Date;
            endDate?: Date;
            limit?: number;
            stockOffset?: number;
        },
    ) {
        const {
            startDate,
            endDate,
            limit,
            stockOffset,
        } = params || {};

        // Pagination BD pour chaque rapport
        const salesByStore = await this.saleRepo.groupSalesByStore(user.id, startDate, endDate, limit);
        const topProducts =await this.saleRepo.getTopProducts(user.id, 10, startDate, endDate);

        let centralStock: {productId:number, stock:number, name?: string}[] = [];
        let centralStockTotal = 0;
        if (user.role === UserRole.ADMIN) {
            const allCentralStock = await this.logisticRepo.findAllCentralStock(stockOffset, limit);
            centralStockTotal = allCentralStock.total;
            centralStock = allCentralStock.products;
        }

        return {
            salesByStore,
            topProducts,
            centralStock,
            centralStockTotal,
        };
    }
}
