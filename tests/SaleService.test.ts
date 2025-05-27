import { SaleService } from "../src/domain/services/SaleService";
import { PrismaRepository } from "../src/infrastructure/PrismaRepository";
import { CartItem } from "../src/domain/entities";

describe("SaleService", () => {
    let mockRepo: jest.Mocked<PrismaRepository>;
    let svc: SaleService;

    beforeEach(() => {
        mockRepo = {
            findProductById: jest.fn(),
            createSale: jest.fn(),
            decrementStock: jest.fn(),
            // stubs vides pour les autres méthodes
            createProduct: jest.fn(),
            listProducts: jest.fn(),
            findProductsByName: jest.fn(),
            findProductsByCategory: jest.fn(),
            getSaleById: jest.fn(),
            deleteSale: jest.fn(),
            incrementStock: jest.fn(),
        } as any;
        svc = new SaleService(mockRepo);
    });

    it("enregistre une vente quand le stock est suffisant", async () => {
        const items = [new CartItem(1, 2), new CartItem(2, 1)];
        // produits avec stock suffisant
        mockRepo.findProductById
            .mockResolvedValueOnce({ id: 1, name: "A", price: 5, stock: 3 } as any)
            .mockResolvedValueOnce({ id: 2, name: "B", price: 7, stock: 1 } as any);
        // createSale renvoie un objet vente
        const fakeSale = { id: 10, date: new Date(), items: [] };
        mockRepo.createSale.mockResolvedValue(fakeSale as any);

        await expect(svc.recordSale(items)).resolves.toBeUndefined();

        expect(mockRepo.createSale).toHaveBeenCalledWith([
            { productId: 1, quantity: 2 },
            { productId: 2, quantity: 1 },
        ]);
        // vérifie que decrementStock a été appelé pour chaque item
        expect(mockRepo.decrementStock).toHaveBeenCalledTimes(2);
        expect(mockRepo.decrementStock).toHaveBeenCalledWith(1, 2);
        expect(mockRepo.decrementStock).toHaveBeenCalledWith(2, 1);
    });

    it("échoue si le stock est insuffisant", async () => {
        const items = [new CartItem(3, 5)];
        mockRepo.findProductById.mockResolvedValue({ id: 3, name: "C", price: 2, stock: 4 } as any);

        await expect(svc.recordSale(items)).rejects.toThrow("Stock insuffisant pour le produit 3");
        expect(mockRepo.createSale).not.toHaveBeenCalled();
        expect(mockRepo.decrementStock).not.toHaveBeenCalled();
    });
});
