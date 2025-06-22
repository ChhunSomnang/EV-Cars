'use client'
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "app/lib/store";

export default function Checkout() {
  const [isClient, setIsClient] = useState(false); // Track if the component is mounted on the client
  const cartProducts = useSelector((state: RootState) => state.cart.items);

  useEffect(() => {
    setIsClient(true); // Set to true after the component mounts on the client
  }, []);

  // Prevent rendering anything until the component is mounted on the client
  if (!isClient) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Calculate totals
  const subtotal = cartProducts.reduce(
    (acc, product) => acc + product.price * product.quantity,
    0
  );
  const shipping = cartProducts.length > 0 ? 5.0 : 0;
  const tax = subtotal * 0.09;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full">
        {/* Shipping Address */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
          <form className="space-y-4">
            <input
              type="text"
              placeholder="First & Last Name"
              className="w-full p-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Address 1"
              className="w-full p-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Address 2"
              className="w-full p-2 border rounded-md"
            />
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="City"
                className="p-2 border rounded-md"
              />
              <select
                className="p-2 border rounded-md"
                defaultValue=""
              >
                <option value="" disabled>
                  Select state
                </option>
                <option value="NY">New York</option>
                <option value="CA">California</option>
              </select>
              <input
                type="text"
                placeholder="Zip code"
                className="p-2 border rounded-md"
              />
            </div>
          </form>
        </div>

        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          {cartProducts.length > 0 ? (
            cartProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center space-x-4 mb-2"
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div>
                  <h3 className="font-medium">{product.title}</h3>
                  <p className="text-gray-500 text-sm">
                    Quantity: {product.quantity}
                  </p>
                  <p className="text-gray-700 font-semibold">
                    ${(product.price * product.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Your cart is empty.</p>
          )}
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span> <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span> <span>${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span> <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span> <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <button className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-md">
            Place Order
          </button>
        </div>

        {/* Payment Method */}
        <div className="bg-white p-6 rounded-xl shadow-md md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button className="border p-2 rounded-md text-center bg-indigo-100">
              Card
            </button>
            <button className="border p-2 rounded-md text-center">
              Wallet
            </button>
            <button className="border p-2 rounded-md text-center">
              KH QR
            </button>
          </div>
          <form className="space-y-4">
            <input
              type="text"
              placeholder="First & Last Name"
              className="w-full p-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Card Number"
              className="w-full p-2 border rounded-md"
            />
            <div className="grid grid-cols-3 gap-4">
              <select
                className="p-2 border rounded-md"
                defaultValue=""
              >
                <option value="" disabled>
                  MM
                </option>
                <option value="01">01</option>
                <option value="02">02</option>
              </select>
              <select
                className="p-2 border rounded-md"
                defaultValue=""
              >
                <option value="" disabled>
                  YYYY
                </option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
              <input
                type="text"
                placeholder="CVV"
                className="p-2 border rounded-md"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}