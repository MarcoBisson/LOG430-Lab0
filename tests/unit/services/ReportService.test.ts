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
                { productId: 1, stock: 100 },
                { productId: 2, stock: 75 },
            ];

            jest.spyOn(mockSaleRepository, 'groupSalesByStore').mockResolvedValue(salesByStore);
            jest.spyOn(mockSaleRepository, 'getTopProducts').mockResolvedValue(topProducts);
            jest.spyOn(mockLogisticsRepository, 'findAllCentralStock').mockResolvedValue(centralStock);

            const result = await reportService.getConsolidatedReport(adminUser as any);

            expect(result.salesByStore).toEqual(salesByStore);
            expect(result.topProducts).toEqual(topProducts);
            expect(result.centralStock).toEqual(centralStock);
            expect(mockSaleRepository.groupSalesByStore).toHaveBeenCalledWith(1, undefined, undefined);
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
            jest.spyOn(mockLogisticsRepository, 'findAllCentralStock').mockResolvedValue([]);

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
            jest.spyOn(mockLogisticsRepository, 'findAllCentralStock').mockResolvedValue([]);

            await reportService.getConsolidatedReport(adminUser as any, { startDate, endDate });

            expect(mockSaleRepository.groupSalesByStore).toHaveBeenCalledWith(1, startDate, endDate);
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
});
