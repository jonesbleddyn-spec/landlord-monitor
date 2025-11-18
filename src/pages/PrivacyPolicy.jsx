import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Shield, Eye, Database } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last Updated: November 18, 2025</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p>
                Landlord Monitor ("we", "our", "us") respects your privacy and is committed to protecting your personal data. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
              <p>
                <strong>By using the Platform, you acknowledge and agree that you are solely responsible for how you use the information 
                provided through the Platform and any decisions you make based on that information.</strong>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                2. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-4">
              <div>
                <h4 className="font-semibold mb-2">2.1 Information You Provide</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Account Information:</strong> Name, email address, password, user type (landlord/tenant)</li>
                  <li><strong>Profile Information:</strong> Company name, logo, contact details, subscription preferences</li>
                  <li><strong>White Label Settings:</strong> Custom branding (logos, colors, company names), SMTP credentials, Twilio API credentials</li>
                  <li><strong>Property Information:</strong> Property details, addresses, unit numbers, images, compliance certificates, property codes</li>
                  <li><strong>Fault Reports:</strong> Maintenance issues, descriptions, photos, location details, AI analysis data</li>
                  <li><strong>Communications:</strong> Messages, comments, feedback, community board posts sent through the Platform</li>
                  <li><strong>Documents:</strong> Uploaded files, certificates, leases, inspection reports</li>
                  <li><strong>Reminders:</strong> Task details, due dates, reminder preferences</li>
                  <li><strong>Payment Information:</strong> Billing details, transaction history (processed by third-party payment providers)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">2.2 Automatically Collected Information</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Device information (browser type, operating system)</li>
                  <li>IP address and location data</li>
                  <li>Usage data (pages visited, features used, time spent)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2.3 Third-Party Data</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Information from integrated services (AI providers like OpenAI, email services, SMS services like Twilio, payment processors)</li>
                  <li>Data from authentication providers</li>
                  <li>Image analysis data from AI services</li>
                  <li>Email delivery status from SMTP providers</li>
                  <li>SMS delivery status from Twilio</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p>We use collected information for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>To provide, maintain, and improve the Platform</li>
                <li>To create and manage user accounts</li>
                <li>To facilitate communication between landlords and tenants</li>
                <li>To process fault reports and maintenance requests</li>
                <li>To send email and SMS notifications, reminders, and updates (using your custom SMTP or Twilio if configured)</li>
                <li>To process payments and manage subscriptions</li>
                <li>To generate AI-powered suggestions, fault analysis, DIY tips, and maintenance insights</li>
                <li>To apply white label branding and customize the tenant experience</li>
                <li>To manage document uploads and compliance tracking</li>
                <li>To schedule and send reminder notifications</li>
                <li>To analyze uploaded images for fault categorization and priority assessment</li>
                <li>To analyze usage patterns and improve user experience</li>
                <li>To comply with legal obligations</li>
                <li>To detect, prevent, and address technical issues or fraudulent activity</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-600" />
                4. Information Sharing and Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-4">
              <p>We may share your information in the following circumstances:</p>
              
              <div>
                <h4 className="font-semibold mb-2">4.1 Within the Platform</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Landlords can view information about their tenants and properties</li>
                  <li>Tenants can view information about their assigned properties</li>
                  <li>Administrators can access all platform data</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">4.2 Service Providers</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Cloud hosting providers (for data storage and processing)</li>
                  <li>Payment processors (Stripe for subscription and transaction handling)</li>
                  <li>Email service providers (your custom SMTP or our default provider for notifications)</li>
                  <li>SMS service providers (Twilio if configured by landlords)</li>
                  <li>AI service providers (OpenAI for generating insights, image analysis, fault categorization, and suggestions)</li>
                  <li>File storage providers (for uploaded images and documents)</li>
                  <li>Analytics providers (for usage analysis)</li>
                </ul>
                <p className="mt-3 text-sm">
                  <strong>Note:</strong> When landlords configure custom SMTP or Twilio, communications are sent through their accounts and subject to those providers' privacy policies.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">4.3 Legal Requirements</h4>
                <p>We may disclose your information if required by law, court order, or government request, or to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Comply with legal obligations</li>
                  <li>Protect our rights and property</li>
                  <li>Prevent fraud or illegal activity</li>
                  <li>Protect the safety of users or the public</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">4.4 Business Transfers</h4>
                <p>
                  In the event of a merger, acquisition, or sale of assets, your information may be transferred to the 
                  acquiring entity.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                5. Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p>
                We implement reasonable security measures to protect your information, including:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication mechanisms</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and user permissions</li>
              </ul>
              <p className="font-semibold mt-4">
                However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security of your data. 
                You acknowledge and accept the risks associated with transmitting information over the internet.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p>
                We retain your information for as long as necessary to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Provide the Platform services</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
                <li>Enforce our agreements</li>
              </ul>
              <p>
                When you delete your account, we will delete or anonymize your personal information within 90 days, 
                unless we are required to retain it for legal purposes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p>Depending on your jurisdiction, you may have the following rights:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your information</li>
                <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails</li>
                <li><strong>Withdraw Consent:</strong> Where processing is based on consent</li>
              </ul>
              <p className="mt-3">
                To exercise these rights, please contact us at support@landlordmonitor.com
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Cookies and Tracking Technologies</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p>
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Maintain user sessions and authentication</li>
                <li>Remember user preferences</li>
                <li>Analyze platform usage</li>
                <li>Improve functionality and user experience</li>
              </ul>
              <p>
                You can control cookies through your browser settings, but disabling cookies may limit platform functionality.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Third-Party Links and Services</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p>
                The Platform may contain links to third-party websites or integrate with third-party services. 
                We are not responsible for the privacy practices of these third parties. We encourage you to review 
                their privacy policies before providing any information.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p>
                The Platform is not intended for children under 18 years of age. We do not knowingly collect information 
                from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p>
                Your information may be transferred to and processed in countries other than your country of residence. 
                These countries may have different data protection laws. By using the Platform, you consent to such transfers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. User Responsibility and Liability</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p className="font-semibold">
                You are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>The accuracy and legality of information you provide</li>
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activity conducted through your account</li>
                <li>Ensuring your use of the Platform complies with applicable privacy laws</li>
                <li>Obtaining necessary consents when sharing others' information</li>
              </ul>
              <p className="mt-3 font-semibold">
                You acknowledge that we are not liable for any damages resulting from unauthorized access to your account, 
                your disclosure of information, or your misuse of the Platform.
              </p>
              <p className="mt-3">
                <strong>Landlord-Specific Responsibilities:</strong> If you are a landlord configuring white label settings, custom SMTP, or Twilio integration, you are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Securing your third-party service credentials (SMTP passwords, Twilio tokens)</li>
                <li>Ensuring you have the right to use logos and branding elements</li>
                <li>Complying with email and SMS communication laws in your jurisdiction</li>
                <li>Costs incurred through your Twilio or SMTP accounts</li>
                <li>Obtaining tenant consent for SMS and email communications</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>13. Changes to Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p>
                We may update this Privacy Policy from time to time. Changes will be effective immediately upon posting. 
                Your continued use of the Platform after changes constitutes acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>14. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p>
                If you have questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-3">
                <p><strong>Email:</strong> support@landlordmonitor.com</p>
                <p><strong>Phone:</strong> +44 20 1234 5678</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-6 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm text-gray-700">
            <strong>By using the Platform, you acknowledge that you have read and understood this Privacy Policy and agree to 
            our collection, use, and disclosure of your information as described herein. You also acknowledge your responsibility 
            for the security of your account and the accuracy of information you provide.</strong>
          </p>
        </div>
      </div>
    </div>
  );
}