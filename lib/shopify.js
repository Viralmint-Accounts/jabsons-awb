import axios from "axios";

export async function fulfillOrder(orderId, trackingNumber) {
  try {
    console.log("Starting Shopify fulfillment...");

    // STEP 1: Get fulfillment orders
    const fulfillmentOrdersUrl = `https://${process.env.SHOPIFY_STORE}/admin/api/2024-01/orders/${orderId}/fulfillment_orders.json`;

    const fulfillmentOrdersRes = await axios.get(
      fulfillmentOrdersUrl,
      {
        headers: {
          "X-Shopify-Access-Token":
            process.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "Fulfillment Orders:",
      JSON.stringify(fulfillmentOrdersRes.data, null, 2)
    );

    const fulfillmentOrder =
      fulfillmentOrdersRes.data.fulfillment_orders?.[0];

    if (!fulfillmentOrder) {
      throw new Error("No fulfillment order found");
    }

    // STEP 2: Create fulfillment
    const fulfillUrl = `https://${process.env.SHOPIFY_STORE}/admin/api/2024-01/fulfillments.json`;

    const payload = {
      fulfillment: {
        notify_customer: true,
        tracking_info: {
          number: trackingNumber,
          company: "Sevasetu",
        },
        line_items_by_fulfillment_order: [
          {
            fulfillment_order_id: fulfillmentOrder.id,
          },
        ],
      },
    };

    const res = await axios.post(
      fulfillUrl,
      payload,
      {
        headers: {
          "X-Shopify-Access-Token":
            process.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "Shopify Fulfillment Success:",
      JSON.stringify(res.data, null, 2)
    );

    return res.data;
  } catch (error) {
    console.error(
      "Shopify Fulfillment Error:",
      error.response?.data || error.message
    );
  }
}