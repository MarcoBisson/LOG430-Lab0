import { PrismaRepository } from '../../infrastructure/PrismaRepository';

export class ReportService {
    constructor(private repo = new PrismaRepository()) { }

    async getConsolidatedReport() {
        const salesByStore = await this.repo.groupSalesByStore();
        const topProducts = await this.repo.getTopProducts(10);
        const centralStock = await this.repo.findAllCentralStock();

        return {
            salesByStore,
            topProducts,
            centralStock,
        };
    }
}