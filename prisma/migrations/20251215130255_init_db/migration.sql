-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "driver_license_number" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "CarModel" (
    "model_id" SERIAL NOT NULL,
    "brand" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,

    CONSTRAINT "CarModel_pkey" PRIMARY KEY ("model_id")
);

-- CreateTable
CREATE TABLE "CarStatus" (
    "status_id" SERIAL NOT NULL,
    "status_name" TEXT NOT NULL,

    CONSTRAINT "CarStatus_pkey" PRIMARY KEY ("status_id")
);

-- CreateTable
CREATE TABLE "CarLocation" (
    "location_id" SERIAL NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "CarLocation_pkey" PRIMARY KEY ("location_id")
);

-- CreateTable
CREATE TABLE "Car" (
    "car_id" SERIAL NOT NULL,
    "license_plate" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "price_per_hour" DECIMAL(10,2) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "model_id" INTEGER NOT NULL,
    "status_id" INTEGER NOT NULL,
    "location_id" INTEGER NOT NULL,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("car_id")
);

-- CreateTable
CREATE TABLE "Rental" (
    "rent_id" SERIAL NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMP(3),
    "total_cost" DECIMAL(10,2),
    "status" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "car_id" INTEGER NOT NULL,

    CONSTRAINT "Rental_pkey" PRIMARY KEY ("rent_id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "payment_id" SERIAL NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_method" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rent_id" INTEGER NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "MaintenanceLog" (
    "log_id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "cost" DECIMAL(10,2) NOT NULL,
    "log_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "car_id" INTEGER NOT NULL,

    CONSTRAINT "MaintenanceLog_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "Review" (
    "review_id" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "review_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "car_id" INTEGER NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("review_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_driver_license_number_key" ON "User"("driver_license_number");

-- CreateIndex
CREATE UNIQUE INDEX "CarStatus_status_name_key" ON "CarStatus"("status_name");

-- CreateIndex
CREATE UNIQUE INDEX "Car_license_plate_key" ON "Car"("license_plate");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_rent_id_key" ON "Payment"("rent_id");

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "CarModel"("model_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "CarStatus"("status_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "CarLocation"("location_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "Car"("car_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_rent_id_fkey" FOREIGN KEY ("rent_id") REFERENCES "Rental"("rent_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceLog" ADD CONSTRAINT "MaintenanceLog_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "Car"("car_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "Car"("car_id") ON DELETE RESTRICT ON UPDATE CASCADE;
