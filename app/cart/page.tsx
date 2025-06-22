"use client";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "app/lib/store";
import { loadCartFromStorage, removeFromCart, updateQuantity } from "app/lib/features/store/cartSlice";
import { Button } from "@/components/ui/button"
import Link from "next/link";

const CartPage = () => {
  const cartProducts = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        dispatch(loadCartFromStorage(parsedCart));
      }
    }
  }, [dispatch]);

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity >= 1) {
      dispatch(updateQuantity({ id, quantity }));
    }
  };

  const handleRemoveProduct = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const totalPrice = cartProducts.reduce(
    (acc, product) => acc + product.price * product.quantity,
    0
  );

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-center">Shopping Cart</h1>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="border p-4">Product</th>
              <th className="border p-4">Quantity</th>
              <th className="border p-4">Price</th>
              <th className="border p-4">Total</th>
              <th className="border p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cartProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  Your cart is empty.
                </td>
              </tr>
            ) : (
              cartProducts.map((product) => (
                <tr key={product.id}>
                  <td className="border p-4">
                    <div className="flex items-center">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-16 h-16 mr-4 object-cover"
                      />
                      <span>{product.title}</span>
                    </div>
                  </td>
                  <td className="border p-4">
                    <input
                      type="number"
                      value={product.quantity}
                      min="1"
                      className="w-16 px-2 py-1 text-center border rounded"
                      onChange={(e) =>
                        handleQuantityChange(product.id, Number(e.target.value))
                      }
                    />
                  </td>
                  <td className="border p-4">
                    {product.price} {product.eCurrencyType || ""}
                  </td>
                  <td className="border p-4">
                    {(product.price * product.quantity).toFixed(2)}
                  </td>
                  <td className="border p-4">
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleRemoveProduct(product.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end mt-6">
        <h2 className="text-2xl font-semibold">
          Total: {totalPrice.toFixed(2)}{" "}
          {cartProducts[0]?.eCurrencyType || ""}
        </h2>
      </div>
      <div className="flex justify-center bg-">

      <Link href="/checkout/shipping" passHref>
          <Button className="bg-black text-white">Check Out</Button>
        </Link>
      </div>
    </div>
  );
};

export default CartPage;