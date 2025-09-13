import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { Card, Button, Spinner, Alert, Badge } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { executeRawQuery } from "../api";
import Sidebar from "../../components/Sidebar";

// Interfaces
interface ExamPackage {
  id: number;
  name: string;
  description: string;
  applicableGrades: number;
  subjects: string;
  examType: string;
  questionTypes: string[];
  totalQuestions: number;
  duration: number;
  markingScheme: {
    perQuestion: number;
    negative: boolean;
  };
  languageOptions: string[];
  countries: {
    id: number;
    examPackageId: number;
    countryId: number;
    price: number | null;
    startDateTime: string;
    endDateTime: string;
    validity: number;
    isActive: boolean;
    country: {
      id: number;
      name: string;
      code: string;
      price: number;
      currency: any; // API sometimes sends JSON, sometimes object
      flag: string;
      isoCode: string;
    };
  }[];
  examStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface UserPackageResponse {
  getUserPackageByClassAndCountry: {
    success: boolean;
    message: string;
    data: ExamPackage[];
  };
}

interface CreateOrderResponse {
  CreateOrder: {
    success: boolean;
    key: string;
    orderId: string;
    amount: number;
    currency: string;
  };
}

interface VerifyPaymentResponse {
  VerifyPayment: {
    success: boolean;
    message: string;
  };
}

// GraphQL Mutations
const CREATE_ORDER = `
  mutation CreateOrder($userId: Int!, $amount: Int!, $currency: String, $receipt: String) {
    CreateOrder(userId: $userId, amount: $amount, currency: $currency, receipt: $receipt) {
      success
      key
      orderId
      amount
      currency
    }
  }
`;

const VERIFY_PAYMENT = `
  mutation VerifyPayment($orderId: String!, $paymentId: String!, $signature: String!) {
    VerifyPayment(orderId: $orderId, paymentId: $paymentId, signature: $signature) {
      success
      message
    }
  }
`;

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userPackage, setUserPackage] = useState<ExamPackage[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState<boolean>(user?.isPaid || false);

  useEffect(() => {
    if (user) fetchUserPackage();
  }, [user]);

  const fetchUserPackage = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const userPackageQuery = `
      query GetUserPackageByClassAndCountry($userId: Int!) {
        getUserPackageByClassAndCountry(userId: $userId) {
          success
          message
          data {
            id
            name
            description
            applicableGrades
            subjects
            examType
            questionTypes
            totalQuestions
            duration
            markingScheme { perQuestion negative }
            languageOptions
            countries {
              id
              examPackageId
              countryId
              price
              startDateTime
              endDateTime
              validity
              isActive
              country {
                id
                name
                code
                price
                currency
                flag
                isoCode
              }
            }
            examStatus
            createdAt
            updatedAt
          }
        }
      }
    `;

    try {
      // ✅ FIXED: remove extra `.data` nesting
      const response = await executeRawQuery<UserPackageResponse>(
        userPackageQuery,
        { userId: parseInt(user.id, 10) },
      );

      if (response?.getUserPackageByClassAndCountry?.success) {
        setUserPackage(response.getUserPackageByClassAndCountry.data);
      } else {
        setError(
          response?.getUserPackageByClassAndCountry?.message ||
            "Failed to fetch user package",
        );
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("An error occurred while fetching your exam package");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ✅ Payment flow
  const handlePayment = async (pkg: ExamPackage) => {
    if (!user) {
      alert("User not found. Please login again.");
      return;
    }

    try {
      const price = pkg.countries[0]?.price ?? pkg.countries[0]?.country?.price;

      // Safely handle currency (object or JSON string)
      const currencyData = pkg.countries[0]?.country?.currency;
      let currencyObj: { symbol?: string; name?: string; code?: string } = {};

      try {
        if (typeof currencyData === "string") {
          currencyObj = JSON.parse(currencyData);
        } else {
          currencyObj = currencyData || {};
        }
      } catch {
        currencyObj = {};
      }

      const currency = currencyObj?.code || "INR";
      const receipt = `receipt_${Date.now()}`;

      const orderResp = await executeRawQuery<CreateOrderResponse>(
        CREATE_ORDER,
        {
          userId: parseInt(user.id, 10),
          amount: price,
          currency,
          receipt,
        },
      );

      const order = orderResp?.CreateOrder;
      const isSuccess = Boolean(order.success);
      if (!order || !isSuccess) {
        alert("Failed to create order");
        return;
      }

      const options = {
        key: order.key,
        amount: order.amount * 100,
        currency: order.currency,
        name: "Exam Platform",
        description: pkg.name,
        order_id: order.orderId,
        handler: async function (response: any) {
          const verifyResp = await executeRawQuery<VerifyPaymentResponse>(
            VERIFY_PAYMENT,
            {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            },
          );

          const verifyResult = verifyResp?.VerifyPayment;
          if (verifyResult?.success) {
            alert("Payment successful ✅");
            setIsPaid(true);
          } else {
            alert("Payment verification failed ❌");
          }
        },
        prefill: { name: user.fullname, email: user.email },
        theme: { color: "#2563eb" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Something went wrong during payment");
    }
  };

  const formatDate = (timestamp: string) => {
    if (!timestamp) return "N/A";
    const date = new Date(parseInt(timestamp, 10));
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex">
      {/* ✅ Sidebar always rendered if user exists */}
      {user && (
        <Sidebar
          userData={{
            id: user.id,
            fullname: user.fullname,
            email: user.email,
            mobile: user.mobile,
            class: user.class,
            country: user.country,
            isPaid,
            examType: user.examType,
          }}
          onLogout={handleLogout}
        />
      )}

      {/* ✅ Main Content */}
      <main className="mt-32 md:mt-0">
        <div className="space-y-8">
          <Card className="h-screen w-full">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">
              Your Exam Package
            </h2>
            <div>
              {loading && (
                <div className="flex items-center justify-center py-6">
                  <Spinner size="xl" />
                  <span className="ml-3 text-gray-600">
                    Loading packages...
                  </span>
                </div>
              )}

              {error && (
                <Alert color="failure" className="mb-6">
                  <span className="font-medium">Error:</span> {error}
                </Alert>
              )}

              {!loading && !error && userPackage && userPackage.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {userPackage.map((pkg) => (
                    <Card
                      key={pkg.id}
                      className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-lg"
                    >
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="text-lg font-bold">{pkg.name}</h4>
                          <Badge
                            color={
                              pkg.examStatus === "upcoming"
                                ? "info"
                                : pkg.examStatus === "active"
                                  ? "success"
                                  : "failure"
                            }
                          >
                            {pkg.examStatus}
                          </Badge>
                        </div>
                        <p className="mb-4 text-sm text-gray-600">
                          {pkg.description}
                        </p>

                        <div className="space-y-1 text-sm text-gray-700">
                          <p>
                            <span className="font-medium">Exam Type:</span>{" "}
                            {pkg.examType}
                          </p>
                          <p>
                            <span className="font-medium">Subjects:</span>{" "}
                            {pkg.subjects}
                          </p>
                          <p>
                            <span className="font-medium">Questions:</span>{" "}
                            {pkg.totalQuestions}
                          </p>
                          <p>
                            <span className="font-medium">Duration:</span>{" "}
                            {pkg.duration} mins
                          </p>
                          <p>
                            <span className="font-medium">Start Date:</span>{" "}
                            {formatDate(pkg.countries[0]?.startDateTime)}
                          </p>
                          <p>
                            <span className="font-medium">Country:</span>{" "}
                            {pkg.countries[0]?.country?.name}
                          </p>
                          <p>
                            <span className="font-medium">Price:</span>{" "}
                            {(() => {
                              let currencyObj: { symbol?: string } = {};
                              try {
                                const currency =
                                  pkg.countries[0]?.country?.currency;
                                if (typeof currency === "string") {
                                  currencyObj = JSON.parse(currency);
                                } else {
                                  currencyObj = currency || {};
                                }
                              } catch {
                                currencyObj = {};
                              }
                              const symbol = currencyObj?.symbol || "₹";
                              const price =
                                pkg.countries[0]?.price ??
                                pkg.countries[0]?.country?.price;
                              return `${symbol}${price ?? "N/A"}`;
                            })()}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6">
                        {!isPaid ? (
                          <Button
                            color="blue"
                            className="w-full"
                            onClick={() => handlePayment(pkg)}
                          >
                            Pay Now
                          </Button>
                        ) : (
                          <Button
                            color="blue"
                            className="w-full"
                            disabled={pkg.examStatus !== "upcoming"}
                          >
                            {pkg.examStatus === "upcoming"
                              ? "Material Available Soon"
                              : "Exam Not Available"}
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                !loading &&
                !error && (
                  <Alert color="info">
                    <span>No exam packages found for your account.</span>
                  </Alert>
                )
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
