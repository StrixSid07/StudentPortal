import React from "react";
import { Card } from "flowbite-react";
import { useAuth } from "../Services/Auth/AuthContext";
import Sidebar from "../components/Sidebar";
import { Mail, Phone, MapPin } from "lucide-react";

const ContactUs: React.FC = () => {
  const { user, logout } = useAuth();

  // Create userData object from user context
  const userData = {
    id: user?.id || "",
    fullname: user?.fullname || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    class: user?.class || "",
    country: user?.country || "",
    examType: user?.examType || "",
    isPaid: user?.isPaid || false,
  };

  return (
    <>
      <Sidebar userData={userData} onLogout={logout} />
      <div className="md:ml-64 p-4 pt-20 md:pt-4">
        <div className="max-w-screen-xl mx-auto py-8">
          <Card className="mb-4">
            <h1 className="text-2xl font-bold text-blue-950 mb-6">Contact Us</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="contact-info space-y-6">
                <div className="flex items-start">
                  <Mail className="text-blue-950 mr-4 mt-1" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-950">Email</h3>
                    <a href="mailto:info@twilightfinland.eu" className="text-blue-600">info@twilightfinland.eu</a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="text-blue-950 mr-4 mt-1" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-950">Phone</h3>
                    <a href="tel:+358449815552" className="text-blue-600">+358 44981 5552</a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="text-blue-950 mr-4 mt-1" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-950">Address</h3>
                    <p className="text-gray-700">
                      Satomäentie 1<br />
                      Vantaa<br />
                      Finland
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="contact-hours">
                <h3 className="text-lg font-semibold text-blue-950 mb-4">Hours of Operation</h3>
                <div className="space-y-2">
                  <p className="flex justify-between">
                    <span className="font-medium">Monday - Friday:</span>
                    <span>9:00 AM - 6:00 PM</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium">Saturday:</span>
                    <span>10:00 AM - 4:00 PM</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium">Sunday:</span>
                    <span>Closed</span>
                  </p>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-blue-950 mb-4">Support Response Time</h3>
                  <p className="text-gray-700 mb-2">
                    We strive to respond to all inquiries within 24-48 hours during business days.
                  </p>
                  <p className="text-gray-700">
                    For urgent matters, please contact us by phone during business hours.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ContactUs;