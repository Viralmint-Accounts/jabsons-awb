import axios from "axios";

const testOrder = {
  id: 12345,
  shipping_address: {
    name: "Test User",
    address1: "Gota",
    city: "Ahmedabad",
    zip: "380016",
    phone: "9898989898",
  },
  email: "test@gmail.com",
};

axios
  .post("http://localhost:3000/api/webhook", testOrder)
  .then((res) => console.log(res.data))
  .catch((err) => console.log(err.response?.data || err.message));