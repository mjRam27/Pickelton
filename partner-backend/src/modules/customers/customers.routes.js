import { Router } from "express";
import { query } from "../../config/database.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { HttpError } from "../../utils/http-error.js";
import {
  pagination,
  pageResult,
} from "../../utils/pagination.js";

export const customersRouter = Router();

/* =========================================================
   CREATE CUSTOMER
   POST /api/v1/customers
========================================================= */

customersRouter.post(
  "/",
  asyncHandler(async (request, response) => {
    const { name, email, phone } = request.body;

    // Validation
    if (!name || !email || !phone) {
      throw new HttpError(
        400,
        "Name, email and phone are required"
      );
    }

    try {
      const result = await query(
        `INSERT INTO customers
          (
            partner_id,
            name,
            email,
            phone
          )
         VALUES
          ($1, $2, $3, $4)
         RETURNING
          id,
          partner_id,
          name,
          email,
          phone,
          created_at,
          updated_at`,
        [
          request.auth.sub,
          name.trim(),
          email.trim(),
          phone.trim(),
        ]
      );

      response.status(201).json({
        success: true,
        message: "Customer created successfully",
        data: result.rows[0],
      });
    } catch (error) {
      console.error("CUSTOMER CREATE ERROR:", error);

      // Duplicate email
      if (error.code === "23505") {
        throw new HttpError(
          409,
          "A customer with this email already exists"
        );
      }

      // Foreign key error
      if (error.code === "23503") {
        throw new HttpError(
          400,
          "Invalid partner information"
        );
      }

      throw new HttpError(
        500,
        error.message || "Failed to create customer"
      );
    }
  })
);


/* =========================================================
   GET ALL CUSTOMERS
   GET /api/v1/customers
========================================================= */

customersRouter.get(
  "/",
  asyncHandler(async (request, response) => {
    const {
      page,
      size,
      offset,
    } = pagination(request.query);

    const search =
      `%${request.query.search ?? ""}%`;

    const [items, count] = await Promise.all([
      query(
        `SELECT
          c.*,

          COUNT(b.id)::int AS booking_count,

          COALESCE(
            SUM(b.total_amount)
            FILTER (
              WHERE b.status IN (
                'CONFIRMED',
                'COMPLETED'
              )
            ),
            0
          ) AS total_spent,

          MAX(b.starts_at) AS last_booking_at

        FROM customers c

        LEFT JOIN bookings b
          ON b.customer_id = c.id

        WHERE
          c.partner_id = $1
          AND (
            c.name ILIKE $2
            OR c.email ILIKE $2
            OR c.phone ILIKE $2
          )

        GROUP BY c.id

        ORDER BY
          last_booking_at DESC NULLS LAST

        LIMIT $3
        OFFSET $4`,
        [
          request.auth.sub,
          search,
          size,
          offset,
        ]
      ),

      query(
        `SELECT COUNT(*)
         FROM customers
         WHERE
           partner_id = $1
           AND (
             name ILIKE $2
             OR email ILIKE $2
             OR phone ILIKE $2
           )`,
        [
          request.auth.sub,
          search,
        ]
      ),
    ]);

    response.json({
      success: true,
      data: pageResult(
        items.rows,
        count.rows[0].count,
        page,
        size
      ),
    });
  })
);


/* =========================================================
   GET SINGLE CUSTOMER
   GET /api/v1/customers/:id
========================================================= */

customersRouter.get(
  "/:id",
  asyncHandler(async (request, response) => {
    const customer = await query(
      `SELECT *
       FROM customers
       WHERE
         id = $1
         AND partner_id = $2`,
      [
        request.params.id,
        request.auth.sub,
      ]
    );

    if (!customer.rows[0]) {
      throw new HttpError(
        404,
        "Customer not found"
      );
    }

    const bookings = await query(
      `SELECT
        b.*,
        c.name AS court_name

       FROM bookings b

       JOIN courts c
         ON c.id = b.court_id

       WHERE
         b.customer_id = $1

       ORDER BY
         b.starts_at DESC`,
      [
        request.params.id,
      ]
    );

    response.json({
      success: true,
      data: {
        ...customer.rows[0],
        bookings: bookings.rows,
      },
    });
  })
);


/* =========================================================
   UPDATE CUSTOMER
   PATCH /api/v1/customers/:id
========================================================= */

customersRouter.patch(
  "/:id",
  asyncHandler(async (request, response) => {
    const {
      name,
      email,
      phone,
    } = request.body;

    // Validation
    if (!name || !email || !phone) {
      throw new HttpError(
        400,
        "Name, email and phone are required"
      );
    }

    // Check ownership
    const existing = await query(
      `SELECT id
       FROM customers
       WHERE
         id = $1
         AND partner_id = $2`,
      [
        request.params.id,
        request.auth.sub,
      ]
    );

    if (!existing.rows[0]) {
      throw new HttpError(
        404,
        "Customer not found"
      );
    }

    try {
      const result = await query(
        `UPDATE customers
         SET
           name = $1,
           email = $2,
           phone = $3,
           updated_at = NOW()

         WHERE
           id = $4
           AND partner_id = $5

         RETURNING
           id,
           partner_id,
           name,
           email,
           phone,
           created_at,
           updated_at`,
        [
          name.trim(),
          email.trim(),
          phone.trim(),
          request.params.id,
          request.auth.sub,
        ]
      );

      if (!result.rows[0]) {
        throw new HttpError(
          404,
          "Customer not found"
        );
      }

      response.json({
        success: true,
        message: "Customer updated successfully",
        data: result.rows[0],
      });
    } catch (error) {
      console.error("CUSTOMER UPDATE ERROR:", error);

      if (error instanceof HttpError) {
        throw error;
      }

      // Duplicate email
      if (error.code === "23505") {
        throw new HttpError(
          409,
          "A customer with this email already exists"
        );
      }

      throw new HttpError(
        500,
        error.message || "Failed to update customer"
      );
    }
  })
);


/* =========================================================
   DELETE CUSTOMER
   DELETE /api/v1/customers/:id
========================================================= */

customersRouter.delete(
  "/:id",
  asyncHandler(async (request, response) => {
    // Check ownership first
    const existing = await query(
      `SELECT
         id,
         name
       FROM customers
       WHERE
         id = $1
         AND partner_id = $2`,
      [
        request.params.id,
        request.auth.sub,
      ]
    );

    if (!existing.rows[0]) {
      throw new HttpError(
        404,
        "Customer not found"
      );
    }

    try {
      const result = await query(
        `DELETE FROM customers
         WHERE
           id = $1
           AND partner_id = $2

         RETURNING
           id,
           name,
           email,
           phone`,
        [
          request.params.id,
          request.auth.sub,
        ]
      );

      if (!result.rows[0]) {
        throw new HttpError(
          404,
          "Customer not found"
        );
      }

      response.json({
        success: true,
        message: "Customer deleted successfully",
        data: result.rows[0],
      });
    } catch (error) {
      console.error("CUSTOMER DELETE ERROR:", error);

      if (error instanceof HttpError) {
        throw error;
      }

      // Customer has related records
      if (error.code === "23503") {
        throw new HttpError(
          409,
          "This customer cannot be deleted because they have related bookings"
        );
      }

      throw new HttpError(
        500,
        error.message || "Failed to delete customer"
      );
    }
  })
);