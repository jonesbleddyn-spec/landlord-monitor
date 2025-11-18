import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600">Last Updated: November 18, 2025</p>
        </div>

        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Important Notice</h3>
                <p className="text-sm text-yellow-800">
                  By using this platform, you acknowledge and agree that all liability for the use of this service lies with you, the user. 
                  Please read these terms carefully before using the platform.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p>
                By accessing and using Landlord Monitor ("the Platform", "Service", "we", "our"), you accept and agree to be bound by the terms and provisions of this agreement. 
                If you do not agree to these Terms of Service, please do not use the Platform.
              </p>
              <p>
                These terms apply to all users of the Platform, including landlords, tenants, property managers, and administrators.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. User Liability and Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p className="font-semibold">
                YOU ACKNOWLEDGE AND AGREE THAT YOUR USE OF THIS PLATFORM IS ENTIRELY AT YOUR OWN RISK.
              </p>
              <p>
                The Platform is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, either express or implied. 
                We do not warrant that:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>The Platform will meet your specific requirements</li>
                <li>The Platform will be uninterrupted, timely, secure, or error-free</li>
                <li>The results obtained from use of the Platform will be accurate or reliable</li>
                <li>Any defects in the Platform will be corrected</li>
              </ul>
              <p className="font-semibold mt-4">
                You are solely responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All decisions made based on information provided through the Platform</li>
                <li>Compliance with all applicable laws and regulations in your jurisdiction</li>
                <li>The accuracy of information you provide to the Platform</li>
                <li>All interactions and agreements between landlords and tenants</li>
                <li>Any financial transactions conducted through or related to the Platform</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p className="font-semibold">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL LANDLORD MONITOR, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, revenue, data, or use</li>
                <li>Property damage or personal injury</li>
                <li>Loss resulting from unauthorized access to or alteration of your data</li>
                <li>Statements or conduct of any third party on the Platform</li>
                <li>Any other matter relating to the Platform</li>
              </ul>
              <p className="mt-4">
                This limitation applies whether based on warranty, contract, tort (including negligence), or any other legal theory, 
                even if we have been advised of the possibility of such damages.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. User Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p>As a user of the Platform, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept all responsibility for activity under your account</li>
                <li>Comply with all applicable local, state, national, and international laws</li>
                <li>Not use the Platform for any unlawful purpose</li>
                <li>Not interfere with or disrupt the Platform's functionality</li>
                <li>Verify all information independently before making decisions</li>
                <li>Seek professional legal advice regarding landlord-tenant matters</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Property and Fault Management</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p>
                The Platform provides tools for managing properties and reporting maintenance issues. However:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We are not responsible for the accuracy of property information entered by users</li>
                <li>We do not verify or validate fault reports or maintenance requests</li>
                <li>We do not guarantee response times for reported issues</li>
                <li>Users are responsible for ensuring compliance with all safety regulations</li>
                <li>Emergency situations should be handled through appropriate emergency services, not the Platform</li>
                <li>AI-generated suggestions are for informational purposes only and do not constitute professional advice</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Third-Party Services and Content</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p>
                The Platform may integrate with or link to third-party services, websites, or content. We are not responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>The availability, accuracy, or content of third-party services</li>
                <li>Any transactions between you and third-party providers</li>
                <li>Any damages resulting from your use of third-party services</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Indemnification</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p>
                You agree to indemnify, defend, and hold harmless Landlord Monitor and its officers, directors, employees, contractors, agents, 
                licensors, and suppliers from and against any claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable 
                attorneys' fees) arising from:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your use or misuse of the Platform</li>
                <li>Your violation of these Terms of Service</li>
                <li>Your violation of any rights of another party</li>
                <li>Your breach of any applicable laws or regulations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Account Termination</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p>
                We reserve the right to suspend or terminate your account at any time, with or without cause, and with or without notice. 
                Upon termination:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your right to use the Platform will immediately cease</li>
                <li>We may delete your data in accordance with our data retention policies</li>
                <li>You remain liable for all obligations incurred prior to termination</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. No Professional Advice</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p className="font-semibold">
                The Platform does not provide legal, financial, or professional advice.
              </p>
              <p>
                Any information, suggestions, or recommendations provided through the Platform (including AI-generated content) 
                are for general informational purposes only and should not be relied upon as professional advice. 
                You should consult with qualified professionals regarding legal, financial, or other professional matters.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p>
                While we implement reasonable security measures, we cannot guarantee the absolute security of your data. 
                You acknowledge that:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Internet transmissions are never completely secure</li>
                <li>You use the Platform at your own risk</li>
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>We are not liable for unauthorized access to your account or data</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p>
                We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting 
                to the Platform. Your continued use of the Platform after changes are posted constitutes your acceptance of the modified terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p>
                These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which 
                the Platform operator is registered, without regard to its conflict of law provisions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>13. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p>
                If you have any questions about these Terms of Service, please contact us at support@landlordmonitor.com
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-6 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>By using the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service, 
            including the liability disclaimers and limitations stated herein.</strong>
          </p>
        </div>
      </div>
    </div>
  );
}