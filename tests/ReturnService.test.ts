import { ReturnService } from "../src/domain/services/ReturnService";
import { PrismaRepository } from "../src/infrastructure/PrismaRepository";
import { Sale, SaleItem } from "@prisma/client";

describe("ReturnService", () => {
    let mockRepo: jest.Mocked<PrismaRepository>;
    let svc: ReturnService;

    beforeEach(() => {
        mockRepo = {
            getSaleById: jest.fn(),
            incrementStock: jest.fn(),
            deleteSale: jest.fn(),
            // stubs vides
            createProduct: jest.fn(),
            listProducts: jest.fn(),
            findProductById: jest.fn(),
            createSale: jest.fn(),
            decrementStock: jest.fn(),
            findProductsByName: jest.fn(),
            findProductsByCategory: jest.fn(),
        } as any;
        svc = new ReturnService(mockRepo);
    });

    it("restaure le stock et supprime la vente existante", async () => {
        const items: SaleItem[] = [
            { id: 1, saleId: 100, productId: 5, quantity: 3 },
            { id: 2, saleId: 100, productId: 6, quantity: 1 },
        ];
        const fakeSale = { id: 100, date: new Date(), items } as Sale & { items: SaleItem[] };
        mockRepo.getSaleById.mockResolvedValue(fakeSale);

        await expect(svc.processReturn(100)).resolves.toBeUndefined();
        // incrementStock deux fois
        expect(mockRepo.incrementStock).toHaveBeenCalledTimes(2);
        expect(mockRepo.incrementStock).toHaveBeenCalledWith(5, 3);
        expect(mockRepo.incrementStock).toHaveBeenCalledWith(6, 1);
        // suppression de la vente
        expect(mockRepo.deleteSale).toHaveBeenCalledWith(100);
    });

    it("Retourne une erreur si la vente n'existe pas", async () => {
        mockRepo.getSaleById.mockResolvedValue(null);
        await expect(svc.processReturn(999)).rejects.toThrow("Vente 999 introuvable.");
        expect(mockRepo.incrementStock).not.toHaveBeenCalled();
        expect(mockRepo.deleteSale).not.toHaveBeenCalled();
    });
});
