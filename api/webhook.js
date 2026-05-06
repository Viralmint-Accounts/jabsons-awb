import { connectDB } from "../lib/db.js";
import { createShipment } from "../lib/courier.js";
import { fulfillOrder } from "../lib/shopify.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  await connectDB();

  const order = req.body;

  // ❌ Skip unpaid / voided orders
  if (order.financial_status !== "paid") {
    console.log("Skipping order - not paid or invalid");
    return res.status(200).json({ message: "Order not paid" });
  }

  // 🔍 Debug Shopify order
  console.log("Shopify Order:", JSON.stringify(order, null, 2));

  const shipmentData = {
    id: order.id,
    name: order.shipping_address?.name,
    address: order.shipping_address?.address1,
    city: order.shipping_address?.city,
    pincode: order.shipping_address?.zip,
    phone: order.shipping_address?.phone,
    email: order.email,
  };

  try {
    const result = await createShipment(shipmentData);

    console.log("Shipment Created:", result);

    // 🔍 FULL RESPONSE
    console.log("FULL COURIER RESPONSE:", JSON.stringify(result, null, 2));

    // 📦 AWB extract
    const awb = result?.awb || null;
    console.log("Final AWB:", awb);
// 🚚 Send to Shopify
if (awb) {
  await fulfillOrder(order.id, awb);
}
    return res.status(200).json({
      success: true,
      courierResponse: result,
      awb: awb,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: "Shipment failed" });
  }
}