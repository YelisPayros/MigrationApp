import React, { useEffect } from 'react';
import { createTables } from './src/components/database/db'
import AppNavigator from './src/components/AppNavigator';

export default function App() {
  useEffect(() => {
    createTables();
  }, []);

  return <AppNavigator />;
}
