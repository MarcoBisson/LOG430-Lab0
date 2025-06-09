/*
  Warnings:

  - A unique constraint covering the columns `[storeId,productId]` on the table `ReplenishmentRequest` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[saleId,productId]` on the table `SaleItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeId,productId]` on the table `StoreStock` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ReplenishmentRequest_storeId_productId_key" ON "ReplenishmentRequest"("storeId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "SaleItem_saleId_productId_key" ON "SaleItem"("saleId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "StoreStock_storeId_productId_key" ON "StoreStock"("storeId", "productId");
