import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function OrderReceipt() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const res = await axios.get(`/api/orders/${id}`); // ensure API exists and protected if necessary
      setOrder(res.data);
    };
    fetchOrder();
  }, [id]);

  if (!order) return <div>Loading...</div>;

  const downloadBill = () => {
    // simple printable window - user can Save as PDF
    const win = window.open("", "_blank");
    win.document.write(`<h1>Invoice</h1>`);
    win.document.write(`<p>Order ID: ${order._id}</p>`);
    win.document.write(`<p>Date: ${new Date(order.createdAt).toLocaleString()}</p>`);
    win.document.write("<hr/>");
    win.document.write("<ul>");
    (order.items || []).forEach(it => {
      win.document.write(`<li>${it.name} x ${it.qty} — ₹${it.price}</li>`);
    });
    win.document.write("</ul>");
    win.document.write(`<h3>Total: ₹${order.amount}</h3>`);
    win.document.close();
    win.print();
  };

  return (
    <div>
      <h2>Order Receipt</h2>
      <p>Order #: {order._id}</p>
      <p>Status: {order.status}</p>
      <p>Amount: ₹{order.amount}</p>
      <button onClick={downloadBill}>Download / Print Bill</button>
    </div>
  );
}
