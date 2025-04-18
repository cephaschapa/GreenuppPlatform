import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

const AiKnowledgeBasePage = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">AI Knowledge Base</h1>
      <Link href="/">
        <Button>Back to Home</Button>
      </Link>
      <div className="mt-4">
        <p>This is a simple AI Knowledge Base page.</p>
      </div>
    </div>
  );
};

export default AiKnowledgeBasePage;