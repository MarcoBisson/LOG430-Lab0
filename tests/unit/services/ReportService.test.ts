import { ReportService } from '../../../src/backend/application/services/ReportService';
import { MockSaleRepository } from '../../mocks/repositories/MockSaleRepository';
import { MockLogisticsRepository } from '../../mocks/repositories/MockLogisticsRepository';

describe('ReportService', () => {
    let reportService: ReportService;
    let mockSaleRepository: MockSaleRepository;
    let mockLogisticsRepository: MockLogisticsRepository;

    beforeEach(() => {
        mockSaleRepository = new MockSaleRepository();
        mockLogisticsRepository = new MockLogisticsRepository();
        reportService = new ReportService(mockSaleRepository, mockLogisticsRepository);
    });

    describe('getConsolidatedReport', () => {
        it('should return consolidated report for admin user', async () => {
            const adminUser = {
                id: 1,
                username: 'admin',
                password: 'password',
                role: 'ADMIN',
                access: [],
            };

            const salesByStore = [
                { storeId: 1, totalQuantity: 50 },
                { storeId: 2, totalQuantity: 30 },
            ];
            const topProducts = [
                { productId: 1, totalQuantity: 50 },
                { productId: 2, totalQuantity: 30 },
            ];
            const centralStock = [
                { productId: 1, stock: 100, name: 'Produit 1' },
                { productId: 2, stock: 75, name: 'Produit 2' },
            ];

            jest.spyOn(mockSaleRepository, 'groupSalesByStore').mockResolvedValue(salesByStore);
            jest.spyOn(mockSaleRepository, 'getTopProducts').mockResolvedValue(topProducts);
            jest.spyOn(mockLogisticsRepository, 'findAllCentralStock').mockResolvedValue({
                products: centralStock.map(s => ({ ...s, name: `Produit ${s.productId}` })),
                total: centralStock.length,
            });

            const result = await reportService.getConsolidatedReport(adminUser as any);

            expect(result.salesByStore).toEqual(salesByStore);
            expect(result.topProducts).toEqual(topProducts);
            expect(result.centralStock).toEqual(centralStock);
            expect(mockSaleRepository.groupSalesByStore).toHaveBeenCalledWith(1, undefined, undefined, undefined);
            expect(mockSaleRepository.getTopProducts).toHaveBeenCalledWith(1, 10, undefined, undefined);
            expect(mockLogisticsRepository.findAllCentralStock).toHaveBeenCalled();
        });

        it('should return consolidated report for non-admin user without central stock', async () => {
            const staffUser = {
                id: 2,
                username: 'staff',
                password: 'password',
                role: 'STAFF',
                access: [],
            };

            const salesByStore = [{ storeId: 1, totalQuantity: 25 }];
            const topProducts = [{ productId: 1, totalQuantity: 25 }];

            jest.spyOn(mockSaleRepository, 'groupSalesByStore').mockResolvedValue(salesByStore);
            jest.spyOn(mockSaleRepository, 'getTopProducts').mockResolvedValue(topProducts);
            jest.spyOn(mockLogisticsRepository, 'findAllCentralStock').mockResolvedValue({
                products: [],
                total: 0,
            });

            const result = await reportService.getConsolidatedReport(staffUser as any);

            expect(result.salesByStore).toEqual(salesByStore);
            expect(result.topProducts).toEqual(topProducts);
            expect(result.centralStock).toEqual([]);
            expect(mockLogisticsRepository.findAllCentralStock).not.toHaveBeenCalled();
        });

        it('should handle date range parameters', async () => {
            const adminUser = {
                id: 1,
                username: 'admin',
                password: 'password',
                role: 'ADMIN',
                access: [],
            };

            const startDate = new Date('2024-01-01');
            const endDate = new Date('2024-12-31');

            jest.spyOn(mockSaleRepository, 'groupSalesByStore').mockResolvedValue([]);
            jest.spyOn(mockSaleRepository, 'getTopProducts').mockResolvedValue([]);
            jest.spyOn(mockLogisticsRepository, 'findAllCentralStock').mockResolvedValue({
                products: [],
                total: 0,
            });

            await reportService.getConsolidatedReport(adminUser as any, { startDate, endDate });

            expect(mockSaleRepository.groupSalesByStore).toHaveBeenCalledWith(1, startDate, endDate, undefined);
            expect(mockSaleRepository.getTopProducts).toHaveBeenCalledWith(1, 10, startDate, endDate);
        });

        it('should handle empty results', async () => {
            const clientUser = {
                id: 3,
                username: 'client',
                password: 'password',
                role: 'CLIENT',
                access: [],
            };

            jest.spyOn(mockSaleRepository, 'groupSalesByStore').mockResolvedValue([]);
            jest.spyOn(mockSaleRepository, 'getTopProducts').mockResolvedValue([]);

            const result = await reportService.getConsolidatedReport(clientUser as any);

            expect(result.salesByStore).toEqual([]);
            expect(result.topProducts).toEqual([]);
            expect(result.centralStock).toEqual([]);
        });
    });
    it('should not set centralStock for non-admin user', async () => {
        const user = { id: 1, role: 'STAFF' };
        jest.spyOn(mockSaleRepository, 'groupSalesByStore').mockResolvedValue([]);
        jest.spyOn(mockSaleRepository, 'getTopProducts').mockResolvedValue([]);
        const result = await reportService.getConsolidatedReport(user as any);
        expect(result.centralStock).toEqual([]);
        expect(result.centralStockTotal).toBe(0);
    });

    it('should cover centralStock slice fallback (offset/limit undefined)', async () => {
        const user = { id: 1, role: 'ADMIN' };
        jest.spyOn(mockSaleRepository, 'groupSalesByStore').mockResolvedValue([]);
        jest.spyOn(mockSaleRepository, 'getTopProducts').mockResolvedValue([]);
        jest.spyOn(mockLogisticsRepository, 'findAllCentralStock').mockResolvedValue({
            products: [{ productId: 1, stock: 10, name: 'A' }, { productId: 2, stock: 20, name: 'B' }], total: 2,
        });
        const result = await reportService.getConsolidatedReport(user as any, {});
        expect(result.centralStock.length).toBe(2);
        expect(result.centralStockTotal).toBe(2);
    });

    it('should cover centralStock slice with offset/limit', async () => {
        const user = { id: 1, role: 'ADMIN' };
        jest.spyOn(mockSaleRepository, 'groupSalesByStore').mockResolvedValue([]);
        jest.spyOn(mockSaleRepository, 'getTopProducts').mockResolvedValue([]);
        jest.spyOn(mockLogisticsRepository, 'findAllCentralStock').mockResolvedValue({
            products: [
                { productId: 1, stock: 10, name: 'A' },
                { productId: 2, stock: 20, name: 'B' },
                { productId: 3, stock: 30, name: 'C' },
            ],
            total: 3,
        });
        const result = await reportService.getConsolidatedReport(user as any, { stockOffset: 1, limit: 1 });
        expect(result.centralStock.length).toBe(3);
        expect(result.centralStock[0].productId).toBe(1);
    });
});
