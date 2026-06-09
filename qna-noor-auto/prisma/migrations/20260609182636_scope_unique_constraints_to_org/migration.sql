/*
  Warnings:

  - A unique constraint covering the columns `[orgId,externalId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orgId,partNumber]` on the table `Part` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orgId,roNumber]` on the table `RepairOrder` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orgId,externalId]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Customer_externalId_key";

-- DropIndex
DROP INDEX "Part_partNumber_key";

-- DropIndex
DROP INDEX "RepairOrder_roNumber_key";

-- DropIndex
DROP INDEX "Vehicle_externalId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Customer_orgId_externalId_key" ON "Customer"("orgId", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Part_orgId_partNumber_key" ON "Part"("orgId", "partNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RepairOrder_orgId_roNumber_key" ON "RepairOrder"("orgId", "roNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_orgId_externalId_key" ON "Vehicle"("orgId", "externalId");
