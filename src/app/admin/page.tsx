"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface OrderItem {
  name: string;
  qty: number;
}

interface Order {
  id: string;
  created: number;
  email: string;
  name: string;
  phone: string;
  address: {
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
  } | null;
  amount: number;
  items: OrderItem[];
  status: string;
  customerPurchaseCount: number;
}

interface Customer {
  email: string;
  name: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: number;
}

interface DashboardData {
  orders: Order[];
  customers: Customer[];
  summary: {
    totalOrders: number;
    totalRevenue: number;
    uniqueCustomers: number;
  };
}

type Tab = "orders" | "customers";

function formatDate(unix: number) {
  return new Date(unix * 1000).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAddress(addr: Order["address"]) {
  if (!addr) return "-";
  return `〒${addr.postal_code || ""} ${addr.state || ""}${addr.city || ""}${addr.line1 || ""}${addr.line2 ? " " + addr.line2 : ""}`;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("orders");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchOrders = useCallback(async (secret: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${secret}` },
      });
      if (!res.ok) {
        if (res.status === 401) {
          setAuthenticated(false);
          setError("パスワードが正しくありません");
          return;
        }
        throw new Error("Failed to fetch");
      }
      const json = await res.json();
      setData(json);
      setAuthenticated(true);
    } catch {
      setError("データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem("admin-secret");
    if (stored) {
      setPassword(stored);
      fetchOrders(stored);
    }
  }, [fetchOrders]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem("admin-secret", password);
    fetchOrders(password);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-2 text-center">
            管理者ダッシュボード
          </h1>
          <p className="text-sm text-gray-500 mb-6 text-center">
            三十日珈琲 Shared Roasting
          </p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="管理者パスワード"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? "読み込み中..." : "ログイン"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-gray-900">三十日珈琲 管理画面</h1>
            <Link
              href="/"
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              サイトへ戻る
            </Link>
          </div>
          <button
            onClick={() => fetchOrders(password)}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            更新
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">総注文数</p>
            <p className="text-3xl font-bold text-gray-900">
              {data.summary.totalOrders}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">総売上</p>
            <p className="text-3xl font-bold text-gray-900">
              ¥{data.summary.totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">顧客数</p>
            <p className="text-3xl font-bold text-gray-900">
              {data.summary.uniqueCustomers}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-6">
          <button
            onClick={() => setTab("orders")}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === "orders"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            注文一覧
          </button>
          <button
            onClick={() => setTab("customers")}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === "customers"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            顧客一覧
          </button>
        </div>

        {/* Orders Tab */}
        {tab === "orders" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {data.orders.length === 0 ? (
              <p className="text-center text-gray-400 py-16">
                まだ注文がありません
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {data.orders.map((order) => (
                  <div key={order.id}>
                    <button
                      onClick={() =>
                        setExpandedOrder(
                          expandedOrder === order.id ? null : order.id
                        )
                      }
                      className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-gray-900">
                            {order.name || "名前未入力"}
                          </span>
                          {order.customerPurchaseCount > 1 && (
                            <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
                              {order.customerPurchaseCount}回目
                            </span>
                          )}
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              order.status === "paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {order.status === "paid" ? "支払済" : order.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          {formatDate(order.created)} ・{" "}
                          {order.items
                            .map((i) => `${i.name}×${i.qty}`)
                            .join(", ") || "商品情報なし"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          ¥{order.amount.toLocaleString()}
                        </p>
                      </div>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          expandedOrder === order.id ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Expanded Details */}
                    {expandedOrder === order.id && (
                      <div className="px-6 pb-5 bg-gray-50 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">メール</p>
                          <p className="text-gray-700">{order.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">電話番号</p>
                          <p className="text-gray-700">
                            {order.phone || "-"}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-400 mb-1">配送先</p>
                          <p className="text-gray-700">
                            {formatAddress(order.address)}
                          </p>
                        </div>
                        <div className="col-span-2 md:col-span-4">
                          <p className="text-xs text-gray-400 mb-1">
                            注文ID
                          </p>
                          <p className="text-gray-500 text-xs font-mono">
                            {order.id}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Customers Tab */}
        {tab === "customers" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {data.customers.length === 0 ? (
              <p className="text-center text-gray-400 py-16">
                まだ顧客データがありません
              </p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-xs text-gray-400">
                    <th className="text-left px-6 py-3 font-medium">
                      顧客
                    </th>
                    <th className="text-left px-4 py-3 font-medium">
                      電話番号
                    </th>
                    <th className="text-center px-4 py-3 font-medium">
                      注文回数
                    </th>
                    <th className="text-right px-4 py-3 font-medium">
                      累計購入額
                    </th>
                    <th className="text-right px-6 py-3 font-medium">
                      最終注文
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.customers.map((customer) => (
                    <tr
                      key={customer.email}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-sm text-gray-900">
                          {customer.name || "-"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {customer.email}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {customer.phone || "-"}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-block text-sm font-medium px-3 py-1 rounded-full ${
                            customer.orderCount >= 3
                              ? "bg-amber-100 text-amber-700"
                              : customer.orderCount >= 2
                                ? "bg-blue-50 text-blue-600"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {customer.orderCount}回
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-medium text-gray-900">
                        ¥{customer.totalSpent.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-gray-400">
                        {formatDate(customer.lastOrderDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
