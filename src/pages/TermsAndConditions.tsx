import React from "react";
import { Card } from "flowbite-react";
import { useAuth } from "../Services/Auth/AuthContext";
import Sidebar from "../components/Sidebar";

export interface User {
  id?: string;
  fullname?: string;
  email?: string;
  mobile?: string;
  class?: string;
  country?: string;
  examType?: string;
  isPaid?: boolean;
}

const TermsAndConditions: React.FC = () => {
  const { user, logout } = useAuth();

  // Create userData object from user context
  const userData = {
    id: user?.id || "",
    fullname: user?.fullname || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    class: user?.class || "",
    country: user?.country || "",
    isPaid: user?.isPaid || false,
    isOnlineExam: user?.isOnlineExam || false,
  };

  return (
    <>
      <Sidebar userData={userData} onLogout={logout} />
      <div className="md:ml-64 p-4 pt-20 md:pt-4">
        <div className="max-w-screen-xl mx-auto py-8">
          <Card className="mb-4">
            <h1 className="text-2xl font-bold text-blue-950 mb-6">Terms & Conditions</h1>
            <div className="terms-content">
              <h2 className="text-lg font-semibold text-blue-950 mb-4">
                By logging in or using the TwilightX Portal, you agree to the following Terms & Conditions:
              </h2>

              <h3 className="text-md font-semibold text-blue-950 mt-6 mb-2">1. Purpose</h3>
              <ul className="list-disc pl-6 mb-4">
                <li className="mb-2">The Portal is designed for <span className="font-semibold">personal educational use only.</span></li>
                <li className="mb-2">Students may register, access study material, attempt mock tests, and take exams through the Portal.</li>
              </ul>

              <h3 className="text-md font-semibold text-blue-950 mt-6 mb-2">2. Account Registration</h3>
              <ul className="list-disc pl-6 mb-4">
                <li className="mb-2">Users must provide <span className="font-semibold">accurate and complete personal details</span> during registration.</li>
                <li className="mb-2">Keep your login ID and password <span className="font-semibold">confidential and secure.</span></li>
                <li className="mb-2">For students under 18, <span className="font-semibold">parent/guardian consent</span> may be required.</li>
              </ul>

              <h3 className="text-md font-semibold text-blue-950 mt-6 mb-2">3. Study Material</h3>
              <ul className="list-disc pl-6 mb-4">
                <li className="mb-2">All materials provided in the Portal are for <span className="font-semibold">personal use only.</span></li>
                <li className="mb-2"><span className="font-semibold">Sharing, copying, reproducing, or distributing content</span> in any form is strictly prohibited.</li>
              </ul>

              <h3 className="text-md font-semibold text-blue-950 mt-6 mb-2">4. Examination Rules</h3>
              <ul className="list-disc pl-6 mb-4">
                <li className="mb-2">Exams must be attempted <span className="font-semibold">fairly and honestly</span> without external assistance.</li>
                <li className="mb-2"><span className="font-semibold">Cheating, impersonation, or misuse</span> of the Portal will lead to <span className="font-semibold">immediate disqualification.</span></li>
                <li className="mb-2"><span className="font-semibold">Cheating window detection:</span> If another browser/app (Google, ChatGPT, AI tools, etc.) is opened during the exam, the test will be <span className="font-semibold">auto-terminated and marked as failed.</span></li>
                <li className="mb-2">Only the registered student is permitted to attempt the exam.</li>
                <li className="mb-2">Any violation may result in <span className="font-semibold">permanent suspension from future Olympiads.</span></li>
              </ul>

              <h3 className="text-md font-semibold text-blue-950 mt-6 mb-2">5. Payments</h3>
              <ul className="list-disc pl-6 mb-4">
                <li className="mb-2"><span className="font-semibold">A one-time registration fee</span> is required to access the Portal.</li>
                <li className="mb-2">All payments must be made through the <span className="font-semibold">secure in-Portal gateway.</span></li>
                <li className="mb-2"><span className="font-semibold">Fees are strictly non-refundable,</span> including in cases of withdrawal, absence, technical issues on the user's side, or disqualification due to misconduct.</li>
              </ul>

              <h3 className="text-md font-semibold text-blue-950 mt-6 mb-2">6. Results & Certificates</h3>
              <ul className="list-disc pl-6 mb-4">
                <li className="mb-2">Results will be declared <span className="font-semibold">directly on the Portal.</span></li>
                <li className="mb-2">Certificates will be issued in <span className="font-semibold">digital format only</span> to students or schools.</li>
                <li className="mb-2">No physical certificates will be dispatched.</li>
              </ul>

              <h3 className="text-md font-semibold text-blue-950 mt-6 mb-2">7. Code of Conduct</h3>
              <ul className="list-disc pl-6 mb-4">
                <li className="mb-2">Respectful and responsible behaviour is expected at all times.</li>
                <li className="mb-2">Misuse of the Portal, including <span className="font-semibold">spamming, false data submission, hacking attempts, or abusive behaviour,</span> will result in suspension or permanent ban.</li>
              </ul>

              <h3 className="text-md font-semibold text-blue-950 mt-6 mb-2">8. Disclaimer & Limitation of Liability</h3>
              <ul className="list-disc pl-6 mb-4">
                <li className="mb-2">Twilight Finland strives to ensure that the Portal functions smoothly.</li>
                <li className="mb-2">We are not responsible for issues caused by <span className="font-semibold">internet failures, device malfunctions, technical errors, or circumstances beyond our control.</span></li>
                <li className="mb-2">Twilight Finland shall not be held liable for <span className="font-semibold">loss of data, exam results, missed opportunities, or indirect damages</span> arising from use of the Portal.</li>
              </ul>

              <h3 className="text-md font-semibold text-blue-950 mt-6 mb-2">9. Governing Law & Jurisdiction</h3>
              <ul className="list-disc pl-6 mb-4">
                <li className="mb-2">These Terms & Conditions shall be governed by and interpreted in accordance with the <span className="font-semibold">laws of Finland</span> (or the country of official registration).</li>
                <li className="mb-2">Any disputes shall be subject to the <span className="font-semibold">exclusive jurisdiction of the courts in Finland.</span></li>
              </ul>

              <h3 className="text-md font-semibold text-blue-950 mt-6 mb-2">10. Changes to Terms</h3>
              <ul className="list-disc pl-6 mb-4">
                <li className="mb-2">Twilight Finland reserves the right to <span className="font-semibold">update or modify</span> these Terms & Conditions at any time.</li>
                <li className="mb-2">Continued use of the Portal after such changes constitutes your acceptance of the revised Terms.</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default TermsAndConditions;