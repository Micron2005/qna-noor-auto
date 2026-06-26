-- Customer signature on approval (for insurance claims). Additive, nullable.
ALTER TABLE "RepairOrder" ADD COLUMN "signatureDataUrl" TEXT;
ALTER TABLE "RepairOrder" ADD COLUMN "signatureName" TEXT;
ALTER TABLE "RepairOrder" ADD COLUMN "signedAt" TIMESTAMP(3);
