import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, Sparkles, Users, Link as LinkIcon, Plus, X, Loader2, Send, User, AtSign } from "lucide-react";
import { toast } from "sonner";

export default function EmailMarketing() {
  const [recipientType, setRecipientType] = useState("landlords");
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailSignature, setEmailSignature] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [affiliateLinks, setAffiliateLinks] = useState([]);
  const [newLinkName, setNewLinkName] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [generatingEmail, setGeneratingEmail] = useState(false);

  const { data: users = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list()
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (emailData) => {
      const promises = emailData.recipients.map(recipient => {
        // Personalize email for each recipient
        let personalizedBody = emailData.body
          .replace(/\{\{name\}\}/g, recipient.full_name || 'there')
          .replace(/\{\{email\}\}/g, recipient.email || '')
          .replace(/\{\{first_name\}\}/g, (recipient.full_name || '').split(' ')[0] || 'there');

        // Add signature if provided
        if (emailData.signature) {
          personalizedBody += `<br><br>${emailData.signature}`;
        }

        return base44.integrations.Core.SendEmail({
          to: recipient.email,
          subject: emailData.subject,
          body: personalizedBody
        });
      });
      await Promise.all(promises);
    },
    onSuccess: (_, variables) => {
      toast.success(`Email sent to ${variables.recipients.length} recipient(s)`);
      setEmailSubject("");
      setEmailBody("");
      setAiPrompt("");
    },
    onError: () => {
      toast.error("Failed to send emails");
    }
  });

  const getFilteredRecipients = () => {
    let filtered = users.filter(u => u.user_type === recipientType.slice(0, -1));
    
    if (recipientType === "landlords" && subscriptionFilter !== "all") {
      filtered = filtered.filter(u => u.subscription_plan === subscriptionFilter);
    }
    
    return filtered;
  };

  const recipients = getFilteredRecipients();

  const addAffiliateLink = () => {
    if (newLinkName && newLinkUrl) {
      setAffiliateLinks([...affiliateLinks, { name: newLinkName, url: newLinkUrl }]);
      setNewLinkName("");
      setNewLinkUrl("");
    }
  };

  const removeAffiliateLink = (index) => {
    setAffiliateLinks(affiliateLinks.filter((_, i) => i !== index));
  };

  const insertToken = (token) => {
    setEmailBody(emailBody + token);
  };

  const generateEmailWithAI = async () => {
    if (!aiPrompt) {
      toast.error("Please enter a prompt");
      return;
    }

    setGeneratingEmail(true);
    try {
      const affiliateContext = affiliateLinks.length > 0
        ? `\n\nAffiliate Links (incorporate these naturally where appropriate):\n${affiliateLinks.map(link => `- ${link.name}: ${link.url}`).join('\n')}`
        : '';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a professional email marketing copywriter for a property management SaaS platform.
        
Target Audience: ${recipientType === 'landlords' ? 'Landlords and property managers' : 'Tenants'}
${recipientType === 'landlords' && subscriptionFilter !== 'all' ? `Subscription Level: ${subscriptionFilter}` : ''}

Task: ${aiPrompt}${affiliateContext}

Generate a professional email with:
1. An engaging subject line (max 60 characters)
2. A well-structured email body with proper formatting
3. Use personalization tokens: {{name}} for full name, {{first_name}} for first name only, {{email}} for email address
4. If affiliate links are provided, incorporate them naturally into the content where they add value
5. Keep the tone professional yet friendly
6. Include a clear call-to-action
7. Do NOT include a signature - this will be added separately

Return the result as JSON with "subject" and "body" fields. For the body, use HTML formatting with <p>, <br>, <strong>, <a> tags.`,
        response_json_schema: {
          type: "object",
          properties: {
            subject: { type: "string" },
            body: { type: "string" }
          }
        }
      });

      setEmailSubject(result.subject);
      setEmailBody(result.body);
      toast.success("Email generated successfully!");
    } catch (error) {
      toast.error("Failed to generate email");
    }
    setGeneratingEmail(false);
  };

  const sendEmail = () => {
    if (!emailSubject || !emailBody) {
      toast.error("Please provide subject and body");
      return;
    }

    if (recipients.length === 0) {
      toast.error("No recipients selected");
      return;
    }

    sendEmailMutation.mutate({
      recipients,
      subject: emailSubject,
      body: emailBody,
      signature: emailSignature
    });
  };

  return (
    <div className="space-y-6">
      {/* Recipient Selection */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Select Recipients
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Recipient Type</Label>
              <Select value={recipientType} onValueChange={setRecipientType}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landlords">Landlords</SelectItem>
                  <SelectItem value="tenants">Tenants</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {recipientType === "landlords" && (
              <div>
                <Label className="text-gray-300">Subscription Filter</Label>
                <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="free">Free/Trial</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-white font-semibold mb-2">
              Selected Recipients: {recipients.length}
            </p>
            <div className="flex flex-wrap gap-2">
              {recipients.slice(0, 10).map(user => (
                <Badge key={user.id} variant="outline" className="text-gray-300">
                  {user.email}
                </Badge>
              ))}
              {recipients.length > 10 && (
                <Badge variant="outline" className="text-gray-400">
                  +{recipients.length - 10} more
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Affiliate Links */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-green-400" />
            Affiliate Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Link Name</Label>
              <Input
                value={newLinkName}
                onChange={(e) => setNewLinkName(e.target.value)}
                placeholder="e.g., Insurance Provider"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Link URL</Label>
              <div className="flex gap-2">
                <Input
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <Button
                  onClick={addAffiliateLink}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {affiliateLinks.length > 0 && (
            <div className="space-y-2">
              {affiliateLinks.map((link, index) => (
                <div key={index} className="bg-gray-700 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">{link.name}</p>
                    <p className="text-sm text-gray-400 truncate">{link.url}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAffiliateLink(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Email Generation */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Email Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-300">Describe the email you want to send</Label>
            <Textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g., Create a promotional email about our new property management features, highlighting the benefits for landlords with multiple properties. Include a special discount offer."
              rows={4}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <Button
            onClick={generateEmailWithAI}
            disabled={generatingEmail || !aiPrompt}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {generatingEmail ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Email...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Email with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Email Composition */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-cyan-400" />
            Email Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-300">Subject Line</Label>
            <Input
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Enter email subject"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          {/* Personalization Tokens */}
          <div>
            <Label className="text-gray-300 mb-2 block">Personalization Tokens</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => insertToken('{{name}}')}
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                <User className="w-3 h-3 mr-1" />
                {'{{name}}'} - Full Name
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => insertToken('{{first_name}}')}
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                <User className="w-3 h-3 mr-1" />
                {'{{first_name}}'} - First Name
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => insertToken('{{email}}')}
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                <AtSign className="w-3 h-3 mr-1" />
                {'{{email}}'} - Email
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Click to insert tokens into your email body</p>
          </div>

          <div>
            <Label className="text-gray-300">Email Body</Label>
            <Textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Enter email content (HTML supported)"
              rows={12}
              className="bg-gray-700 border-gray-600 text-white font-mono text-sm"
            />
          </div>

          <div>
            <Label className="text-gray-300">Email Signature (Optional)</Label>
            <Textarea
              value={emailSignature}
              onChange={(e) => setEmailSignature(e.target.value)}
              placeholder="Enter your signature (HTML supported)&#10;&#10;e.g.,&#10;Best regards,&#10;John Smith&#10;Platform Administrator"
              rows={4}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          {emailBody && (
            <div>
              <Label className="text-gray-300 mb-2 block">Preview (with sample data)</Label>
              <div className="bg-white p-6 rounded-lg">
                <div dangerouslySetInnerHTML={{ 
                  __html: emailBody
                    .replace(/\{\{name\}\}/g, 'John Doe')
                    .replace(/\{\{first_name\}\}/g, 'John')
                    .replace(/\{\{email\}\}/g, 'john.doe@example.com') +
                    (emailSignature ? `<br><br>${emailSignature}` : '')
                }} />
              </div>
            </div>
          )}

          <Button
            onClick={sendEmail}
            disabled={sendEmailMutation.isPending || !emailSubject || !emailBody || recipients.length === 0}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-lg py-6"
          >
            {sendEmailMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Sending to {recipients.length} recipient(s)...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Send Email to {recipients.length} Recipient(s)
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}