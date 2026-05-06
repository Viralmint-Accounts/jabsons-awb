import axios from "axios";

export async function fulfillOrder(orderId, trackingNumber) {
  try {
    const url = `https://${process.env.SHOPIFY_STORE}/admin/api/2024-01/orders/${orderId}/fulfillments.json`;

    const res = await axios.post(
      url,
      {
        fulfillment: {
          notify_customer: true,
          tracking_info: {
            number: trackingNumber,
            company: "Sevasetu",
          },
        },
      },
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

    throw error;
  }
}