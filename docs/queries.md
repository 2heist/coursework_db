# SQL Queries Reference

## Analytics

### Top 5 Cars by Revenue
```sql
SELECT cm.brand, cm.model_name, c.license_plate, SUM(r.total_cost) AS total_revenue
FROM "Rental" r
JOIN "Car" c ON r.car_id = c.car_id
JOIN "CarModel" cm ON c.model_id = cm.model_id
WHERE r.status = 'Finished'
GROUP BY c.car_id, cm.brand, cm.model_name, c.license_plate
ORDER BY total_revenue DESC
LIMIT 5;
```

### Top 3 Active Users
```sql
SELECT u.name, u.email, COUNT(r.rent_id) AS rentals_count
FROM "Rental" r
JOIN "User" u ON r.user_id = u.user_id
GROUP BY u.user_id, u.name, u.email
ORDER BY rentals_count DESC
LIMIT 3;
```

## Search & Filtering

### Smart Search (Cars)
```sql
SELECT c.car_id, cm.brand, cm.model_name, c.license_plate, cl.city, c.price_per_hour
FROM "Car" c
JOIN "CarModel" cm ON c.model_id = cm.model_id
JOIN "CarLocation" cl ON c.location_id = cl.location_id
WHERE c.deleted_at IS NULL
  AND (c.license_plate ILIKE '%' || :search || '%'
    OR cm.brand ILIKE '%' || :search || '%'
    OR cm.model_name ILIKE '%' || :search || '%'
    OR cl.city ILIKE '%' || :search || '%'
  )
ORDER BY c.car_id
LIMIT :limit OFFSET :offset;
```

## Transactions (Rental Flow)

### Start Rental (Create Record + Lock Car)
```sql
BEGIN;

INSERT INTO "Rental" ("user_id", "car_id", "start_time", "status")
VALUES (1, 5, NOW(), 'Active');

UPDATE "Car"
SET "status_id" = (SELECT "status_id" FROM "CarStatus" WHERE "status_name" = 'Rented')
WHERE "car_id" = 5;

COMMIT;
```

### Finish Rental (Close Record + Unlock Car + Payment)
```sql
BEGIN;

UPDATE "Rental"
SET "end_time" = NOW(), "status" = 'Finished', "total_cost" = 100.00
WHERE "rent_id" = 10;

UPDATE "Car"
SET "status_id" = (SELECT "status_id" FROM "CarStatus" WHERE "status_name" = 'Available')
WHERE "car_id" = 5;

INSERT INTO "Payment" ("amount", "payment_method", "status", "rent_id")
VALUES (100.00, 'Card', 'Paid', 10);

COMMIT;
```

## Soft Delete Logic

### Soft Delete Car
```sql
UPDATE "Car"
SET "deleted_at" = NOW()
WHERE "car_id" = 5;
```

### View Deleted Cars
```sql
SELECT c.car_id, cm.brand, c.license_plate, c.deleted_at
FROM "Car" c
JOIN "CarModel" cm ON c.model_id = cm.model_id
WHERE c.deleted_at IS NOT NULL;
```

### Restore Car
```sql
UPDATE "Car"
SET "deleted_at" = NULL
WHERE "car_id" = 5;
```

## General Queries

### Get All Users
```sql
SELECT * FROM "User";
```

### Get Available Cars
```sql
SELECT * FROM "Car" 
WHERE "status_id" = (SELECT "status_id" FROM "CarStatus" WHERE "status_name" = 'Available') 
  AND "deleted_at" IS NULL;
```

### User Rental History
```sql
SELECT * FROM "Rental" 
WHERE "user_id" = 1 
ORDER BY "start_time" DESC;
```

### Get Paid Payments
```sql
SELECT * FROM "Payment" 
WHERE "status" = 'Paid';
```

### Get Car Reviews
```sql
SELECT r.rating, r.comment, u.name 
FROM "Review" r 
JOIN "User" u ON r.user_id = u.user_id 
WHERE r.car_id = 5;
```

### Get Maintenance Logs
```sql
SELECT * FROM "MaintenanceLog" 
WHERE "car_id" = 5 
ORDER BY "log_date" DESC;
```