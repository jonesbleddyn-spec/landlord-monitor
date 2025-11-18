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
  CheckCircle,
  BookOpen,
  ChevronRight,
  Palette,
  Bell
} from "lucide-react";
import ProtectedRoute from "../components/auth/ProtectedRoute";

function HelpContent() {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help & User Guide</h1>
          <p className="text-lg text-gray-600">
            Complete guide for landlords and tenants
          </p>
        </div>

        {/* Table of Contents */}
        <Card className="mb-12 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 sticky top-20 z-10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <BookOpen className="w-5 h-5" />
              Table of Contents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  For Landlords
                </h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => scrollToSection('landlord-getting-started')}
                      className="text-blue-700 hover:text-blue-900 hover:underline text-left flex items-center gap-2"
                    >
                      <ChevronRight className="w-3 h-3" />
                      Getting Started
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('landlord-properties')}
                      className="text-blue-700 hover:text-blue-900 hover:underline text-left flex items-center gap-2"
                    >
                      <ChevronRight className="w-3 h-3" />
                      Property Management
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('landlord-tenants')}
                      className="text-blue-700 hover:text-blue-900 hover:underline text-left flex items-center gap-2"
                    >
                      <ChevronRight className="w-3 h-3" />
                      Tenant Management
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('landlord-faults')}
                      className="text-blue-700 hover:text-blue-900 hover:underline text-left flex items-center gap-2"
                    >
                      <ChevronRight className="w-3 h-3" />
                      Fault Management
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('landlord-communication')}
                      className="text-blue-700 hover:text-blue-900 hover:underline text-left flex items-center gap-2"
                    >
                      <ChevronRight className="w-3 h-3" />
                      Communication
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('landlord-documents')}
                      className="text-blue-700 hover:text-blue-900 hover:underline text-left flex items-center gap-2"
                    >
                      <ChevronRight className="w-3 h-3" />
                      Documents
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('landlord-reports')}
                      className="text-blue-700 hover:text-blue-900 hover:underline text-left flex items-center gap-2"
                    >
                      <ChevronRight className="w-3 h-3" />
                      Reports & Analytics
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('landlord-subscription')}
                      className="text-blue-700 hover:text-blue-900 hover:underline text-left flex items-center gap-2"
                    >
                      <ChevronRight className="w-3 h-3" />
                      Subscription
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('landlord-white-label')}
                      className="text-blue-700 hover:text-blue-900 hover:underline text-left flex items-center gap-2"
                    >
                      <ChevronRight className="w-3 h-3" />
                      White Label & Branding
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('landlord-reminders')}
                      className="text-blue-700 hover:text-blue-900 hover:underline text-left flex items-center gap-2"
                    >
                      <ChevronRight className="w-3 h-3" />
                      Reminders
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  For Tenants
                </h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => scrollToSection('tenant-getting-started')}
                      className="text-green-700 hover:text-green-900 hover:underline text-left flex items-center gap-2"
                    >
                      <ChevronRight className="w-3 h-3" />
                      Getting Started
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('tenant-reporting-faults')}
                      className="text-green-700 hover:text-green-900 hover:underline text-left flex items-center gap-2"
                    >
                      <ChevronRight className="w-3 h-3" />
                      Reporting Faults
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('tenant-tracking-faults')}
                      className="text-green-700 hover:text-green-900 hover:underline text-left flex items-center gap-2"
                    >
                      <ChevronRight className="w-3 h-3" />
                      Tracking Faults
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('tenant-property-info')}
                      className="text-green-700 hover:text-green-900 hover:underline text-left flex items-center gap-2"
                    >
                      <ChevronRight className="w-3 h-3" />
                      Property Information
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('tenant-community')}
                      className="text-green-700 hover:text-green-900 hover:underline text-left flex items-center gap-2"
                    >
                      <ChevronRight className="w-3 h-3" />
                      Community Board
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('tenant-documents')}
                      className="text-green-700 hover:text-green-900 hover:underline text-left flex items-center gap-2"
                    >
                      <ChevronRight className="w-3 h-3" />
                      Documents
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

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
            <Card id="landlord-getting-started" className="scroll-mt-24">
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
                    <li>Sign up with your email address - you'll receive a verification email</li>
                    <li>Complete the onboarding process by selecting "Landlord" as your user type</li>
                    <li>Provide your company or personal name (this will appear in communications with tenants)</li>
                    <li>Choose a subscription plan - start with the free trial to explore all features</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">2. Dashboard Overview</h4>
                  <p className="text-gray-700 ml-4 mb-3">
                    Your dashboard is your command center, providing:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li><strong>Property Statistics:</strong> Total properties, open faults, and urgent issues at a glance</li>
                    <li><strong>Recent Activity:</strong> Latest fault reports and tenant messages</li>
                    <li><strong>Quick Actions:</strong> One-click access to invite tenants, add properties, and view reports</li>
                    <li><strong>Alerts:</strong> Compliance certificate expiry warnings and urgent fault notifications</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900"><strong>💡 Pro Tip:</strong> Bookmark your dashboard for quick daily access. Check it each morning to stay on top of new fault reports and important updates.</p>
                </div>
              </CardContent>
            </Card>

            {/* Property Management */}
            <Card id="landlord-properties" className="scroll-mt-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  Property Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Adding Properties - Individual</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Navigate to "Properties" from the main menu and click "Add Property"</li>
                    <li>Enter essential details: property name (e.g., "Oak Street Apartments"), full address</li>
                    <li>Select property type (apartment, house, commercial, mixed-use)</li>
                    <li>Specify number of units if applicable</li>
                    <li>Add property manager email for direct communications</li>
                    <li>Upload a property image - helps tenants and contractors identify the building</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Compliance Certificates</h4>
                  <p className="text-gray-700 ml-4 mb-2">
                    Stay compliant with legal requirements by tracking certificate expiry dates:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li><strong>Gas Safety Certificate:</strong> Required annually for properties with gas appliances</li>
                    <li><strong>Electrical Installation Certificate:</strong> Required every 5 years</li>
                    <li><strong>EPC (Energy Performance Certificate):</strong> Valid for 10 years</li>
                    <li>System sends automatic email reminders 30 days before expiry</li>
                    <li>Toggle "Show Compliance to Tenants" to control visibility - keeping tenants informed builds trust</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Bulk Import Properties</h4>
                  <p className="text-gray-700 ml-4 mb-2">
                    Managing multiple properties? Save time with bulk import:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Click "Bulk Actions" on the Properties page and select "Download CSV Template"</li>
                    <li>Open the template in Excel or Google Sheets</li>
                    <li>Fill in columns: name, address, type, units, manager_email, image_url</li>
                    <li>Save as CSV and upload via "Bulk Actions" → "Upload CSV"</li>
                    <li>System validates data and confirms successful imports</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Property Codes & QR Codes</h4>
                  <p className="text-gray-700 ml-4 mb-2">
                    Each property automatically receives a unique 5-character code for easy fault reporting:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Codes are auto-generated and displayed on each property card</li>
                    <li>Download QR code from property details</li>
                    <li>Print and display QR codes in common areas (lobbies, notice boards)</li>
                    <li>Tenants can scan QR codes to report faults instantly - no login required</li>
                    <li>Perfect for quick reporting during emergencies</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Editing & Managing Properties</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Click "Edit" on any property card to update details</li>
                    <li>View comprehensive property reports showing fault history and trends</li>
                    <li>Export property data to CSV for your records</li>
                    <li>Delete properties when no longer needed (warning: this removes all associated data)</li>
                  </ul>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-900"><strong>⚠️ Important:</strong> Keep compliance certificate dates updated to maintain legal compliance and avoid penalties. Set calendar reminders for renewal dates.</p>
                </div>
              </CardContent>
            </Card>

            {/* Tenant Management */}
            <Card id="landlord-tenants" className="scroll-mt-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Tenant Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Inviting Tenants to the Platform</h4>
                  <p className="text-gray-700 ml-4 mb-2">
                    Give your tenants access to report faults and communicate directly:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Click "Invite Tenant" button from your dashboard</li>
                    <li>Enter tenant's email address (must be unique)</li>
                    <li>Provide tenant's full name</li>
                    <li>Select which property they're renting</li>
                    <li>System automatically sends invitation email with unique redemption code</li>
                    <li>Invitations expire after 7 days for security</li>
                    <li>Track invitation status on your dashboard (Pending/Accepted/Expired)</li>
                    <li>Resend invitations if they expire</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">What Tenants Can Do</h4>
                  <p className="text-gray-700 ml-4 mb-2">
                    Once registered, tenants gain access to:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Report faults with photos and AI-assisted descriptions</li>
                    <li>Track fault repair progress in real-time</li>
                    <li>View their property information and compliance certificates (if enabled)</li>
                    <li>Access important documents like lease agreements</li>
                    <li>Communicate via the community board</li>
                    <li>Receive automatic email notifications on fault updates</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-green-900"><strong>💡 Best Practice:</strong> Invite tenants as soon as they move in. This streamlines communication and ensures all fault reports are properly tracked and documented.</p>
                </div>
              </CardContent>
            </Card>

            {/* Fault Management */}
            <Card id="landlord-faults" className="scroll-mt-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Fault Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Understanding Fault Reports</h4>
                  <p className="text-gray-700 ml-4 mb-2">
                    Faults are categorized by type and priority:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li><strong>Categories:</strong> Plumbing, Electrical, Heating, Structural, Appliances, Security, Pest Control, Cleaning, Other</li>
                    <li><strong>Priority Levels:</strong>
                      <ul className="list-circle list-inside ml-6 mt-1">
                        <li>Low - Minor issues, no immediate impact</li>
                        <li>Medium - Needs attention soon</li>
                        <li>High - Affecting daily living, resolve quickly</li>
                        <li>Urgent - Safety hazard or emergency, immediate action required</li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Viewing & Filtering Faults</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Access all faults from property cards or click "View Faults" button</li>
                    <li>Filter by status (Reported, In Progress, Completed, etc.)</li>
                    <li>Filter by priority to focus on urgent issues first</li>
                    <li>Filter by category to group similar maintenance tasks</li>
                    <li>View attached images - zoom in to assess damage severity</li>
                    <li>Read detailed descriptions and location information</li>
                    <li>Check reporting date and unit number</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Fault Status Workflow</h4>
                  <p className="text-gray-700 ml-4 mb-2">
                    Manage faults through their lifecycle:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li><strong>Reported:</strong> Initial state - acknowledge promptly to show tenants you're on it</li>
                    <li><strong>Acknowledged:</strong> You've seen it - update to this when you review the fault</li>
                    <li><strong>In Progress:</strong> Work has started - use this when you or your team begin repairs</li>
                    <li><strong>Contractor Assigned:</strong> Professional hired - add contractor name and estimated completion date</li>
                    <li><strong>Completed:</strong> Issue resolved - mark complete when work is finished</li>
                    <li><strong>Closed:</strong> Final state after tenant confirmation</li>
                  </ul>
                  <p className="text-gray-700 ml-4 mt-2">
                    <strong>Note:</strong> Tenants receive automatic email notifications each time you update the status or add notes.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Assigning Contractors</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Click "Edit" on any fault to assign a contractor</li>
                    <li>Enter contractor name (e.g., "ABC Plumbing Ltd")</li>
                    <li>Set estimated completion date for tenant expectations</li>
                    <li>Add contact details in notes if tenant needs to provide access</li>
                    <li>Update status to "Contractor Assigned"</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Communication & Notes</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Add notes at any stage to document progress</li>
                    <li>Notes are visible to tenants - keep them informed</li>
                    <li>Use notes to request additional information or photos</li>
                    <li>Document work completed for future reference</li>
                    <li>Notes create an audit trail for legal and insurance purposes</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">AI-Generated Solutions</h4>
                  <p className="text-gray-700 ml-4 mb-2">
                    The system provides AI-powered insights for each fault:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li><strong>DIY Solutions:</strong> Temporary fixes tenants can safely attempt while waiting for repairs</li>
                    <li><strong>Prevention Tips:</strong> Advice to prevent similar issues in future</li>
                    <li>Click "Generate Tips" on any fault to view AI suggestions</li>
                    <li>Share these with tenants to empower self-help</li>
                  </ul>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-900"><strong>⏱️ Response Time Matters:</strong> Aim to acknowledge faults within 24 hours. Quick responses improve tenant satisfaction and help maintain positive relationships.</p>
                </div>
              </CardContent>
            </Card>

            {/* Communication */}
            <Card id="landlord-communication" className="scroll-mt-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-cyan-600" />
                  Community & Communication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Message Types</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li><strong>Notice:</strong> Official announcements for a specific property (read-only for tenants)</li>
                    <li><strong>Community Message:</strong> Open discussions where tenants can reply</li>
                    <li><strong>Announcement:</strong> Posts to ALL your properties simultaneously - perfect for company-wide updates</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Posting Messages</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Navigate to the Community page from main menu</li>
                    <li>Select property (skip for announcements to all properties)</li>
                    <li>Choose message type based on purpose</li>
                    <li>Add title (optional but recommended for clarity)</li>
                    <li>Write your message - supports line breaks and formatting</li>
                    <li>Mark as "Important" to highlight critical messages at the top</li>
                    <li>Click "Post Message" to publish</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Managing Conversations</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Reply to tenant messages directly from the community board</li>
                    <li>Delete inappropriate or outdated messages</li>
                    <li>Monitor community discussions between tenants</li>
                    <li>Use for rent reminders, maintenance schedules, and building updates</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Effective Communication Examples</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li><strong>Maintenance Notice:</strong> "Scheduled elevator maintenance on Jan 15, 9am-5pm"</li>
                    <li><strong>Building Update:</strong> "New security cameras installed in parking area"</li>
                    <li><strong>Seasonal Reminders:</strong> "Winter heating system maintenance completed"</li>
                    <li><strong>Community Events:</strong> "Annual building cleanup day - March 20th"</li>
                  </ul>
                </div>
                <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                  <p className="text-sm text-cyan-900"><strong>📢 Communication Tip:</strong> Post regular updates even when there's no major news. It shows tenants you're actively managing the property and keeps them engaged.</p>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card id="landlord-documents" className="scroll-mt-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Document Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Document Types</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li><strong>Contract:</strong> Service agreements with contractors and suppliers</li>
                    <li><strong>Lease:</strong> Tenant lease agreements and addendums</li>
                    <li><strong>Insurance:</strong> Property insurance policies and certificates</li>
                    <li><strong>Inspection:</strong> Property inspection reports</li>
                    <li><strong>Maintenance:</strong> Service records and repair logs</li>
                    <li><strong>Certificate:</strong> Gas, electrical, EPC and other compliance certificates</li>
                    <li><strong>Other:</strong> Any additional property-related documents</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Uploading Documents</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Navigate to Documents page and find the upload form</li>
                    <li>Select the property this document relates to</li>
                    <li>Enter a clear, descriptive title (e.g., "2024 Gas Safety Certificate")</li>
                    <li>Choose document type from dropdown</li>
                    <li>Add unit number if document is unit-specific (optional)</li>
                    <li>Set expiry date for time-sensitive documents (optional but recommended)</li>
                    <li>Add notes for additional context (optional)</li>
                    <li>Click "Choose File" to upload (supports PDF, images, Word docs)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Managing Documents</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>View all documents organized by property</li>
                    <li>Filter by document type for quick access</li>
                    <li>System highlights documents expiring soon (amber badge) or expired (red badge)</li>
                    <li>Receive automatic email reminders 30 days before expiry</li>
                    <li>Download documents anytime for your records</li>
                    <li>Delete outdated or replaced documents</li>
                    <li>Tenants can view documents you've uploaded for their property</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Document Organization Best Practices</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Upload documents as soon as you receive them</li>
                    <li>Use consistent naming: "Property Name - Document Type - Year"</li>
                    <li>Always set expiry dates for certificates and insurance</li>
                    <li>Keep original paper copies as backup</li>
                    <li>Update documents when renewed (upload new version, delete old)</li>
                    <li>Add detailed notes for future reference</li>
                  </ul>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <p className="text-sm text-indigo-900"><strong>🔒 Security:</strong> All documents are stored securely and encrypted. Only you and tenants assigned to that property can access them. Admins cannot view your documents.</p>
                </div>
              </CardContent>
            </Card>

            {/* Reports */}
            <Card id="landlord-reports" className="scroll-mt-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-600" />
                  Reports & Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Individual Property Reports</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Click "Generate Report" button on any property card</li>
                    <li>View comprehensive fault history and statistics</li>
                    <li>See breakdown by category, priority, and status</li>
                    <li>Review AI-generated maintenance recommendations</li>
                    <li>Identify recurring issues and problem areas</li>
                    <li>Download report as CSV for spreadsheet analysis</li>
                    <li>Print report for meetings or insurance claims</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">All Properties Report</h4>
                  <p className="text-gray-700 ml-4 mb-2">
                    Access portfolio-wide insights from your dashboard:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>See faults across all properties in one view</li>
                    <li>Compare fault rates between different properties</li>
                    <li>Identify properties requiring more attention</li>
                    <li>Get AI-powered maintenance tips for your entire portfolio</li>
                    <li>Export comprehensive data for business analysis</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Using Reports Effectively</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li><strong>Monthly Reviews:</strong> Generate reports monthly to track performance</li>
                    <li><strong>Budgeting:</strong> Use historical data to predict maintenance costs</li>
                    <li><strong>Contractor Evaluation:</strong> Track completion times and recurring issues</li>
                    <li><strong>Insurance Claims:</strong> Provide detailed fault history when needed</li>
                    <li><strong>Property Valuation:</strong> Demonstrate good maintenance for better valuations</li>
                    <li><strong>Tenant Relations:</strong> Show response times to prove active management</li>
                  </ul>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-sm text-red-900"><strong>📊 Data Insights:</strong> Regular report reviews help you spot patterns early. For example, recurring plumbing issues might indicate a larger problem needing professional assessment.</p>
                </div>
              </CardContent>
            </Card>

            {/* Subscription */}
            <Card id="landlord-subscription" className="scroll-mt-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-yellow-600" />
                  Subscription Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Subscription Plans Explained</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li><strong>Free/Trial:</strong>
                      <ul className="list-circle list-inside ml-6 mt-1 text-sm">
                        <li>Up to 2 properties</li>
                        <li>All core features included</li>
                        <li>Perfect for small-scale landlords</li>
                        <li>Email support</li>
                      </ul>
                    </li>
                    <li><strong>Basic - £29/month:</strong>
                      <ul className="list-circle list-inside ml-6 mt-1 text-sm">
                        <li>Up to 10 properties</li>
                        <li>All features unlocked</li>
                        <li>Priority email support</li>
                        <li>Advanced reporting tools</li>
                        <li>Discounted annual billing (coming soon)</li>
                      </ul>
                    </li>
                    <li><strong>Pro - £79/month:</strong>
                      <ul className="list-circle list-inside ml-6 mt-1 text-sm">
                        <li>Unlimited properties</li>
                        <li>All features + future updates</li>
                        <li>Priority support with faster response</li>
                        <li>Dedicated account manager (optional)</li>
                        <li>Custom branding options</li>
                        <li>Discounted annual billing (coming soon)</li>
                      </ul>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Managing Your Subscription</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Navigate to Subscription page from main menu</li>
                    <li>View your current plan and usage statistics</li>
                    <li>Upgrade anytime with immediate effect</li>
                    <li>Downgrade at end of billing period to avoid service interruption</li>
                    <li>Update payment method in billing section</li>
                    <li>View payment history and download invoices for accounting</li>
                    <li>Cancel subscription if needed (keeps data for 30 days)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Billing & Invoices</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Automatic monthly billing on your registration date</li>
                    <li>Receive email receipts automatically</li>
                    <li>Download PDF invoices for your records</li>
                    <li>Update billing details anytime without service interruption</li>
                    <li>Failed payments trigger email notification with 3-day grace period</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Property Limits</h4>
                  <p className="text-gray-700 ml-4 mb-2">
                    When you reach your plan's property limit:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>System shows upgrade prompt when adding properties</li>
                    <li>Existing properties remain fully functional</li>
                    <li>Upgrade instantly to add more properties</li>
                    <li>No data loss or service interruption during upgrades</li>
                  </ul>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-900"><strong>💰 Money Saving Tip:</strong> Annual billing (coming soon) will offer 2 months free compared to monthly payments. Perfect for long-term landlords looking to save.</p>
                </div>
              </CardContent>
            </Card>

            {/* White Label Settings */}
            <Card id="landlord-white-label" className="scroll-mt-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-pink-600" />
                  White Label & Branding
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Customizing Your Brand</h4>
                  <p className="text-gray-700 ml-4 mb-2">
                    Make the platform your own with white-label branding:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Navigate to "White Label Settings" from your dashboard</li>
                    <li><strong>Company Name:</strong> Set your company or business name displayed to tenants</li>
                    <li><strong>Company Logo:</strong> Upload your logo (PNG/JPG, 200x60px recommended)</li>
                    <li><strong>Brand Colors:</strong> Choose primary and secondary colors for buttons, headers, and accents</li>
                    <li>Preview your branding before saving</li>
                    <li>Changes apply immediately to all tenant-facing pages</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Custom Email Provider (SMTP)</h4>
                  <p className="text-gray-700 ml-4 mb-2">
                    Send emails from your own domain:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Enable "Use custom email provider" in White Label Settings</li>
                    <li>Enter your SMTP server details (host, port, username, password)</li>
                    <li>Set "From Email" and "From Name" for outgoing emails</li>
                    <li>Supports Gmail, Outlook, SendGrid, and other SMTP providers</li>
                    <li>All tenant notifications will appear to come from your domain</li>
                    <li>Builds trust and maintains professional communication</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">SMS Notifications (Twilio)</h4>
                  <p className="text-gray-700 ml-4 mb-2">
                    Send SMS notifications to tenants using your Twilio account:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Enable "SMS notifications via Twilio" in White Label Settings</li>
                    <li>Enter your Twilio Account SID, Auth Token, and Phone Number</li>
                    <li>Get credentials from <a href="https://www.twilio.com/console" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Twilio Console</a></li>
                    <li>SMS notifications sent for urgent fault updates</li>
                    <li>Your Twilio number appears as sender</li>
                    <li>Pay-as-you-go pricing through your Twilio account</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Where White Label Applies</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Tenant dashboard and all pages they see</li>
                    <li>Fault reporting forms</li>
                    <li>Email notifications (if custom SMTP enabled)</li>
                    <li>SMS notifications (if Twilio enabled)</li>
                    <li>Document headers and footers</li>
                    <li>Public property codes and QR code pages</li>
                  </ul>
                </div>
                <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                  <p className="text-sm text-pink-900"><strong>🎨 Branding Impact:</strong> Professional branding increases tenant trust and makes your business stand out. Tenants see YOUR brand, not a generic platform.</p>
                </div>
              </CardContent>
            </Card>

            {/* Reminders */}
            <Card id="landlord-reminders" className="scroll-mt-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-600" />
                  Reminders & Task Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Creating Reminders</h4>
                  <p className="text-gray-700 ml-4 mb-2">
                    Never miss important dates with the reminder system:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Navigate to "Reminders" from the main menu</li>
                    <li>Click "Create Reminder" button</li>
                    <li>Enter title and detailed description</li>
                    <li>Set the reminder date</li>
                    <li>Choose category: Maintenance, Inspection, Certificate, Insurance, Payment, Other</li>
                    <li>Optionally link to a specific property</li>
                    <li>Configure email reminder schedule (e.g., 7 days and 1 day before)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Email Reminders</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Set first reminder (default: 7 days before due date)</li>
                    <li>Set second reminder (default: 1 day before due date)</li>
                    <li>Receive automatic emails at scheduled times</li>
                    <li>Mark reminders as complete to stop further emails</li>
                    <li>System tracks which reminders have been sent</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Managing Reminders</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>View active, overdue, and completed reminders</li>
                    <li>Filter by status and category</li>
                    <li>Mark as complete when task is done</li>
                    <li>Delete reminders no longer needed</li>
                    <li>Edit reminder details anytime</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Common Use Cases</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Certificate renewal dates (gas, electrical, EPC)</li>
                    <li>Insurance policy renewals</li>
                    <li>Scheduled property inspections</li>
                    <li>Annual maintenance tasks (boiler service, gutter cleaning)</li>
                    <li>Lease renewal dates</li>
                    <li>Payment due dates from contractors</li>
                  </ul>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-900"><strong>⏰ Stay Organized:</strong> Set reminders for ALL compliance dates as soon as you add properties. This prevents last-minute rushes and potential legal issues.</p>
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
            <Card id="tenant-getting-started" className="scroll-mt-24">
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
                    <li>Check your email inbox for invitation from your landlord</li>
                    <li>Email subject will be "Invitation to Landlord Monitor"</li>
                    <li>Click the invitation link in the email</li>
                    <li>Enter the unique invitation code (provided in email)</li>
                    <li>Fill in your personal details to create your account</li>
                    <li>Set a secure password</li>
                    <li>Complete registration</li>
                  </ul>
                  <p className="text-sm text-gray-600 ml-4 mt-2">
                    <strong>Note:</strong> Invitations expire after 7 days. Contact your landlord for a new invitation if yours has expired.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">2. Dashboard Overview</h4>
                  <p className="text-gray-700 ml-4 mb-2">
                    Your tenant dashboard provides:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li><strong>Property Information:</strong> Your building name, address, and manager contact</li>
                    <li><strong>Quick Actions:</strong> One-click fault reporting button</li>
                    <li><strong>Recent Faults:</strong> Status of your reported issues</li>
                    <li><strong>Compliance Status:</strong> Certificate expiry dates (if enabled by landlord)</li>
                    <li><strong>Announcements:</strong> Latest messages from your landlord</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900"><strong>🔐 Account Security:</strong> Use a strong, unique password. Enable two-factor authentication if available. Never share your login details.</p>
                </div>
              </CardContent>
            </Card>

            {/* Reporting Faults */}
            <Card id="tenant-reporting-faults" className="scroll-mt-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Reporting Faults
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Method 1: Logged In (Recommended)</h4>
                  <p className="text-gray-700 ml-4 mb-2">
                    Follow these steps for the most comprehensive reporting:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Log into your account</li>
                    <li>Click "Report Fault" button from dashboard or properties page</li>
                    <li><strong>Take Photos:</strong> Upload clear images showing the problem (multiple angles recommended)</li>
                    <li><strong>Use AI Analysis:</strong> Click "Analyze with AI" after uploading - system auto-fills details</li>
                    <li><strong>Provide Details:</strong>
                      <ul className="list-circle list-inside ml-6 mt-1">
                        <li>Title: Brief description (e.g., "Leaking kitchen faucet")</li>
                        <li>Description: Full details of the problem</li>
                        <li>Category: Select from dropdown (Plumbing, Electrical, etc.)</li>
                        <li>Priority: Assess urgency (system suggests based on AI analysis)</li>
                        <li>Location: Specific area (e.g., "Master bathroom")</li>
                        <li>Unit Number: Your apartment/unit number</li>
                      </ul>
                    </li>
                    <li>Submit the report</li>
                    <li>Receive AI-generated DIY tips for temporary fixes</li>
                    <li>Get email confirmation immediately</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Method 2: Using Property Code (Quick Report)</h4>
                  <p className="text-gray-700 ml-4 mb-2">
                    Perfect for urgent situations when you can't log in:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Scan the QR code displayed in your building (usually in lobby or notice board)</li>
                    <li>OR visit the public reporting page and enter your 5-character property code</li>
                    <li>No login required - perfect for emergencies</li>
                    <li>Fill in fault details as above</li>
                    <li>Provide your email for updates</li>
                    <li>System forwards report directly to landlord</li>
                  </ul>
                  <p className="text-sm text-gray-600 ml-4 mt-2">
                    <strong>When to use:</strong> Emergency situations, out-of-hours reporting, or if you haven't registered yet.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">AI-Powered Smart Features</h4>
                  <p className="text-gray-700 ml-4 mb-2">
                    Make fault reporting faster and smarter:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li><strong>Image Analysis:</strong> AI examines photos and suggests fault category, priority, and description</li>
                    <li><strong>DIY Solutions:</strong> Receive immediate temporary fix suggestions you can safely try</li>
                    <li><strong>Prevention Tips:</strong> Learn how to prevent similar issues in future</li>
                    <li><strong>Smart Descriptions:</strong> AI helps write clear descriptions from your photos</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">What Makes a Good Fault Report</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li><strong>Clear Photos:</strong> Well-lit, focused images from multiple angles</li>
                    <li><strong>Detailed Description:</strong> Explain what happened, when it started, and how it affects you</li>
                    <li><strong>Specific Location:</strong> Exact room and area for faster contractor dispatch</li>
                    <li><strong>Accurate Priority:</strong> Be honest - only mark as urgent if it truly is</li>
                    <li><strong>Contact Availability:</strong> Mention when you're available for contractor access</li>
                  </ul>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-sm text-red-900"><strong>🚨 Emergency Protocol:</strong> For life-threatening emergencies (gas leaks, electrical fires, flooding), call emergency services first (999), THEN report via the app. Your safety comes first!</p>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Faults */}
            <Card id="tenant-tracking-faults" className="scroll-mt-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Tracking Your Faults
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Understanding Fault Statuses</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li><strong>Reported:</strong> Just submitted - landlord will review soon</li>
                    <li><strong>Acknowledged:</strong> Landlord has seen your report and is taking action</li>
                    <li><strong>In Progress:</strong> Work has started - repairs underway</li>
                    <li><strong>Contractor Assigned:</strong> Professional hired - check estimated completion date</li>
                    <li><strong>Completed:</strong> Landlord has marked as fixed - verify and confirm</li>
                    <li><strong>Closed:</strong> Issue resolved and verified</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Email Notifications</h4>
                  <p className="text-gray-700 ml-4 mb-2">
                    Stay informed with automatic updates:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Receive email immediately when fault is acknowledged</li>
                    <li>Get updates when status changes</li>
                    <li>Notification when contractor is assigned with estimated completion</li>
                    <li>Alert when landlord adds notes or requests information</li>
                    <li>Confirmation when fault is marked complete</li>
                    <li>Check your spam folder if you don't receive expected emails</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Viewing Fault History</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Navigate to Properties page to see your building</li>
                    <li>Click "View Faults" to see all your reports</li>
                    <li>Review status, priority, and timestamps</li>
                    <li>Read landlord notes and updates</li>
                    <li>View original photos you uploaded</li>
                    <li>Track estimated vs actual completion times</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Following Up on Faults</h4>
                  <p className="text-gray-700 ml-4 mb-2">
                    If progress seems slow:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Check fault status first - landlord may have added notes</li>
                    <li>Allow reasonable time based on priority (urgent: 24hrs, high: 3 days, medium: 1 week)</li>
                    <li>Use community board to politely inquire about progress</li>
                    <li>Provide additional photos or information if requested</li>
                    <li>For urgent unresolved issues, contact property manager directly using details on your dashboard</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-green-900"><strong>✅ Completion Verification:</strong> When a fault is marked complete, check the repair thoroughly. If issue persists, you can report a follow-up fault referencing the original report number.</p>
                </div>
              </CardContent>
            </Card>

            {/* Property Information */}
            <Card id="tenant-property-info" className="scroll-mt-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  Viewing Property Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Property Details Available</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li><strong>Building Information:</strong> Property name, full address, type, and units</li>
                    <li><strong>Manager Contact:</strong> Property manager email for urgent matters</li>
                    <li><strong>Property Code:</strong> Your unique 5-character code for quick fault reporting</li>
                    <li><strong>QR Code:</strong> Scan to quickly access fault reporting</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Compliance Certificates (If Enabled)</h4>
                  <p className="text-gray-700 ml-4 mb-2">
                    If your landlord has enabled visibility, you can view:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li><strong>Gas Safety Certificate:</strong> Expiry date and status (valid/expiring/expired)</li>
                    <li><strong>Electrical Certificate:</strong> Last inspection and expiry</li>
                    <li><strong>EPC (Energy Performance Certificate):</strong> Energy rating and expiry</li>
                    <li>Green badge = valid, Amber = expiring soon, Red = expired</li>
                    <li>Your landlord receives automatic reminders to renew</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Why Compliance Matters to You</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li><strong>Safety:</strong> Valid certificates mean your home meets safety standards</li>
                    <li><strong>Legal Protection:</strong> Landlord legally required to maintain valid certificates</li>
                    <li><strong>Energy Efficiency:</strong> EPC rating shows how energy efficient your home is</li>
                    <li>If certificates are expired, you can politely remind landlord via community board</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Community */}
            <Card id="tenant-community" className="scroll-mt-24">
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
                    <li>Access from main menu - shows all messages for your property</li>
                    <li><strong>View Announcements:</strong> Official notices from landlord (read-only)</li>
                    <li><strong>Read Messages:</strong> Updates and information from landlord and other tenants</li>
                    <li><strong>Post Messages:</strong> Share information or questions with your community</li>
                    <li><strong>Reply to Messages:</strong> Join discussions and answer questions</li>
                    <li>Important messages appear with a red "Important" badge at the top</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Posting Etiquette</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Be respectful and courteous to other tenants</li>
                    <li>Keep messages relevant to the building community</li>
                    <li>Don't share personal contact information publicly</li>
                    <li>Use for lost & found, community events, and helpful tips</li>
                    <li>Avoid using for complaints - use fault reporting instead</li>
                    <li>Report inappropriate messages to your landlord</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">What to Use Community Board For</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Lost and found items</li>
                    <li>Organizing building social events</li>
                    <li>Sharing useful tips (e.g., good local services)</li>
                    <li>Asking about building procedures</li>
                    <li>Coordinating with neighbors (package acceptance, etc.)</li>
                    <li>Community initiatives (cleaning, improvements)</li>
                  </ul>
                </div>
                <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                  <p className="text-sm text-cyan-900"><strong>🤝 Build Community:</strong> Engaging with the community board helps create a friendly, supportive building environment. Introduce yourself when you move in!</p>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card id="tenant-documents" className="scroll-mt-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Accessing Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Available Documents</h4>
                  <p className="text-gray-700 ml-4 mb-2">
                    Your landlord can upload various documents for your access:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li><strong>Lease Agreement:</strong> Your rental contract and addendums</li>
                    <li><strong>Building Rules:</strong> Property rules and regulations</li>
                    <li><strong>Safety Certificates:</strong> Gas, electrical, and EPC certificates</li>
                    <li><strong>Inspection Reports:</strong> Property condition reports</li>
                    <li><strong>Insurance Information:</strong> Building insurance details</li>
                    <li><strong>Emergency Contacts:</strong> Important contact lists</li>
                    <li><strong>Move-in/Move-out Checklists:</strong> Condition documentation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Viewing & Downloading Documents</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Navigate to Documents page from main menu</li>
                    <li>See all documents uploaded for your property</li>
                    <li>Documents are organized by type with icons</li>
                    <li>Check expiry dates on time-sensitive documents</li>
                    <li>Click "View" to open documents in browser</li>
                    <li>Download important documents to your device for offline access</li>
                    <li>Keep digital copies of your lease and condition reports</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Document Security & Privacy</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>You can only view documents for YOUR property</li>
                    <li>All documents are encrypted and stored securely</li>
                    <li>Documents remain accessible throughout your tenancy</li>
                    <li>Download copies before moving out</li>
                    <li>Only you and your landlord can access these documents</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">What to Do If Documents Are Missing</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Check if your landlord has uploaded documents yet</li>
                    <li>Politely request specific documents via community board or email</li>
                    <li>Landlords are legally required to provide certain documents (lease, gas certificate, etc.)</li>
                    <li>Keep personal copies as backup</li>
                  </ul>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <p className="text-sm text-indigo-900"><strong>📄 Important:</strong> Download and save your lease agreement as soon as it's available. You'll need it for reference throughout your tenancy.</p>
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
              <li>Keep compliance certificates up to date to avoid expiry warnings and legal issues</li>
              <li>Respond to faults within 24 hours to maintain tenant satisfaction</li>
              <li>Use the community board for important announcements and building updates</li>
              <li>Regularly review property reports to identify trends and prevent major issues</li>
              <li>Invite tenants to the platform immediately when they move in</li>
              <li>Upload important documents promptly for easy tenant access</li>
              <li>Update fault statuses regularly to keep tenants informed</li>
            </ul>
            <p className="pt-3"><strong>For Tenants:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Always take clear photos when reporting faults for faster resolution</li>
              <li>Provide detailed descriptions to help landlords diagnose issues correctly</li>
              <li>Use AI suggestions for temporary fixes while waiting for repairs</li>
              <li>Check the community board regularly for important updates</li>
              <li>Report faults promptly - small issues can become big problems</li>
              <li>Be patient and understanding - repairs take time to coordinate</li>
              <li>Maintain open communication with your landlord via the platform</li>
            </ul>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="mt-8 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-gray-900">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Can I use the platform on mobile?</h4>
              <p className="text-gray-700 text-sm">Yes! The platform is fully responsive and works on all devices - desktop, tablet, and mobile.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Is my data secure?</h4>
              <p className="text-gray-700 text-sm">Absolutely. All data is encrypted and stored securely. We follow industry best practices for data security.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Can tenants see each other's fault reports?</h4>
              <p className="text-gray-700 text-sm">No. Tenants can only see their own fault reports. Only landlords can see all faults for their properties.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">What happens if I cancel my subscription?</h4>
              <p className="text-gray-700 text-sm">Your data is kept for 30 days. You can reactivate anytime within this period without data loss.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Can I export my data?</h4>
              <p className="text-gray-700 text-sm">Yes! You can export property data, fault reports, and documents anytime as CSV files.</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300">
            <CardContent className="py-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Need More Help?</h3>
              <p className="text-gray-600 mb-4">
                If you have questions not covered in this guide, our support team is here to help
              </p>
              <div className="space-y-2">
                <p className="text-blue-600 font-semibold">📧 support@landlordmonitor.com</p>
                <p className="text-gray-700">📞 +44 20 1234 5678</p>
                <p className="text-sm text-gray-500 mt-3">
                  Support hours: Monday - Friday, 9am - 5pm GMT
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function Help() {
  return (
    <ProtectedRoute>
      <HelpContent />
    </ProtectedRoute>
  );
}