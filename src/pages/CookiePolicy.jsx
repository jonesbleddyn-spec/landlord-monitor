import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cookie } from "lucide-react";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Cookie className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
          <p className="text-gray-600">Last Updated: November 18, 2025</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. What Are Cookies?</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p>
                Cookies are small text files that are stored on your device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences and understanding how you use our platform.
              </p>
              <p>
                Cookies contain information that is transferred to your device's hard drive. They are widely used to make websites work more efficiently 
                and provide information to website owners.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Types of Cookies We Use</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-4">
              <div>
                <h4 className="font-semibold mb-2">2.1 Strictly Necessary Cookies</h4>
                <p className="mb-2">
                  These cookies are essential for the platform to function properly. They enable core functionality such as:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>User authentication and security</li>
                  <li>Session management</li>
                  <li>Load balancing</li>
                  <li>Fraud prevention</li>
                </ul>
                <p className="mt-2 text-sm italic">
                  <strong>Duration:</strong> Session or up to 30 days
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2.2 Functional Cookies</h4>
                <p className="mb-2">
                  These cookies allow the platform to remember choices you make and provide enhanced features:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Language preferences</li>
                  <li>User interface customizations</li>
                  <li>Remember your login details (if you choose)</li>
                  <li>Form data retention</li>
                </ul>
                <p className="mt-2 text-sm italic">
                  <strong>Duration:</strong> Up to 1 year
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2.3 Performance and Analytics Cookies</h4>
                <p className="mb-2">
                  These cookies help us understand how visitors interact with our platform:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Number of visitors and page views</li>
                  <li>How visitors navigate through the platform</li>
                  <li>Which features are most popular</li>
                  <li>Error tracking and performance monitoring</li>
                  <li>Time spent on pages</li>
                </ul>
                <p className="mt-2 text-sm italic">
                  <strong>Duration:</strong> Up to 2 years
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2.4 Targeting/Advertising Cookies (if applicable)</h4>
                <p className="mb-2">
                  We may use these cookies to deliver relevant advertisements:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Track your interests and browsing patterns</li>
                  <li>Deliver personalized content</li>
                  <li>Limit ad frequency</li>
                  <li>Measure ad effectiveness</li>
                </ul>
                <p className="mt-2 text-sm italic">
                  <strong>Duration:</strong> Up to 1 year
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Third-Party Cookies</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p>
                We use various third-party services that may set their own cookies:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Authentication Services:</strong> To enable secure login and account management</li>
                <li><strong>Payment Processors:</strong> To process subscription payments securely</li>
                <li><strong>AI Services:</strong> To provide intelligent suggestions and analysis</li>
                <li><strong>Email Services:</strong> To send notifications and communications</li>
                <li><strong>Analytics Providers:</strong> To understand platform usage and improve performance</li>
              </ul>
              <p className="mt-3">
                These third parties have their own privacy and cookie policies. We recommend reviewing their policies to understand 
                how they use cookies.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. How We Use Cookies</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p>We use cookies for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Authentication:</strong> To keep you logged in and maintain your session</li>
                <li><strong>Personalization:</strong> To remember your preferences and settings</li>
                <li><strong>Security:</strong> To protect your account and detect fraudulent activity</li>
                <li><strong>Performance:</strong> To optimize loading times and platform responsiveness</li>
                <li><strong>Analytics:</strong> To understand how users interact with the platform</li>
                <li><strong>Improvement:</strong> To identify areas for enhancement and fix issues</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Managing Your Cookie Preferences</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p>You have control over which cookies you accept:</p>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 my-3">
                <h4 className="font-semibold text-blue-900 mb-2">Browser Settings</h4>
                <p className="text-sm text-blue-800">
                  Most web browsers allow you to control cookies through settings. You can typically:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-blue-800 mt-2">
                  <li>View and delete existing cookies</li>
                  <li>Block all cookies</li>
                  <li>Block third-party cookies</li>
                  <li>Clear cookies when closing the browser</li>
                  <li>Set exceptions for specific websites</li>
                </ul>
              </div>

              <p>
                Please note that blocking or deleting cookies may impact your experience on the platform. 
                Some features may not work properly without cookies enabled.
              </p>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mt-3">
                <h4 className="font-semibold text-amber-900 mb-2">⚠️ Important Note</h4>
                <p className="text-sm text-amber-800">
                  If you disable strictly necessary cookies, you may not be able to use key features of the platform, 
                  including logging in and accessing your account.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Cookie Consent</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p>
                When you first visit our platform, we will ask for your consent to use non-essential cookies. 
                You can choose to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Accept All:</strong> Consent to all cookies for the best experience</li>
                <li><strong>Decline Optional:</strong> Only use strictly necessary cookies</li>
                <li><strong>Customize:</strong> Choose which types of cookies you want to accept</li>
              </ul>
              <p className="mt-3">
                You can change your preferences at any time by clearing your browser cookies or updating your settings.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Do Not Track Signals</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p>
                Some browsers have a "Do Not Track" (DNT) feature that signals to websites that you do not want to be tracked. 
                Currently, there is no industry standard for how to respond to DNT signals.
              </p>
              <p>
                We respect your privacy choices and will comply with DNT signals where technically feasible and legally required.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Updates to Cookie Policy</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p>
                We may update this Cookie Policy from time to time to reflect changes in our practices or for legal reasons. 
                We will notify you of any significant changes by posting the new policy on this page and updating the "Last Updated" date.
              </p>
              <p>
                We encourage you to review this policy periodically to stay informed about how we use cookies.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. More Information</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p>
                For more information about how we collect and use your data, please see our:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
              <p className="mt-3">
                If you have questions about our use of cookies, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-3">
                <p><strong>Email:</strong> support@landlordmonitor.com</p>
                <p><strong>Phone:</strong> +44 20 1234 5678</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Useful Resources</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-3">
              <p>
                For more information about cookies and how to manage them, visit:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>AboutCookies.org</li>
                <li>AllAboutCookies.org</li>
                <li>Your browser's help section</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-6 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-gray-700">
            <strong>By continuing to use our platform, you consent to our use of cookies as described in this Cookie Policy.</strong>
          </p>
        </div>
      </div>
    </div>
  );
}