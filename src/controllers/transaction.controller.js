import { response } from "../utils/response.js";
import db from "../utils/db.js";
import { topupSchema } from "../model/transcation.model.js";
import { ZodError } from "zod";
import { v4 as uuidv4 } from "uuid";

function generateInvoiceNumber() {
  const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const uniqueId = uuidv4().split("-")[0].toUpperCase();
  return `INV${date}-${uniqueId}`;
}

export const balance = async (req, res) => {
  try {
    const user = req.user;
    const result = await db.query(
      "SELECT balance FROM users WHERE email = $1",
      [user.email]
    );
    response(res, 200, 0, "Get balance berhasil", {
      balance: result.rows[0].balance,
    });
  } catch (error) {
    res.status(500).json({ message: "Error get balance user", error });
  }
};

export const topup = async (req, res) => {
  try {
    const user = req.user;
    const validation = topupSchema.parse(req.body);

    console.log(validation.top_up_ammount);

    const client = await db.connect();
    const invoiceNumber = generateInvoiceNumber();
    const transactionType = "TOPUP";

    try {
      await client.query("BEGIN");

      await client.query(
        "UPDATE users SET balance = $1 + balance WHERE email = $2",
        [validation.top_up_ammount, user.email]
      );

      await client.query(
        "INSERT INTO transaction (invoice_number, user_id, transaction_type, total_amount, description, created_on) " +
          "VALUES ($1, $2, $3, $4, $5, NOW())",
        [
          invoiceNumber,
          user.id,
          transactionType,
          validation.top_up_ammount,
          `Top up sebesar ${validation.top_up_ammount}`,
        ]
      );

      await client.query("COMMIT");

      const balanceResult = await client.query(
        "SELECT * FROM users WHERE email = $1",
        [user.email]
      );

      console.log(balanceResult.rows[0]);

      return res.status(200).json({
        status: 0,
        message: "Top Up Balance berhasil",
        data: {
          balance: balanceResult.rows[0].balance,
        },
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    if (error instanceof ZodError) {
      const topUpError = error.issues.some((issue) =>
        issue.path.includes("top_up_amount")
      );

      if (topUpError) {
        return res.status(400).json({
          status: 102,
          message:
            "Parameter amount hanya boleh angka dan tidak boleh lebih kecil dari 0",
          data: null,
        });
      }
    }

    console.error(error);
    return res.status(500).json({
      status: 104,
      message: "Terjadi kesalahan saat melakukan Top Up",
      data: null,
    });
  }
};

export const transaction = async (req, res) => {
  try {
    const user = req.user;
    const { service_code } = req.body;

    if (!service_code) {
      return res.status(400).json({
        status: 102,
        message: "Service wajib ada",
        data: null,
      });
    }

    const serviceResult = await db.query(
      "SELECT id, service_name, service_tariff FROM services WHERE service_code = $1",
      [service_code]
    );

    if (serviceResult.rows.length === 0) {
      return res.status(400).json({
        status: 102,
        message: "Service atau layanan tidak ditemukan",
        data: null,
      });
    }

    const service = serviceResult.rows[0];

    const userResult = await db.query(
      "SELECT id, balance FROM users WHERE email = $1",
      [user.email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        status: 101,
        message: "User tidak ditemukan",
        data: null,
      });
    }

    const userBalance = parseFloat(userResult.rows[0].balance);

    console.log(
      `User balance ${userBalance} service tariff ${service.service_tariff}`
    );

    if (userBalance < service.service_tariff) {
      return res.status(400).json({
        status: 103,
        message: "Balance tidak mencukupi",
        data: null,
      });
    }

    const invoiceNumber = generateInvoiceNumber();
    const transactionType = "PAYMENT";

    const client = await db.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        "UPDATE users SET balance = balance - $1 WHERE email = $2",
        [service.service_tariff, user.email]
      );

      const transactionQuery =
        "INSERT INTO transaction (invoice_number, user_id, service_id, transaction_type, total_amount, description, created_on) " +
        "VALUES ($1, $2, $3, $4, $5, $6, NOW())";

      await client.query(transactionQuery, [
        invoiceNumber,
        userResult.rows[0].id,
        service.id,
        transactionType,
        service.service_tariff,
        `Pembayaran untuk layanan ${service.service_name}`,
      ]);

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    response(res, 200, 0, "Transaksi Berhasil", {
      invoice_number: invoiceNumber,
      service_code,
      service_name: service.service_name,
      transaction_type: transactionType,
      total_amount: service.service_tariff,
      created_on: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 104,
      message: "Terjadi kesalahan saat memproses transaksi",
      data: null,
    });
  }
};

export const getTransactionHistory = async (req, res) => {
  try {
    const user = req.user;
    const { offset = 0, limit } = req.query;

    if (isNaN(offset) || offset < 0) {
      return res.status(400).json({
        status: 102,
        message: "Offset harus berupa angka positif",
        data: null,
      });
    }

    if (limit && (isNaN(limit) || limit < 0)) {
      return res.status(400).json({
        status: 102,
        message: "Limit harus berupa angka positif",
        data: null,
      });
    }

    const query = `
      SELECT 
        invoice_number, 
        transaction_type, 
        description, 
        total_amount, 
        created_on
      FROM transaction
      WHERE user_id = $1
      ORDER BY created_on DESC
      ${limit ? "LIMIT $2 OFFSET $3" : ""}
    `;

    const queryParams = limit ? [user.id, limit, offset] : [user.id];

    const result = await db.query(query, queryParams);

    response(res, 200, 0, "Get History Berhasil", {
      offset: parseInt(offset, 10),
      limit: limit ? parseInt(limit, 10) : null,
      records: result.rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 104,
      message: "Terjadi kesalahan saat mengambil riwayat transaksi",
      data: null,
    });
  }
};
