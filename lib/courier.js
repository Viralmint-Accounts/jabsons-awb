import axios from "axios";
import Token from "./Token.js";

const BASE_URL =
  "https://customerapi.sevasetu.in/index.php/clientbooking_v5";

// 🔐 Get Token (FORCE NEW TOKEN FOR DEBUG)
export async function getToken() {
  try {
    // ✅ Check cached token
    const existing = await Token.findOne();

    if (
      existing &&
      new Date(existing.expiresAt) > new Date()
    ) {
      console.log("Using cached token");
      return existing.token;
    }

    console.log("Fetching new token...");
console.log("Courier Username:", process.env.COURIER_USERNAME);
console.log("Client ID:", process.env.CLIENT_ID);
console.log("Secret Key Exists:", !!process.env.SECRET_KEY);
console.log("Password Exists:", !!process.env.COURIER_PASSWORD);
    const res = await axios.post(
      `${BASE_URL}/login`,
      {
        data: {
          login_username: process.env.COURIER_USERNAME,
          login_password: process.env.COURIER_PASSWORD,
        },
      },
      {
        headers: {
          secretkey: process.env.SECRET_KEY,
          clientid: process.env.CLIENT_ID,
          "Content-Type": "application/json",
        },
      }
    );

    if (res.data.success !== "1") {
      throw new Error(`Login failed: ${res.data.message}`);
    }

    const token = res.data.AuthToken;

    // ✅ Save token
    await Token.deleteMany({});

    await Token.create({
      token,
      expiresAt: res.data.TokenExpiredOn,
    });

    console.log("New token saved");

    return token;
  } catch (error) {
    console.error(
      "Token Error:",
      error.response?.data || error.message
    );

    throw error;
  }
}

// 🚚 Create Shipment
export async function createShipment(order) {
  try {
    const token = await getToken();

    // ✅ 14-digit Document Ref
    const docRef = `${Date.now()}${Math.floor(
      1000 + Math.random() * 9000
    )}`.slice(0, 14);

    console.log("Generated DocRef:", docRef);

    if (!order?.pincode || !order?.name) {
      throw new Error("Invalid order data");
    }

    // 📱 Clean phone
    const cleanPhone = (order.phone || "").replace(/\D/g, "").slice(-10);
    const finalPhone =
      cleanPhone.length === 10 ? cleanPhone : "9999999999";

    // 📦 Create Shipment
    const payload = {
      Data: [
        {
          data: {
            ClientRefID: process.env.CLIENT_ID,
            IsDP: "0",
            ReceiverName: order.name,
            DocumentNoRef: docRef,
            OrderNo: `${order.id}`,
            PickupPincode: "392001",
            ToPincode: order.pincode,
            CodBooking: "0",
            TypeID: "2",
            ServiceTypeID: "1",
            TravelBy: "1",
            Weight: "100",
            Length: "10",
            Width: "10",
            Height: "10",
            ValueRs: "100",
            ReceiverAddress: order.address || "N/A",
            ReceiverCity: order.city || "N/A",
            ReceiverState: "1",
            Area: "Area",
            ReceiverMobile: finalPhone,
            ReceiverEmail: order.email || "test@test.com",
            Remarks: "Shopify Order",
            UserID: "71704",
          },
        },
      ],
    };

    const res = await axios.post(
      `${BASE_URL}/insertbooking`,
      payload,
      {
        headers: {
          token,
          clientid: process.env.CLIENT_ID,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Booking Response:", res.data);

    // 📌 Extract AWB (try all possible fields)
    const awb =
      res.data?.AWBNo ||
      res.data?.awb ||
      res.data?.data?.AWBNo ||
      res.data?.data?.awb ||
  docRef; // ✅ fallback
  

    console.log("AWB Number:", awb);

    return {
      ...res.data,
      awb,
    };
  } catch (error) {
    console.error("Shipment Error:", error.response?.data || error.message);
    throw error;
  }
}