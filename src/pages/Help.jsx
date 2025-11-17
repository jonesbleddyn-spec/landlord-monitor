import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building2, 
  UserPlus, 
  AlertCircle, 
  MessageSquare, 
  FileText, 
  CreditCard,
  Home,
  Mail,
  QrCode,
  Shield,
  Users,
  CheckCircle
} from "lucide-react";

export default function Help() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help & User Guide</h1>
          <p className="text-lg text-gray-600">
            Complete guide for landlords and tenants
          </p>
        </div>

        {/* Landlord Guide */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Landlord Guide</h2>
          </div>

          <div className="space-y-6">
            {/* Getting Started */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  Getting Started
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">1. Registration & Onboarding</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Sign up with your email address</li>
                    <li>Complete the onboarding process by selecting "Landlord" as your user type</li>
                    <li>Provide your company or personal name</li>
                    <li>Choose a subscription plan (Free trial available)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">2. Dashboard Overview</h4>
                  <p className="text-gray-700 ml-4">
                    Your dashboard displays key metrics including total properties, open faults, 
                    recent messages, and quick action buttons for common tasks.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Property Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  Property Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Adding Properties</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Click "Add Property" from the Properties page</li>
                    <li>Enter property details: name, address, type, and number of units</li>
                    <li>Upload a property image (optional)</li>
                    <li>Add compliance certificate expiry dates (Gas, Electrical, EPC)</li>
                    <li>Toggle "Show Compliance to Tenants" to control visibility</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Bulk Import</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Download the CSV template from the Properties page</li>
                    <li>Fill in your property details following the template format</li>
                    <li>Upload the CSV file using "Bulk Actions" → "Upload CSV"</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Property Codes & QR Codes</h4>
                  <p className="text-gray-700 ml-4">
                    Each property automatically gets a unique 5-character code. Tenants can use 
                    this code or scan the QR code to report faults directly without logging in.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tenant Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Tenant Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Inviting Tenants</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Click "Invite Tenant" from your dashboard</li>
                    <li>Enter tenant's email, name, and select their property</li>
                    <li>System sends an automatic invitation email with a unique code</li>
                    <li>Invitation expires after 7 days</li>
                    <li>Track invitation status in the dashboard</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Fault Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Fault Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Viewing Faults</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Access faults from property cards or the "View Faults" button</li>
                    <li>Filter by status, priority, and category</li>
                    <li>View images and detailed descriptions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Managing Faults</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Update fault status (Acknowledged → In Progress → Contractor Assigned → Completed)</li>
                    <li>Assign contractors with estimated completion dates</li>
                    <li>Add notes and updates (tenants receive email notifications)</li>
                    <li>Mark faults as complete when resolved</li>
                    <li>View AI-generated DIY solutions and prevention tips</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Communication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-cyan-600" />
                  Community & Communication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Posting Messages</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Navigate to the Community page</li>
                    <li>Select property and message type (Notice, Community, Announcement)</li>
                    <li>Mark important messages as "Important" for highlighting</li>
                    <li>Reply to tenant messages and questions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Document Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Uploading Documents</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Go to Documents page and click "Upload Document"</li>
                    <li>Select document type (Contract, Lease, Insurance, Certificate, etc.)</li>
                    <li>Upload file and add title and optional notes</li>
                    <li>Set expiry dates for time-sensitive documents</li>
                    <li>System alerts you when documents are expiring</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-600" />
                  Reports & Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Property Reports</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Click "Generate Report" on any property card</li>
                    <li>View detailed fault history and statistics</li>
                    <li>AI-generated recommendations for each fault</li>
                    <li>Download reports as CSV or print for records</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Subscription */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-yellow-600" />
                  Subscription Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Plans & Limits</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li><strong>Free/Trial:</strong> 2 properties, basic features</li>
                    <li><strong>Basic:</strong> 10 properties, priority support</li>
                    <li><strong>Pro:</strong> Unlimited properties, all features</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Managing Subscription</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Go to Subscription page to view current plan</li>
                    <li>Upgrade or downgrade at any time</li>
                    <li>View payment history and download invoices</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tenant Guide */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Tenant Guide</h2>
          </div>

          <div className="space-y-6">
            {/* Getting Started */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  Getting Started
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">1. Accepting Your Invitation</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Check your email for an invitation from your landlord</li>
                    <li>Click the invitation link</li>
                    <li>Enter the invitation code and your details</li>
                    <li>Create your account</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">2. Dashboard Overview</h4>
                  <p className="text-gray-700 ml-4">
                    Your dashboard shows your property information, recent faults, and quick 
                    access to report new issues.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Reporting Faults */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Reporting Faults
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Method 1: Logged In</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Click "Report Fault" from dashboard or properties page</li>
                    <li>Upload images of the issue (optional)</li>
                    <li>Use AI analysis to auto-fill details from images</li>
                    <li>Fill in title, description, category, and priority</li>
                    <li>Add location and unit number</li>
                    <li>Submit the report</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Method 2: Using Property Code</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Use the QR code displayed in your building</li>
                    <li>Or visit the report page and enter your 5-character property code</li>
                    <li>No login required</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">AI-Powered Features</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Upload images and get automatic fault detection</li>
                    <li>Receive DIY temporary fixes while waiting for repairs</li>
                    <li>Get prevention tips to avoid future issues</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Faults */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Tracking Your Faults
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Fault Status Updates</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li><strong>Reported:</strong> Just submitted</li>
                    <li><strong>Acknowledged:</strong> Landlord has seen it</li>
                    <li><strong>In Progress:</strong> Being worked on</li>
                    <li><strong>Contractor Assigned:</strong> Professional hired</li>
                    <li><strong>Completed:</strong> Fixed and closed</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Email Notifications</h4>
                  <p className="text-gray-700 ml-4">
                    You'll receive automatic email updates whenever your fault status changes 
                    or when your landlord adds notes.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Property Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  Viewing Property Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Property Details</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>View property address and manager contact</li>
                    <li>See property type and number of units</li>
                    <li>Check compliance certificate statuses (if enabled by landlord)</li>
                    <li>View property code for quick fault reporting</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Community */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-cyan-600" />
                  Community Board
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Using the Community Board</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>View announcements and notices from your landlord</li>
                    <li>Post community messages to other tenants</li>
                    <li>Reply to messages and participate in discussions</li>
                    <li>Important messages are highlighted at the top</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Accessing Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Document Library</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>View your lease agreement and other property documents</li>
                    <li>Download documents for your records</li>
                    <li>Check document expiry dates</li>
                    <li>Access safety certificates and inspection reports</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* General Tips */}
        <Card className="mt-12 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Shield className="w-5 h-5" />
              General Tips & Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-800">
            <p><strong>For Landlords:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Keep compliance certificates up to date to avoid expiry warnings</li>
              <li>Respond to faults promptly to maintain tenant satisfaction</li>
              <li>Use the community board for important announcements</li>
              <li>Regularly review property reports to identify trends</li>
            </ul>
            <p className="pt-3"><strong>For Tenants:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Always take photos when reporting faults for faster resolution</li>
              <li>Provide detailed descriptions to help diagnose issues</li>
              <li>Use AI suggestions for temporary fixes while waiting for repairs</li>
              <li>Check the community board regularly for important updates</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <div className="mt-12 text-center">
          <Card className="bg-gray-50">
            <CardContent className="py-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Need More Help?</h3>
              <p className="text-gray-600 mb-4">
                If you have questions not covered in this guide, please contact support
              </p>
              <p className="text-blue-600 font-semibold">support@landlordmonitor.com</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}