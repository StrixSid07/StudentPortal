import React from "react";
import { Card } from "flowbite-react";
import { useAuth } from "../Services/Auth/AuthContext";
import Sidebar from "../components/Sidebar";

const PrivacyPolicy: React.FC = () => {
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
            <h1 className="text-2xl font-bold text-blue-950 mb-6">Privacy Policy</h1>
            
            <div className="privacy-content">
              <p className="mb-4">
                Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our StudentPortal service.
              </p>
              
              <h3 className="text-md font-semibold text-blue-950 mt-6 mb-2">Information We Collect</h3>
              <ul className="list-disc pl-6 mb-4">
                <li className="mb-2">We collect only the necessary details <span className="font-semibold">(name, school, contact, exam performance).</span></li>
                <li className="mb-2">Data will not be shared with third parties except for <span className="font-semibold">exam processing, certification, or legal compliance.</span></li>
                <li className="mb-2">By using the Portal, you consent to the collection and processing of your data in accordance with <span className="font-semibold">applicable data protection laws</span> (including GDPR, where applicable).</li>
              </ul>
              
              <h3 className="text-md font-semibold text-blue-950 mt-6 mb-2">How We Use Your Information</h3>
              <ul className="list-disc pl-6 mb-4">
                <li className="mb-2">To provide and maintain our Service</li>
                <li className="mb-2">To notify you about changes to our Service</li>
                <li className="mb-2">To allow you to participate in interactive features of our Service when you choose to do so</li>
                <li className="mb-2">To provide customer support</li>
                <li className="mb-2">To gather analysis or valuable information so that we can improve our Service</li>
                <li className="mb-2">To monitor the usage of our Service</li>
                <li className="mb-2">To detect, prevent and address technical issues</li>
              </ul>
              
              <h3 className="text-md font-semibold text-blue-950 mt-6 mb-2">Data Security</h3>
              <p className="mb-4">
                The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
              </p>
              
              <h3 className="text-md font-semibold text-blue-950 mt-6 mb-2">Your Data Protection Rights</h3>
              <p className="mb-4">
                We aim to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data. If you wish to be informed what Personal Data we hold about you and if you want it to be removed from our systems, please contact us.
              </p>
              
              <h3 className="text-md font-semibold text-blue-950 mt-6 mb-2">Changes To This Privacy Policy</h3>
              <p className="mb-4">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
              
              <h3 className="text-md font-semibold text-blue-950 mt-6 mb-2">Contact Us</h3>
              <p className="mb-4">
                If you have any questions about this Privacy Policy, please contact us at <a href="mailto:info@twilightfinland.eu" className="text-blue-600">info@twilightfinland.eu</a>.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;