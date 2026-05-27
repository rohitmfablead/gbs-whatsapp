import React from 'react';
import heroImage from '@/assets/dashboard-hero.jpg';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
      <div className="text-center max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <img 
            src={heroImage} 
            alt="Rabeet WA-Broadcast Dashboard" 
            className="w-full max-w-3xl mx-auto rounded-2xl shadow-elegant"
          />
        </div>
        <h1 className="text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
          Welcome to Rabeet WA-Broadcast
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Professional WhatsApp marketing platform for businesses. Manage contacts, create templates, 
          send bulk messages, and track campaign performance with our powerful analytics.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="/login" 
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary-foreground bg-gradient-primary rounded-xl hover:shadow-glow transition-all duration-300 hover:scale-105"
          >
            Get Started
          </a>
          <a 
            href="/register" 
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-foreground bg-card border border-border rounded-xl hover:bg-accent transition-all duration-300"
          >
            Create Account
          </a>
        </div>
      </div>
    </div>
  );
};

export default Index;
