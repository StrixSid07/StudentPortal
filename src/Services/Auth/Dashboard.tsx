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
      currency: any; // JSON scalar
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
    if (user) {
      fetchUserPackage();
    }
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
      const response = await executeRawQuery<{ data: UserPackageResponse }>(
        userPackageQuery,
        { userId: parseInt(user.id) },
      );

      if (response.data?.getUserPackageByClassAndCountry?.success) {
        setUserPackage(response.data.getUserPackageByClassAndCountry.data);
      } else {
        setError(
          response.data?.getUserPackageByClassAndCountry?.message ||
            "Failed to fetch user package",
        );
      }
    } catch (err) {
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
    try {
      const price = pkg.countries[0]?.price ?? pkg.countries[0]?.country?.price;
      const currencyData = pkg.countries[0]?.country?.currency;
      let currencyObj: { symbol?: string; name?: string; code?: string } = {};

      if (typeof currencyData === "string") {
        currencyObj = JSON.parse(currencyData);
      } else {
        currencyObj = currencyData || {};
      }

      const currency = currencyObj?.code || "INR";
      const receipt = `receipt_${Date.now()}`;

      const orderResp = await executeRawQuery(CREATE_ORDER, {
        userId: parseInt(user.id),
        amount: price,
        currency,
        receipt,
      });

      const order = orderResp.data?.CreateOrder;
      if (!order || order.success !== "true") {
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
          const verifyResp = await executeRawQuery(VERIFY_PAYMENT, {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });

          const verifyResult = verifyResp.data?.VerifyPayment;
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
    const date = new Date(parseInt(timestamp));
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex">
      {/* ✅ Sidebar always rendered */}
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

      {/* ✅ Main Content */}
      <main className="md:mt-0 mt-32">
        <div className="space-y-8">
          {/* Profile Card */}
          {/* {user && (
            <Card className="flex items-center gap-6 p-6 shadow-md">
              <Avatar
                img={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.fullname,
                )}&background=0D8ABC&color=fff`}
                alt="User avatar"
                size="xl"
                rounded
              />
              <div>
                <h3 className="text-2xl font-bold">{user.fullname}</h3>
                <p className="text-gray-600">{user.email}</p>
                <div className="mt-2 flex gap-6 text-sm text-gray-700">
                  <span>Class: {user.class}</span>
                  <span>Country: {user.country}</span>
                </div>
                <div className="mt-2">
                  {isPaid ? (
                    <Badge color="success">Paid ✅</Badge>
                  ) : (
                    <Badge color="failure">Unpaid ❌</Badge>
                  )}
                </div>
              </div>
            </Card>
          )} */}

          {/* Exam Packages */}
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
                          {/* <p>
                            <span className="font-medium">End Date:</span>{" "}
                            {formatDate(pkg.countries[0]?.endDateTime)}
                          </p> */}
                          <p>
                            <span className="font-medium">Country:</span>{" "}
                            {pkg.countries[0]?.country?.name}
                          </p>
                          <p>
                            <span className="font-medium">Price:</span>{" "}
                            {(() => {
                              const currency =
                                pkg.countries[0]?.country?.currency;
                              let currencyObj: { symbol?: string } = {};
                              try {
                                if (typeof currency === "string") {
                                  currencyObj = JSON.parse(currency);
                                } else {
                                  currencyObj = currency || {};
                                }
                              } catch (e) {
                                console.error("Currency parse error:", e);
                              }
                              const symbol = currencyObj?.symbol || "";
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
