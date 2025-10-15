import React from 'react';
import TestingPanel from '../components/TestingPanel';
import Layout from '../components/Layout';

const TestingPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <TestingPanel />
      </div>
    </Layout>
  );
};

export default TestingPage;