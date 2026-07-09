const { app } = require("@azure/functions");
const { sql, getPool } = require("../shared/db");

app.http("addSupplier", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "suppliers",
    handler: async (request, context) => {
        try {
            const { supplierId, supplierName, email, phone, supplierType, address } = await request.json();
            const pool = await getPool();

            await pool.request()
                .input("supplierId", sql.NVarChar, supplierId)
                .input("supplierName", sql.NVarChar, supplierName)
                .input("email", sql.NVarChar, email)
                .input("phone", sql.NVarChar, phone)
                .input("supplierType", sql.NVarChar, supplierType)
                .input("address", sql.NVarChar, address)
                .query(`
                    INSERT INTO Suppliers (SupplierId, SupplierName, Email, Phone, SupplierType, Address)
                    VALUES (@supplierId, @supplierName, @email, @phone, @supplierType, @address)
                `);

            return { status: 201, jsonBody: { success: true, message: "Supplier added successfully", supplierId } };
        } catch (error) {
            context.error(error);
            return { status: 500, jsonBody: { success: false, message: error.message } };
        }
    }
});
