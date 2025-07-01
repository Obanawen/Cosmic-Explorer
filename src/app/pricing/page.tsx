'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown } from 'lucide-react';

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: "default" | "outline";
  popular?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for getting started with AI text grading",
    features: [
      "5 image uploads per month",
      "Basic text analysis",
      "Standard grading reports",
      "Email support",
      "Community access"
    ],
    buttonText: "Get Started Free",
    buttonVariant: "outline",
    icon: Star,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "Ideal for teachers and frequent users",
    features: [
      "100 image uploads per month",
      "Advanced text analysis",
      "Detailed grading reports",
      "Priority email support",
      "Export results to PDF",
      "Batch processing",
      "Custom grading criteria"
    ],
    buttonText: "Start Pro Trial",
    buttonVariant: "default",
    popular: true,
    icon: Zap,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/month",
    description: "For schools and organizations",
    features: [
      "Unlimited image uploads",
      "AI-powered insights",
      "Comprehensive analytics",
      "24/7 phone support",
      "API access",
      "Team collaboration",
      "Custom integrations",
      "Advanced security",
      "Dedicated account manager"
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline",
    icon: Crown,
  },
];

const faqs = [
  {
    question: "Can I change my plan anytime?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and you'll be charged or credited accordingly."
  },
  {
    question: "What types of text can be analyzed?",
    answer: "Our AI can analyze handwritten text, printed documents, screenshots, photos of whiteboards, and any image containing readable text."
  },
  {
    question: "Is there a free trial for paid plans?",
    answer: "Yes, we offer a 14-day free trial for all paid plans. No credit card required to start your trial."
  },
  {
    question: "How accurate is the AI grading?",
    answer: "Our AI achieves 95%+ accuracy in text analysis and grading, with continuous improvements based on user feedback and data."
  },
  {
    question: "Can I export my results?",
    answer: "Pro and Enterprise users can export results to PDF, CSV, and other formats. Free users can copy results to clipboard."
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Choose the perfect plan for your AI text grading needs. 
            All plans include our core features with no hidden fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier) => (
            <Card 
              key={tier.name} 
              className={`relative ${
                tier.popular 
                  ? 'border-2 border-blue-500 shadow-lg scale-105' 
                  : 'border border-gray-200'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  <tier.icon className={`h-8 w-8 ${
                    tier.popular ? 'text-blue-500' : 'text-gray-600'
                  }`} />
                </div>
                <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                  <span className="text-gray-600">{tier.period}</span>
                </div>
                <p className="text-gray-600 mt-2">{tier.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full" 
                  variant={tier.buttonVariant}
                  size="lg"
                >
                  {tier.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">What&apos;s Included</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">AI-Powered Analysis</h3>
                <p className="text-gray-600 text-sm">
                  Advanced machine learning algorithms analyze text quality, grammar, and content.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Instant Results</h3>
                <p className="text-gray-600 text-sm">
                  Get detailed grading reports and feedback within seconds of uploading.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Crown className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Professional Reports</h3>
                <p className="text-gray-600 text-sm">
                  Comprehensive reports with scores, feedback, and improvement suggestions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-blue-100 text-lg mb-6">
              Join thousands of users who trust AI Text Grader for accurate, instant feedback.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Contact Sales
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 