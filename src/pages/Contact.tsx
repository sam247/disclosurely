import React, { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Footer } from "@/components/ui/footer";
import { Link } from "react-router-dom";
import PublicLanguageSelector from "@/components/PublicLanguageSelector";
import DynamicHelmet from "@/components/DynamicHelmet";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { useLanguageFromUrl } from "@/hooks/useLanguageFromUrl";
import { useTranslation } from "react-i18next";

const Contact = () => {
  useLanguageFromUrl();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Send email via edge function or email service
      const response = await fetch("https://cxmuzperkittvibslnff.supabase.co/functions/v1/send-contact-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: "team@disclsourely.com",
          ...formData,
        }),
      });

      if (response.ok) {
        alert(t("contact.form.success") || "Thank you for your message! We will get back to you within 24 hours.");
        setFormData({ name: "", email: "", company: "", message: "" });
      } else {
        alert(
          t("contact.form.error") || "There was an error sending your message. Please try again or email us directly.",
        );
      }
    } catch (error) {
      console.error("Contact form error:", error);
      alert(
        t("contact.form.error") || "There was an error sending your message. Please email us at team@disclosurely.com",
      );
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <DynamicHelmet
        pageIdentifier="contact"
        fallbackTitle={t("contact.meta.title")}
        fallbackDescription={t("contact.meta.description")}
      />
      <div className="min-h-screen bg-white">
      {/* Announcement Bar */}
      <AnnouncementBar />
      
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img
                  src="/lovable-uploads/c46ace0e-df58-4119-b5e3-8dcfa075ea2f.png"
                  alt="Disclosurely"
                  className="h-5 sm:h-6 md:h-8 w-auto"
                />
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <PublicLanguageSelector />
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900">
                {t("nav.pricing")}
              </Link>
              <a
                href="https://app.disclosurely.com/auth/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t("nav.getStarted")}
              </a>
            </div>
            <div className="md:hidden flex items-center gap-1.5">
              <PublicLanguageSelector />
              <a
                href="https://app.disclosurely.com/auth/login"
                className="bg-blue-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-xs whitespace-nowrap"
              >
                {t("nav.signin")}
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">{t("contact.hero.title")}</h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">{t("contact.hero.description")}</p>
        </div>
      </div>

      {/* Contact Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("contact.info.title")}</h2>
              <p className="text-lg text-gray-600 mb-8">{t("contact.info.description")}</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t("contact.info.email.title")}</h3>
                  <p className="text-gray-600">{t("contact.info.email.address")}</p>
                  <p className="text-sm text-gray-500">{t("contact.info.email.response")}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t("contact.info.phone.title")}</h3>
                  <p className="text-gray-600">{t("contact.info.phone.number")}</p>
                  <p className="text-sm text-gray-500">{t("contact.info.phone.hours")}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t("contact.info.address.title")}</h3>
                  <p className="text-gray-600">
                    {t("contact.info.address.line1")}
                    <br />
                    {t("contact.info.address.line2")}
                    <br />
                    {t("contact.info.address.line3")}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">{t("contact.info.enterprise.title")}</h3>
              <p className="text-gray-600 text-sm">{t("contact.info.enterprise.description")}</p>
            </div>
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>{t("contact.form.title")}</CardTitle>
              <CardDescription>{t("contact.form.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("contact.form.name.label")}
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t("contact.form.name.placeholder")}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("contact.form.email.label")}
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t("contact.form.email.placeholder")}
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("contact.form.company.label")}
                  </label>
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    required
                    value={formData.company}
                    onChange={handleChange}
                    placeholder={t("contact.form.company.placeholder")}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("contact.form.message.label")}
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t("contact.form.message.placeholder")}
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  {t("contact.form.submit")}
                </Button>

                <p className="text-xs text-gray-500 text-center">{t("contact.form.privacy")}</p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
    </>
  );
};

export default Contact;
