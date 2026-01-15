/*
  Warnings:

  - The primary key for the `menu_items` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `menu_items` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `parentId` column on the `menu_items` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `role_menus` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `role_menus` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `menuItemId` on the `role_menus` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."menu_items" DROP CONSTRAINT "menu_items_parentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."role_menus" DROP CONSTRAINT "role_menus_menuItemId_fkey";

-- AlterTable
ALTER TABLE "appointments" ALTER COLUMN "doctorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "menu_items" DROP CONSTRAINT "menu_items_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "parentId",
ADD COLUMN     "parentId" INTEGER,
ADD CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "role_menus" DROP CONSTRAINT "role_menus_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "menuItemId",
ADD COLUMN     "menuItemId" INTEGER NOT NULL,
ADD CONSTRAINT "role_menus_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "menu_items_parentId_idx" ON "menu_items"("parentId");

-- CreateIndex
CREATE INDEX "role_menus_menuItemId_idx" ON "role_menus"("menuItemId");

-- CreateIndex
CREATE UNIQUE INDEX "role_menus_role_menuItemId_key" ON "role_menus"("role", "menuItemId");

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "menu_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_menus" ADD CONSTRAINT "role_menus_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
